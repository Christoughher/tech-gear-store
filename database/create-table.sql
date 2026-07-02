-- =========================================================
-- TECH.NO DATABASE SCHEMA - FULL RESET VERSION
-- Dành cho Supabase project mới hoặc database demo có thể reset
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- 0. DROP OLD TABLES
-- =========================================================

DROP TABLE IF EXISTS public.product_reviews CASCADE;
DROP TABLE IF EXISTS public.cart CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
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
  price DECIMAL(12,2) NOT NULL,
  discount_percent INT DEFAULT 0,
  category_id VARCHAR REFERENCES public.categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  brand VARCHAR,
  subcategory VARCHAR,
  image_urls TEXT[] DEFAULT '{}',
  stock INT DEFAULT 0,
  status VARCHAR NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT products_price_check CHECK (price >= 0),
  CONSTRAINT products_discount_check CHECK (discount_percent >= 0 AND discount_percent <= 100),
  CONSTRAINT products_stock_check CHECK (stock >= 0),
  CONSTRAINT products_status_check CHECK (status IN ('active', 'hidden', 'out_of_stock'))
);

-- =========================================================
-- 4. CART
-- Giỏ hàng gắn với user đăng nhập
-- =========================================================

CREATE TABLE public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT cart_quantity_check CHECK (quantity > 0),
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- =========================================================
-- 5. ORDERS
-- Đơn hàng tổng
-- =========================================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  receiver_name VARCHAR,
  receiver_phone VARCHAR,
  shipping_address TEXT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT orders_total_price_check CHECK (total_price >= 0),
  CONSTRAINT orders_status_check CHECK (
    status IN ('pending', 'processing', 'completed', 'cancelled')
  )
);

-- =========================================================
-- 6. ORDER ITEMS
-- Chi tiết từng sản phẩm trong đơn
-- =========================================================

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name VARCHAR NOT NULL,
  product_sku VARCHAR,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT order_items_price_check CHECK (price_at_purchase >= 0)
);

-- =========================================================
-- 7. PRODUCT REVIEWS
-- Phù hợp phần đánh giá/rating sản phẩm
-- =========================================================

CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  rating INT NOT NULL,
  comment TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT product_reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- =========================================================
-- 8. INDEXES
-- Tối ưu cho lọc sản phẩm và dashboard
-- =========================================================

CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_subcategory ON public.products(subcategory);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX idx_cart_user_id ON public.cart(user_id);
CREATE INDEX idx_cart_product_id ON public.cart(product_id);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX idx_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.product_reviews(user_id);

-- =========================================================
-- 9. UPDATED_AT TRIGGER
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

CREATE TRIGGER set_cart_updated_at
BEFORE UPDATE ON public.cart
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 10. AUTO CREATE PROFILE WHEN SIGN UP
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
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
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
-- 11. ADMIN HELPER FUNCTION
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
-- 12. ENABLE RLS
-- =========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 13. RLS POLICIES - USERS
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

-- =========================================================
-- 14. RLS POLICIES - CATEGORIES
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
-- 15. RLS POLICIES - PRODUCTS
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
-- 16. RLS POLICIES - CART
-- =========================================================

CREATE POLICY "Users can read own cart"
ON public.cart
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cart"
ON public.cart
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart"
ON public.cart
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own cart"
ON public.cart
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =========================================================
-- 17. RLS POLICIES - ORDERS
-- =========================================================

CREATE POLICY "Users can read own orders or admin can read all"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =========================================================
-- 18. RLS POLICIES - ORDER ITEMS
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

CREATE POLICY "Users can create items for own orders"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admin can update order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =========================================================
-- 19. RLS POLICIES - PRODUCT REVIEWS
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
-- 20. STORAGE BUCKET FOR PRODUCT IMAGES
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