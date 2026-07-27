-- =========================================================
-- TECH.NO DATABASE SCHEMA - FULL RESET VERSION
-- Dành cho Supabase project mới hoặc database demo có thể reset
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- 0. DROP OLD TABLES
-- =========================================================

DROP FUNCTION IF EXISTS public.list_product_reviews(UUID);
DROP FUNCTION IF EXISTS public.create_product_review(UUID, INT, TEXT);
DROP FUNCTION IF EXISTS public.get_admin_category_sales();
DROP FUNCTION IF EXISTS public.get_admin_monthly_metrics(INTEGER);
DROP FUNCTION IF EXISTS public.get_admin_dashboard_kpis();
DROP FUNCTION IF EXISTS public.advance_order_status(UUID, TEXT);
DROP FUNCTION IF EXISTS public.list_my_notifications(INTEGER);
DROP FUNCTION IF EXISTS public.get_my_unread_notification_count();
DROP FUNCTION IF EXISTS public.mark_my_notification_read(UUID);
DROP FUNCTION IF EXISTS public.mark_all_my_notifications_read();
DROP FUNCTION IF EXISTS public.create_order_notifications() CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.product_reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
-- Bảng legacy trước khi tách carts/cart_items.
DROP TABLE IF EXISTS public.cart CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =========================================================
-- 1. USERS
-- Liên kết trực tiếp với Supabase Auth: auth.users
-- =========================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR UNIQUE NOT NULL,
  display_name VARCHAR,
  phone VARCHAR DEFAULT NULL,
  address TEXT DEFAULT NULL,
  role VARCHAR NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin'))
);

-- =========================================================
-- 2. CATEGORIES
-- id phải khớp với frontend: phone, laptop, pc, phukien
-- =========================================================

CREATE TABLE public.categories (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO public.categories (id, name, description) VALUES
('phone', 'Điện thoại', 'Smartphone, iPhone, Android và thiết bị di động'),
('laptop', 'Laptop', 'Laptop học tập, văn phòng, gaming và đồ họa'),
('pc', 'PC', 'PC gaming, PC workstation và máy bộ'),
('phukien', 'Phụ kiện', 'AirPods, loa, camera, sạc, đồng hồ và phụ kiện công nghệ')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- =========================================================
-- 3. PRODUCTS
-- Hỗ trợ filter:
-- category_id = phone/laptop/pc/phukien
-- brand = samsung/iphone/acer/msi/apple...
-- subcategory = airpods/loa/camera/sac/dong-ho...
-- =========================================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2),
  discount_percent INT DEFAULT 0,
  category_id VARCHAR NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  brand VARCHAR,
  subcategory VARCHAR,
  image_urls TEXT[] DEFAULT '{}',
  stock INT NOT NULL DEFAULT 0,
  status VARCHAR NOT NULL DEFAULT 'active',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_url TEXT,
  specifications_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT products_price_check CHECK (price >= 0),
  CONSTRAINT products_original_price_check CHECK (original_price IS NULL OR original_price >= price),
  CONSTRAINT products_discount_check CHECK (discount_percent >= 0 AND discount_percent <= 100),
  CONSTRAINT products_stock_check CHECK (stock >= 0),
  CONSTRAINT products_status_check CHECK (status IN ('active', 'hidden', 'out_of_stock')),
  CONSTRAINT products_specifications_object_check CHECK (jsonb_typeof(specifications) = 'object')
);

-- =========================================================
-- 4. CARTS
-- Một user có nhiều giỏ theo thời gian nhưng chỉ tối đa một giỏ active.
-- =========================================================

CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status VARCHAR NOT NULL DEFAULT 'active',
  checked_out_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT carts_id_user_unique UNIQUE (id, user_id),
  CONSTRAINT carts_status_check CHECK (status IN ('active', 'checked_out', 'abandoned')),
  CONSTRAINT carts_checkout_time_check CHECK (
    (status = 'checked_out' AND checked_out_at IS NOT NULL)
    OR (status <> 'checked_out' AND checked_out_at IS NULL)
  )
);

-- =========================================================
-- 5. CART ITEMS
-- Các sản phẩm có thể thay đổi trong một giỏ đang active.
-- =========================================================

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT cart_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- =========================================================
-- 6. ORDERS
-- Mỗi order bắt buộc thuộc đúng một cart; UNIQUE(cart_id) bảo đảm
-- một cart chỉ có tối đa một order.
-- =========================================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  cart_id UUID NOT NULL UNIQUE,
  receiver_name VARCHAR,
  receiver_phone VARCHAR,
  shipping_address TEXT NOT NULL,
  shipping_method VARCHAR NOT NULL DEFAULT 'Tiêu chuẩn',
  total_price DECIMAL(12,2) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  note TEXT,
  inventory_deducted_at TIMESTAMP WITH TIME ZONE,
  inventory_restored_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT orders_total_price_check CHECK (total_price >= 0),
  CONSTRAINT orders_cart_user_fk FOREIGN KEY (cart_id, user_id)
    REFERENCES public.carts(id, user_id) ON DELETE RESTRICT,
  CONSTRAINT orders_shipping_method_check CHECK (
    shipping_method IN ('Tiêu chuẩn', 'Hỏa tốc')
  ),
  CONSTRAINT orders_status_check CHECK (
    status IN ('pending', 'processing', 'completed', 'cancelled')
  )
);

-- =========================================================
-- 6A. NOTIFICATIONS
-- Thông báo do trigger/RPC backend tạo; client chỉ được đọc dữ liệu của mình.
-- =========================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT notifications_type_check CHECK (
    type IN (
      'order_created',
      'order_approved',
      'order_completed',
      'order_cancelled',
      'payment_succeeded',
      'admin_new_order',
      'admin_order_cancelled'
    )
  ),
  CONSTRAINT notifications_title_check CHECK (char_length(btrim(title)) > 0),
  CONSTRAINT notifications_message_check CHECK (char_length(btrim(message)) > 0),
  CONSTRAINT notifications_metadata_object_check CHECK (
    jsonb_typeof(metadata) = 'object'
  ),
  CONSTRAINT notifications_user_dedupe_unique UNIQUE (user_id, dedupe_key)
);

COMMENT ON TABLE public.notifications IS
'Thông báo bất biến do backend tạo; người dùng chỉ được đọc và đánh dấu đã đọc qua RPC.';

COMMENT ON COLUMN public.notifications.type IS
'Loại sự kiện; payment_succeeded được dành sẵn cho webhook thanh toán đáng tin cậy trong tương lai.';

COMMENT ON COLUMN public.notifications.dedupe_key IS
'Khóa nghiệp vụ ổn định dùng cùng user_id để chống tạo thông báo trùng khi retry.';

-- =========================================================
-- 7. ORDER ITEMS
-- Chi tiết từng sản phẩm trong đơn
-- =========================================================

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name VARCHAR NOT NULL,
  product_sku VARCHAR,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT unique_order_product UNIQUE (order_id, product_id),
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT order_items_price_check CHECK (price_at_purchase >= 0)
);

-- =========================================================
-- 8. PRODUCT REVIEWS
-- Phù hợp phần đánh giá/rating sản phẩm
-- =========================================================

CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INT NOT NULL,
  comment TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT product_reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- =========================================================
-- 9. INDEXES
-- Tối ưu cho lọc sản phẩm và dashboard
-- =========================================================

CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_subcategory ON public.products(subcategory);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_specifications_gin ON public.products USING GIN (specifications);
CREATE INDEX idx_products_source_url ON public.products(source_url);

CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_carts_status ON public.carts(status);
CREATE INDEX idx_carts_created_at ON public.carts(created_at DESC);
CREATE UNIQUE INDEX unique_active_cart_per_user
ON public.carts(user_id)
WHERE status = 'active';

CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
-- UNIQUE(cart_id) đã tự tạo index cho quan hệ carts 1 - 0..1 orders.
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_user_created_at
ON public.orders(user_id, created_at DESC, id DESC);

CREATE INDEX idx_notifications_user_created_at
ON public.notifications(user_id, created_at DESC, id DESC);

CREATE INDEX idx_notifications_user_unread_created_at
ON public.notifications(user_id, created_at DESC, id DESC)
WHERE read_at IS NULL;

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX idx_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_reviews_product_visible_created_at
ON public.product_reviews(product_id, created_at DESC)
WHERE is_visible = true;

-- =========================================================
-- 10. UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_carts_updated_at
BEFORE UPDATE ON public.carts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Mọi thay đổi cart_items phải giữ khóa trên cart cha. Checkout cũng khóa cùng
-- dòng cart trước tiên, nhờ đó nội dung giỏ không thể đổi giữa lúc tạo snapshot.
CREATE OR REPLACE FUNCTION public.guard_active_cart_item_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  target_cart_id UUID;
  target_cart_status VARCHAR;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.cart_id IS DISTINCT FROM OLD.cart_id THEN
    RAISE EXCEPTION 'Moving an item to another cart is not allowed';
  END IF;

  target_cart_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.cart_id
    ELSE NEW.cart_id
  END;

  -- Backend service_role được dùng cho seed/cleanup có kiểm soát.
  IF auth.role() = 'service_role' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;

    RETURN NEW;
  END IF;

  SELECT status
  INTO target_cart_status
  FROM public.carts
  WHERE id = target_cart_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart % does not exist', target_cart_id;
  END IF;

  IF target_cart_status <> 'active' THEN
    RAISE EXCEPTION 'Only an active cart can be modified';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_active_cart_item_write() FROM PUBLIC;

CREATE TRIGGER guard_active_cart_item_write
BEFORE INSERT OR UPDATE OR DELETE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.guard_active_cart_item_write();

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 11. ORDER/CART INTEGRITY
-- Xác minh order và cart cùng chủ sở hữu, sau đó khóa cart khi tạo order.
-- =========================================================

CREATE OR REPLACE FUNCTION public.validate_order_cart()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  source_cart_user_id UUID;
  source_cart_status VARCHAR;
BEGIN
  SELECT user_id, status
  INTO source_cart_user_id, source_cart_status
  FROM public.carts
  WHERE id = NEW.cart_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart % does not exist', NEW.cart_id;
  END IF;

  IF NEW.user_id IS NULL OR NEW.user_id IS DISTINCT FROM source_cart_user_id THEN
    RAISE EXCEPTION 'Order user must match cart owner';
  END IF;

  IF TG_OP = 'INSERT' AND source_cart_status <> 'active' THEN
    RAISE EXCEPTION 'Only an active cart can create an order';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_order_cart_before_write
BEFORE INSERT OR UPDATE OF cart_id, user_id ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_order_cart();

CREATE OR REPLACE FUNCTION public.mark_cart_checked_out()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.carts
  SET
    status = 'checked_out',
    checked_out_at = now()
  WHERE id = NEW.cart_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER mark_cart_checked_out_after_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.mark_cart_checked_out();

-- Lớp tương thích cho mọi phiên checkout: chỉ order được tạo dưới JWT của
-- chính người mua mới được đánh dấu là đã trừ kho. Seed service_role không có
-- auth.uid() người mua nên giữ NULL và không thể hoàn kho nhầm.
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

CREATE TRIGGER mark_authenticated_checkout_inventory
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.mark_authenticated_checkout_inventory();

-- Checkout nguyên tử: client không được tự ghi giá vào orders/order_items.
DROP FUNCTION IF EXISTS public.checkout_cart(UUID, VARCHAR, VARCHAR, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.checkout_cart(UUID, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR);

CREATE OR REPLACE FUNCTION public.checkout_cart(
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

  -- Khóa cart để hai request đồng thời không thể tạo hai order.
  SELECT status
  INTO current_cart_status
  FROM public.carts
  WHERE id = p_cart_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart does not exist or does not belong to current user';
  END IF;

  -- Retry an toàn: trả lại order đã tạo từ cart này.
  SELECT id
  INTO existing_order_id
  FROM public.orders
  WHERE cart_id = p_cart_id
    AND user_id = current_user_id;

  IF existing_order_id IS NOT NULL THEN
    RETURN existing_order_id;
  END IF;

  IF char_length(COALESCE(btrim(p_receiver_name), '')) NOT BETWEEN 2 AND 120 THEN
    RAISE EXCEPTION 'Receiver name is invalid';
  END IF;

  IF char_length(COALESCE(btrim(p_receiver_phone), '')) > 30
      OR char_length(regexp_replace(COALESCE(p_receiver_phone, ''), '\D', '', 'g'))
      NOT BETWEEN 9 AND 15 THEN
    RAISE EXCEPTION 'Receiver phone is invalid';
  END IF;

  IF char_length(COALESCE(btrim(p_shipping_address), '')) NOT BETWEEN 5 AND 500 THEN
    RAISE EXCEPTION 'Shipping address is invalid';
  END IF;

  IF char_length(COALESCE(btrim(p_note), '')) > 1000 THEN
    RAISE EXCEPTION 'Order note is too long';
  END IF;

  IF normalized_shipping_method NOT IN ('Tiêu chuẩn', 'Hỏa tốc') THEN
    RAISE EXCEPTION 'Shipping method must be Tiêu chuẩn or Hỏa tốc';
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

  -- Khóa sản phẩm theo thứ tự cố định để giảm nguy cơ deadlock.
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
      AND (
        product.status <> 'active'
        OR product.stock IS NULL
        OR product.stock < item.quantity
      )
  ) THEN
    RAISE EXCEPTION 'Cart contains an unavailable or insufficient-stock product';
  END IF;

  SELECT SUM(product.price * item.quantity)::DECIMAL(12,2)
  INTO calculated_total
  FROM public.cart_items AS item
  JOIN public.products AS product ON product.id = item.product_id
  WHERE item.cart_id = p_cart_id;

  IF calculated_total IS NULL THEN
    RAISE EXCEPTION 'Cannot checkout an empty cart';
  END IF;

  INSERT INTO public.orders (
    user_id,
    cart_id,
    receiver_name,
    receiver_phone,
    shipping_address,
    shipping_method,
    total_price,
    status,
    note,
    inventory_deducted_at
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
    NULLIF(btrim(p_note), ''),
    statement_timestamp()
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

REVOKE ALL ON FUNCTION public.checkout_cart(UUID, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.checkout_cart(UUID, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR) FROM anon;
GRANT EXECUTE ON FUNCTION public.checkout_cart(UUID, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR) TO authenticated;

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

-- =========================================================
-- 12. AUTO CREATE PROFILE WHEN SIGN UP
-- Tự tạo dòng public.users khi user đăng ký Auth
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text || '@unknown.local'),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'customer'
    ),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(public.users.display_name, EXCLUDED.display_name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 13. ADMIN HELPER FUNCTION
-- Dùng cho RLS policy
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- =========================================================
-- 13A. ADMIN ORDER STATUS TRANSITION
-- Frontend admin không được UPDATE status trực tiếp.
-- =========================================================

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

-- =========================================================
-- 13B. ORDER NOTIFICATION EVENTS
-- Chỉ checkout thật có inventory marker mới phát thông báo.
-- =========================================================

CREATE OR REPLACE FUNCTION public.create_order_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  short_order_code TEXT := upper(left(NEW.id::text, 8));
  user_notification_type VARCHAR;
  user_notification_title VARCHAR(160);
  user_notification_message TEXT;
  user_dedupe_key TEXT;
BEGIN
  -- Order demo được seed trực tiếp có marker NULL nên không làm đầy chuông của
  -- quản trị viên hoặc người dùng mock.
  IF NEW.inventory_deducted_at IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      order_id,
      metadata,
      dedupe_key
    )
    VALUES (
      NEW.user_id,
      'order_created',
      'Đặt hàng thành công',
      format(
        'Đơn hàng #%s đã được tiếp nhận và đang chờ xác nhận.',
        short_order_code
      ),
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'status', NEW.status,
        'total_price', NEW.total_price
      ),
      format('order:%s:created', NEW.id)
    )
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;

    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      order_id,
      metadata,
      dedupe_key
    )
    SELECT
      admin_user.id,
      'admin_new_order',
      'Có đơn hàng mới',
      format('Đơn hàng #%s đang chờ quản trị viên duyệt.', short_order_code),
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'status', NEW.status,
        'total_price', NEW.total_price
      ),
      format('admin:order:%s:created', NEW.id)
    FROM public.users AS admin_user
    WHERE admin_user.role = 'admin'
      AND admin_user.id <> NEW.user_id
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;

    RETURN NEW;
  END IF;

  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  CASE NEW.status
    WHEN 'processing' THEN
      user_notification_type := 'order_approved';
      user_notification_title := 'Đơn hàng đã được duyệt';
      user_notification_message := format(
        'Đơn hàng #%s đã được duyệt và đang được xử lý.',
        short_order_code
      );
    WHEN 'completed' THEN
      user_notification_type := 'order_completed';
      user_notification_title := 'Đơn hàng đã hoàn thành';
      user_notification_message := format(
        'Đơn hàng #%s đã hoàn thành. Cảm ơn bạn đã mua sắm tại TECH.NO.',
        short_order_code
      );
    WHEN 'cancelled' THEN
      user_notification_type := 'order_cancelled';
      user_notification_title := 'Đơn hàng đã được hủy';
      user_notification_message := format(
        'Đơn hàng #%s đã được hủy và tồn kho đã được hoàn lại.',
        short_order_code
      );
    ELSE
      RETURN NEW;
  END CASE;

  user_dedupe_key := format('order:%s:status:%s', NEW.id, NEW.status);

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    order_id,
    metadata,
    dedupe_key
  )
  VALUES (
    NEW.user_id,
    user_notification_type,
    user_notification_title,
    user_notification_message,
    NEW.id,
    jsonb_build_object(
      'order_id', NEW.id,
      'previous_status', OLD.status,
      'status', NEW.status,
      'total_price', NEW.total_price
    ),
    user_dedupe_key
  )
  ON CONFLICT (user_id, dedupe_key) DO NOTHING;

  IF NEW.status = 'cancelled' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      order_id,
      metadata,
      dedupe_key
    )
    SELECT
      admin_user.id,
      'admin_order_cancelled',
      'Đơn hàng đã bị hủy',
      format('Đơn hàng #%s đã chuyển sang trạng thái đã hủy.', short_order_code),
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'previous_status', OLD.status,
        'status', NEW.status,
        'total_price', NEW.total_price
      ),
      format('admin:order:%s:status:cancelled', NEW.id)
    FROM public.users AS admin_user
    WHERE admin_user.role = 'admin'
      AND admin_user.id <> NEW.user_id
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_notifications()
FROM PUBLIC, anon, authenticated;

CREATE TRIGGER create_order_notifications
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_order_notifications();

-- =========================================================
-- 13C. USER NOTIFICATION RPC
-- Mọi hàm SECURITY DEFINER đều lấy chủ thể từ auth.uid().
-- =========================================================

CREATE OR REPLACE FUNCTION public.list_my_notifications(
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  type VARCHAR,
  title VARCHAR,
  message TEXT,
  order_id UUID,
  metadata JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  normalized_limit INTEGER := LEAST(
    GREATEST(COALESCE(p_limit, 20), 1),
    50
  );
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT
    notification.id,
    notification.type,
    notification.title,
    notification.message,
    notification.order_id,
    notification.metadata,
    notification.read_at,
    notification.created_at
  FROM public.notifications AS notification
  WHERE notification.user_id = current_user_id
  ORDER BY notification.created_at DESC, notification.id DESC
  LIMIT normalized_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_unread_notification_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  unread_count BIGINT;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Authentication required';
  END IF;

  SELECT COUNT(*)
  INTO unread_count
  FROM public.notifications AS notification
  WHERE notification.user_id = current_user_id
    AND notification.read_at IS NULL;

  RETURN unread_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_my_notification_read(
  p_notification_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  notification_found BOOLEAN;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Authentication required';
  END IF;

  IF p_notification_id IS NULL THEN
    RAISE EXCEPTION 'Notification id is required';
  END IF;

  UPDATE public.notifications AS notification
  SET read_at = COALESCE(notification.read_at, statement_timestamp())
  WHERE notification.id = p_notification_id
    AND notification.user_id = current_user_id;

  notification_found := FOUND;
  RETURN notification_found;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_all_my_notifications_read()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  updated_count BIGINT := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Authentication required';
  END IF;

  UPDATE public.notifications AS notification
  SET read_at = statement_timestamp()
  WHERE notification.user_id = current_user_id
    AND notification.read_at IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION public.list_my_notifications(INTEGER)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_my_unread_notification_count()
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_my_notification_read(UUID)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_all_my_notifications_read()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.list_my_notifications(INTEGER)
TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_unread_notification_count()
TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_my_notification_read(UUID)
TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_my_notifications_read()
TO authenticated;

-- =========================================================
-- 13D. ADMIN DASHBOARD AGGREGATES
-- Ngưỡng sắp hết hàng: stock từ 1 đến 50.
-- Chỉ admin được gọi; tính trong database để không bị giới hạn 1.000 dòng.
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_kpis()
RETURNS TABLE (
  revenue_total NUMERIC,
  order_total BIGINT,
  customer_total BIGINT,
  product_total BIGINT,
  product_in_stock BIGINT,
  product_low_stock BIGINT,
  product_out_of_stock BIGINT,
  order_completed BIGINT,
  order_pending BIGINT,
  order_processing BIGINT,
  order_cancelled BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH order_stats AS (
    SELECT
      COALESCE(
        SUM(orders.total_price) FILTER (WHERE orders.status = 'completed'),
        0
      )::NUMERIC AS revenue_total,
      COUNT(*)::BIGINT AS order_total,
      COUNT(DISTINCT orders.user_id)::BIGINT AS customer_total,
      COUNT(*) FILTER (WHERE orders.status = 'completed')::BIGINT AS order_completed,
      COUNT(*) FILTER (WHERE orders.status = 'pending')::BIGINT AS order_pending,
      COUNT(*) FILTER (WHERE orders.status = 'processing')::BIGINT AS order_processing,
      COUNT(*) FILTER (WHERE orders.status = 'cancelled')::BIGINT AS order_cancelled
    FROM public.orders
  ),
  product_stats AS (
    SELECT
      COUNT(*)::BIGINT AS product_total,
      COUNT(*) FILTER (WHERE products.stock > 50)::BIGINT AS product_in_stock,
      COUNT(*) FILTER (WHERE products.stock BETWEEN 1 AND 50)::BIGINT AS product_low_stock,
      COUNT(*) FILTER (WHERE products.stock = 0)::BIGINT AS product_out_of_stock
    FROM public.products
  )
  SELECT
    order_stats.revenue_total,
    order_stats.order_total,
    order_stats.customer_total,
    product_stats.product_total,
    product_stats.product_in_stock,
    product_stats.product_low_stock,
    product_stats.product_out_of_stock,
    order_stats.order_completed,
    order_stats.order_pending,
    order_stats.order_processing,
    order_stats.order_cancelled
  FROM order_stats
  CROSS JOIN product_stats;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_monthly_metrics(p_months INTEGER DEFAULT 6)
RETURNS TABLE (
  month_start DATE,
  revenue_total NUMERIC,
  order_total BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required'
      USING ERRCODE = '42501';
  END IF;

  IF p_months IS NULL OR p_months < 1 OR p_months > 24 THEN
    RAISE EXCEPTION 'p_months must be between 1 and 24'
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', timezone('Asia/Ho_Chi_Minh', now()))
        - ((p_months - 1) * INTERVAL '1 month'),
      date_trunc('month', timezone('Asia/Ho_Chi_Minh', now())),
      INTERVAL '1 month'
    )::DATE AS month_start
  )
  SELECT
    months.month_start,
    COALESCE(
      SUM(orders.total_price) FILTER (WHERE orders.status = 'completed'),
      0
    )::NUMERIC AS revenue_total,
    COUNT(orders.id)::BIGINT AS order_total
  FROM months
  LEFT JOIN public.orders
    ON date_trunc(
      'month',
      timezone('Asia/Ho_Chi_Minh', orders.created_at)
    )::DATE = months.month_start
  GROUP BY months.month_start
  ORDER BY months.month_start;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_category_sales()
RETURNS TABLE (
  category_id VARCHAR,
  category_name VARCHAR,
  quantity_sold BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH completed_sales AS (
    SELECT
      products.category_id,
      SUM(order_items.quantity)::BIGINT AS quantity_sold
    FROM public.order_items
    JOIN public.orders
      ON orders.id = order_items.order_id
     AND orders.status = 'completed'
    JOIN public.products
      ON products.id = order_items.product_id
    GROUP BY products.category_id
  )
  SELECT
    categories.id::VARCHAR AS category_id,
    categories.name::VARCHAR AS category_name,
    COALESCE(completed_sales.quantity_sold, 0)::BIGINT AS quantity_sold
  FROM public.categories
  LEFT JOIN completed_sales
    ON completed_sales.category_id = categories.id
  ORDER BY CASE categories.id
    WHEN 'phone' THEN 1
    WHEN 'laptop' THEN 2
    WHEN 'pc' THEN 3
    WHEN 'phukien' THEN 4
    ELSE 5
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_kpis() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_monthly_metrics(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_category_sales() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_monthly_metrics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_category_sales() TO authenticated;

-- Chặn customer tự đổi role thành admin
CREATE OR REPLACE FUNCTION public.prevent_non_admin_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role
     AND COALESCE(auth.role(), '') <> 'service_role'
     AND NOT public.is_admin()
  THEN
    RAISE EXCEPTION 'Only admin can change user role';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_non_admin_role_change
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.prevent_non_admin_role_change();

-- =========================================================
-- 14. ENABLE RLS
-- =========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 15. RLS POLICIES - USERS
-- =========================================================

CREATE POLICY "Users can view own profile or admin can view all"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile or admin can update all"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() AND role = 'customer');

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- =========================================================
-- 16. RLS POLICIES - CATEGORIES
-- =========================================================

CREATE POLICY "Anyone can read categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admin can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =========================================================
-- 17. RLS POLICIES - PRODUCTS
-- =========================================================

CREATE POLICY "Anyone can read active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (status = 'active' OR public.is_admin());

CREATE POLICY "Only admin can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =========================================================
-- 18. RLS POLICIES - CARTS
-- =========================================================

CREATE POLICY "Users can read own carts or admin can read all"
ON public.carts
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create own active cart"
ON public.carts
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id = auth.uid() AND status = 'active' AND checked_out_at IS NULL)
  OR public.is_admin()
);

CREATE POLICY "Users can update own open carts or admin can update all"
ON public.carts
FOR UPDATE
TO authenticated
USING ((user_id = auth.uid() AND status = 'active') OR public.is_admin())
WITH CHECK (
  (user_id = auth.uid() AND status IN ('active', 'abandoned') AND checked_out_at IS NULL)
  OR public.is_admin()
);

-- =========================================================
-- 19. RLS POLICIES - CART ITEMS
-- =========================================================

CREATE POLICY "Users can read own cart items or admin can read all"
ON public.cart_items
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add items to own active cart"
ON public.cart_items
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
      AND carts.status = 'active'
  )
);

CREATE POLICY "Users can update items in own active cart"
ON public.cart_items
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
      AND carts.status = 'active'
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
      AND carts.status = 'active'
  )
);

CREATE POLICY "Users can delete items from own active cart"
ON public.cart_items
FOR DELETE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
      AND carts.status = 'active'
  )
);

-- =========================================================
-- 20. RLS POLICIES - ORDERS
-- =========================================================

CREATE POLICY "Users can read own orders or admin can read all"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =========================================================
-- 20A. RLS POLICIES - NOTIFICATIONS
-- =========================================================

CREATE POLICY "Users can read own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =========================================================
-- 21. RLS POLICIES - ORDER ITEMS
-- =========================================================

CREATE POLICY "Users can read own order items or admin can read all"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

-- =========================================================
-- 22. RLS POLICIES - PRODUCT REVIEWS
-- =========================================================

CREATE POLICY "Anyone can read visible reviews"
ON public.product_reviews
FOR SELECT
TO anon, authenticated
USING (is_visible = true OR public.is_admin());

CREATE POLICY "Users can create own reviews"
ON public.product_reviews
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews or admin can update all"
ON public.product_reviews
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own reviews or admin can delete all"
ON public.product_reviews
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- =========================================================
-- 23. PUBLIC REVIEW FEED
-- Chỉ trả về thông tin an toàn để không lộ email, phone, address của users.
-- =========================================================

CREATE OR REPLACE FUNCTION public.list_product_reviews(p_product_id UUID)
RETURNS TABLE (
  id UUID,
  reviewer_name TEXT,
  rating INT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_own BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    review.id,
    COALESCE(NULLIF(btrim(profile.display_name), ''), 'Khách hàng')::TEXT AS reviewer_name,
    review.rating,
    review.comment,
    review.created_at,
    COALESCE(review.user_id = auth.uid(), false) AS is_own
  FROM public.product_reviews AS review
  JOIN public.users AS profile ON profile.id = review.user_id
  JOIN public.products AS product ON product.id = review.product_id
  WHERE review.product_id = p_product_id
    AND review.is_visible = true
    AND product.status = 'active'
  ORDER BY review.created_at DESC
  LIMIT 100;
$$;

CREATE OR REPLACE FUNCTION public.create_product_review(
  p_product_id UUID,
  p_rating INT,
  p_comment TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  new_review_id UUID;
  normalized_comment TEXT := NULLIF(btrim(p_comment), '');
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  IF normalized_comment IS NULL THEN
    RAISE EXCEPTION 'Review comment is required';
  END IF;

  IF char_length(normalized_comment) > 1000 THEN
    RAISE EXCEPTION 'Review comment must not exceed 1000 characters';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.products AS product
    WHERE product.id = p_product_id
      AND product.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Active product not found';
  END IF;

  INSERT INTO public.product_reviews (
    product_id,
    user_id,
    rating,
    comment
  )
  VALUES (
    p_product_id,
    current_user_id,
    p_rating,
    normalized_comment
  )
  RETURNING id INTO new_review_id;

  RETURN new_review_id;
END;
$$;

REVOKE ALL ON FUNCTION public.list_product_reviews(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_product_reviews(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.list_product_reviews(UUID) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.create_product_review(UUID, INT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_product_review(UUID, INT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_product_review(UUID, INT, TEXT) TO authenticated;

-- =========================================================
-- 24. TABLE PRIVILEGES
-- RLS quyết định dòng nào được truy cập; GRANT quyết định thao tác nào tồn tại.
-- =========================================================

REVOKE ALL ON public.carts, public.cart_items, public.orders, public.order_items FROM anon;
REVOKE ALL ON public.carts, public.cart_items, public.orders, public.order_items FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON public.carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT SELECT ON public.orders, public.order_items TO authenticated;
GRANT UPDATE (note) ON public.orders TO authenticated;

REVOKE ALL ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.notifications TO authenticated;

REVOKE ALL ON public.product_reviews FROM anon, authenticated;

-- =========================================================
-- 25. STORAGE BUCKET FOR PRODUCT IMAGES
-- Dùng cho image_urls trong bảng products
-- =========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;

CREATE POLICY "Public can read product images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'products');

CREATE POLICY "Admin can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "Admin can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'products' AND public.is_admin())
WITH CHECK (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "Admin can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products' AND public.is_admin());

-- =========================================================
-- 26. REALTIME FOR NOTIFICATIONS
-- Không lỗi nếu chạy ngoài Supabase hoặc table đã nằm trong publication.
-- =========================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';
