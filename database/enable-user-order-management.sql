-- =========================================================
-- BẬT QUẢN LÝ ĐƠN HÀNG CHO KHÁCH HÀNG
-- Chạy file này trên database Supabase đang sử dụng.
-- File idempotent và không xóa order, order_items hay sản phẩm hiện có.
-- =========================================================

BEGIN;

-- Migration có thể chạy độc lập: chuẩn hóa stock trước khi phép hoàn kho dùng nó.
ALTER TABLE public.products
ALTER COLUMN stock SET DEFAULT 0;

UPDATE public.products
SET
  stock = 0,
  status = CASE
    WHEN status = 'active' THEN 'out_of_stock'
    ELSE status
  END
WHERE stock IS NULL;

ALTER TABLE public.products
ALTER COLUMN stock SET NOT NULL;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS inventory_deducted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS inventory_restored_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.orders.inventory_deducted_at IS
'Thời điểm checkout thật đã trừ tồn kho trong cùng transaction';

COMMENT ON COLUMN public.orders.inventory_restored_at IS
'Thời điểm tồn kho đã được hoàn do hủy đơn; NULL nghĩa là chưa hoàn';

COMMENT ON COLUMN public.orders.cancelled_at IS
'Thời điểm đơn chuyển sang cancelled';

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at
ON public.orders(user_id, created_at DESC, id DESC);

-- Checkout chạy dưới JWT của chính khách hàng. Trigger này là lớp tương thích
-- cho RPC checkout cũ: order chỉ được đánh dấu trong cùng transaction đã tạo nó.
-- Seed bằng service_role không có auth.uid() người mua nên không bị đánh dấu.
CREATE OR REPLACE FUNCTION public.mark_authenticated_checkout_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.inventory_deducted_at IS NULL
      AND auth.uid() IS NOT NULL
      AND NEW.user_id = auth.uid() THEN
    NEW.inventory_deducted_at := statement_timestamp();
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_authenticated_checkout_inventory()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS mark_authenticated_checkout_inventory
ON public.orders;

CREATE TRIGGER mark_authenticated_checkout_inventory
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.mark_authenticated_checkout_inventory();

-- Mọi chuyển trạng thái đi qua state machine này. Nhánh pending -> cancelled
-- hoàn tồn kho từ order_items và ghi dấu để không thể hoàn hai lần.
CREATE OR REPLACE FUNCTION public.guard_order_status_and_restore_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  expected_product_count INT := 0;
  restored_product_count INT := 0;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'pending' AND NEW.status = 'cancelled' THEN
    IF OLD.inventory_deducted_at IS NULL THEN
      RAISE EXCEPTION 'Cannot cancel: inventory deduction for this order cannot be verified';
    END IF;

    IF OLD.inventory_restored_at IS NOT NULL THEN
      RAISE EXCEPTION 'Order inventory was already restored';
    END IF;

    SELECT COUNT(DISTINCT item.product_id)::INT
    INTO expected_product_count
    FROM public.order_items AS item
    WHERE item.order_id = OLD.id;

    IF expected_product_count = 0 THEN
      RAISE EXCEPTION 'Order has no inventory snapshot';
    END IF;

    -- Cùng thứ tự khóa với checkout để tránh oversell/deadlock.
    PERFORM product.id
    FROM public.products AS product
    JOIN (
      SELECT DISTINCT item.product_id
      FROM public.order_items AS item
      WHERE item.order_id = OLD.id
    ) AS ordered_product ON ordered_product.product_id = product.id
    ORDER BY product.id
    FOR UPDATE OF product;

    UPDATE public.products AS product
    SET
      stock = product.stock + restored.quantity,
      status = CASE
        WHEN product.status = 'out_of_stock'
          AND product.stock + restored.quantity > 0
        THEN 'active'
        ELSE product.status
      END
    FROM (
      SELECT
        item.product_id,
        SUM(item.quantity)::INT AS quantity
      FROM public.order_items AS item
      WHERE item.order_id = OLD.id
      GROUP BY item.product_id
    ) AS restored
    WHERE product.id = restored.product_id;

    GET DIAGNOSTICS restored_product_count = ROW_COUNT;

    IF restored_product_count <> expected_product_count THEN
      RAISE EXCEPTION
        'Inventory restore mismatch: expected %, restored %',
        expected_product_count,
        restored_product_count;
    END IF;

    NEW.cancelled_at := COALESCE(NEW.cancelled_at, statement_timestamp());
    NEW.inventory_restored_at := statement_timestamp();
    RETURN NEW;
  END IF;

  IF OLD.status = 'pending' AND NEW.status = 'processing' THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'processing' AND NEW.status = 'completed' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION
    'Illegal order status transition: % -> %',
    OLD.status,
    NEW.status;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_order_status_and_restore_inventory()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_order_status_and_restore_inventory
ON public.orders;

CREATE TRIGGER guard_order_status_and_restore_inventory
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.guard_order_status_and_restore_inventory();

-- Khách hàng chỉ có thể hủy order của chính mình khi còn pending. Trigger phía
-- trên chịu trách nhiệm hoàn kho và khóa state transition trong cùng transaction.
DROP FUNCTION IF EXISTS public.cancel_pending_order(UUID);

CREATE OR REPLACE FUNCTION public.cancel_pending_order(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_order_status VARCHAR;
  deducted_at TIMESTAMP WITH TIME ZONE;
  restored_units BIGINT := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'Order id is required';
  END IF;

  SELECT status, inventory_deducted_at
  INTO current_order_status, deducted_at
  FROM public.orders
  WHERE id = p_order_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order does not exist or does not belong to current user';
  END IF;

  -- Retry an toàn: trigger đã hoàn kho ở lần đầu, lần sau không cộng thêm.
  IF current_order_status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'order_id', p_order_id,
      'status', 'cancelled',
      'restored_units', 0,
      'already_cancelled', true
    );
  END IF;

  IF current_order_status <> 'pending' THEN
    RAISE EXCEPTION 'Only a pending order can be cancelled';
  END IF;

  IF deducted_at IS NULL THEN
    RAISE EXCEPTION 'Cannot cancel: inventory deduction for this order cannot be verified';
  END IF;

  SELECT COALESCE(SUM(item.quantity), 0)::BIGINT
  INTO restored_units
  FROM public.order_items AS item
  WHERE item.order_id = p_order_id;

  UPDATE public.orders
  SET status = 'cancelled'
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'order_id', p_order_id,
    'status', 'cancelled',
    'restored_units', restored_units,
    'already_cancelled', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_pending_order(UUID)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_pending_order(UUID) TO authenticated;

-- Admin chỉ được tiến đơn theo state machine: pending -> processing -> completed.
-- expected_status giúp request cũ/stale không vô tình chuyển trạng thái lần nữa.
DROP FUNCTION IF EXISTS public.advance_order_status(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.advance_order_status(
  p_order_id UUID,
  p_expected_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_order_status VARCHAR;
  next_order_status VARCHAR;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Admin role required';
  END IF;

  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'Order id is required';
  END IF;

  SELECT status
  INTO current_order_status
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order does not exist';
  END IF;

  IF p_expected_status IS NULL
      OR current_order_status IS DISTINCT FROM p_expected_status THEN
    RAISE EXCEPTION
      'Order status changed: expected %, current %',
      p_expected_status,
      current_order_status;
  END IF;

  next_order_status := CASE current_order_status
    WHEN 'pending' THEN 'processing'
    WHEN 'processing' THEN 'completed'
    ELSE NULL
  END;

  IF next_order_status IS NULL THEN
    RAISE EXCEPTION
      'Order cannot be advanced from status %',
      current_order_status;
  END IF;

  UPDATE public.orders
  SET status = next_order_status
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'order_id', p_order_id,
    'previous_status', current_order_status,
    'status', next_order_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.advance_order_status(UUID, TEXT)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.advance_order_status(UUID, TEXT)
TO authenticated;

-- Status không được cập nhật trực tiếp từ client. Backend/admin muốn chuyển
-- trạng thái phải dùng RPC có kiểm tra transition; note vẫn theo RLS admin.
REVOKE INSERT, DELETE ON public.orders FROM PUBLIC, anon, authenticated;
REVOKE UPDATE ON public.orders FROM authenticated;
REVOKE UPDATE (status, note) ON public.orders FROM authenticated;
GRANT UPDATE (note) ON public.orders TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Kết quả mong đợi: false, false, true, true, false.
SELECT has_table_privilege(
  'authenticated',
  'public.orders',
  'INSERT'
) AS authenticated_can_insert_orders;

SELECT has_column_privilege(
  'authenticated',
  'public.orders',
  'status',
  'UPDATE'
) AS authenticated_can_update_order_status;

SELECT has_function_privilege(
  'authenticated',
  'public.cancel_pending_order(UUID)',
  'EXECUTE'
) AS authenticated_can_cancel_pending_order;

SELECT has_function_privilege(
  'authenticated',
  'public.advance_order_status(UUID, TEXT)',
  'EXECUTE'
) AS authenticated_can_call_admin_order_transition;

SELECT prosecdef AS checkout_marker_is_security_definer
FROM pg_proc
WHERE oid = 'public.mark_authenticated_checkout_inventory()'::regprocedure;
