-- =========================================================
-- THÊM HÌNH THỨC GIAO HÀNG CHO DATABASE ĐANG SỬ DỤNG
-- Chạy file này một lần trong Supabase SQL Editor.
-- Không chạy lại create-table.sql vì file đó sẽ xóa dữ liệu hiện có.
-- =========================================================

BEGIN;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR;

-- Các đơn cũ và giá trị trống được mặc định là giao Tiêu chuẩn.
UPDATE public.orders
SET shipping_method = 'Tiêu chuẩn'
WHERE shipping_method IS NULL
   OR btrim(shipping_method) = ''
   OR shipping_method NOT IN ('Tiêu chuẩn', 'Hỏa tốc');

ALTER TABLE public.orders
ALTER COLUMN shipping_method SET DEFAULT 'Tiêu chuẩn';

ALTER TABLE public.orders
ALTER COLUMN shipping_method SET NOT NULL;

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_shipping_method_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_shipping_method_check CHECK (
  shipping_method IN ('Tiêu chuẩn', 'Hỏa tốc')
);

COMMENT ON COLUMN public.orders.shipping_method IS
'Hình thức giao hàng: Tiêu chuẩn hoặc Hỏa tốc';

-- Thay RPC checkout cũ bằng phiên bản có thể lưu hình thức giao hàng.
-- Tham số cuối có default nên code checkout cũ vẫn gọi được như trước.
DROP FUNCTION IF EXISTS public.checkout_cart(UUID, VARCHAR, VARCHAR, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.checkout_cart(UUID, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR);

CREATE FUNCTION public.checkout_cart(
  p_cart_id UUID,
  p_receiver_name VARCHAR,
  p_receiver_phone VARCHAR,
  p_shipping_address TEXT,
  p_note TEXT DEFAULT NULL,
  p_shipping_method VARCHAR DEFAULT 'Tiêu chuẩn'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_cart_status VARCHAR;
  existing_order_id UUID;
  new_order_id UUID;
  calculated_total DECIMAL(12,2);
  normalized_shipping_method VARCHAR := COALESCE(
    NULLIF(btrim(p_shipping_method), ''),
    'Tiêu chuẩn'
  );
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NULLIF(btrim(p_shipping_address), '') IS NULL THEN
    RAISE EXCEPTION 'Shipping address is required';
  END IF;

  IF normalized_shipping_method NOT IN ('Tiêu chuẩn', 'Hỏa tốc') THEN
    RAISE EXCEPTION 'Shipping method must be Tiêu chuẩn or Hỏa tốc';
  END IF;

  SELECT status
  INTO current_cart_status
  FROM public.carts
  WHERE id = p_cart_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart does not exist or does not belong to current user';
  END IF;

  SELECT id
  INTO existing_order_id
  FROM public.orders
  WHERE cart_id = p_cart_id
    AND user_id = current_user_id;

  IF existing_order_id IS NOT NULL THEN
    RETURN existing_order_id;
  END IF;

  IF current_cart_status <> 'active' THEN
    RAISE EXCEPTION 'Only an active cart can be checked out';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cart_items
    WHERE cart_id = p_cart_id
  ) THEN
    RAISE EXCEPTION 'Cannot checkout an empty cart';
  END IF;

  PERFORM product.id
  FROM public.products AS product
  JOIN public.cart_items AS item ON item.product_id = product.id
  WHERE item.cart_id = p_cart_id
  ORDER BY product.id
  FOR UPDATE OF product;

  IF EXISTS (
    SELECT 1
    FROM public.cart_items AS item
    JOIN public.products AS product ON product.id = item.product_id
    WHERE item.cart_id = p_cart_id
      AND (product.status <> 'active' OR product.stock < item.quantity)
  ) THEN
    RAISE EXCEPTION 'Cart contains an unavailable or insufficient-stock product';
  END IF;

  SELECT SUM(product.price * item.quantity)::DECIMAL(12,2)
  INTO calculated_total
  FROM public.cart_items AS item
  JOIN public.products AS product ON product.id = item.product_id
  WHERE item.cart_id = p_cart_id;

  INSERT INTO public.orders (
    user_id,
    cart_id,
    receiver_name,
    receiver_phone,
    shipping_address,
    shipping_method,
    total_price,
    status,
    note
  )
  VALUES (
    current_user_id,
    p_cart_id,
    NULLIF(btrim(p_receiver_name), ''),
    NULLIF(btrim(p_receiver_phone), ''),
    btrim(p_shipping_address),
    normalized_shipping_method,
    calculated_total,
    'pending',
    NULLIF(btrim(p_note), '')
  )
  RETURNING id INTO new_order_id;

  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    product_sku,
    quantity,
    price_at_purchase
  )
  SELECT
    new_order_id,
    product.id,
    product.name,
    product.sku,
    item.quantity,
    product.price
  FROM public.cart_items AS item
  JOIN public.products AS product ON product.id = item.product_id
  WHERE item.cart_id = p_cart_id;

  UPDATE public.products AS product
  SET
    stock = product.stock - item.quantity,
    status = CASE
      WHEN product.stock - item.quantity = 0 THEN 'out_of_stock'
      ELSE product.status
    END
  FROM public.cart_items AS item
  WHERE item.cart_id = p_cart_id
    AND item.product_id = product.id;

  RETURN new_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.checkout_cart(
  UUID, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.checkout_cart(
  UUID, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR
) FROM anon;

GRANT EXECUTE ON FUNCTION public.checkout_cart(
  UUID, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR
) TO authenticated;

COMMIT;

-- Kết quả kiểm tra phải chỉ có Tiêu chuẩn hoặc Hỏa tốc.
SELECT shipping_method, COUNT(*) AS number_of_orders
FROM public.orders
GROUP BY shipping_method
ORDER BY shipping_method;
