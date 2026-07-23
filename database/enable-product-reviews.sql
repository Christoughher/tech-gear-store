-- =========================================================
-- KÍCH HOẠT ĐÁNH GIÁ SẢN PHẨM TRÊN DATABASE ĐANG SỬ DỤNG
-- Chạy file này một lần trong Supabase SQL Editor.
-- File không xóa comment hoặc dữ liệu hiện có.
-- =========================================================

BEGIN;

-- Client không truy cập trực tiếp bảng; mọi thao tác đi qua RPC giới hạn dữ liệu.
REVOKE ALL ON public.product_reviews FROM anon, authenticated;

-- Tối ưu danh sách comment hiển thị theo sản phẩm và thời gian mới nhất.
CREATE INDEX IF NOT EXISTS idx_reviews_product_visible_created_at
ON public.product_reviews(product_id, created_at DESC)
WHERE is_visible = true;

-- Trả về tên hiển thị an toàn mà không công khai email, phone hoặc address.
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

-- Tạo comment qua RPC để user_id luôn lấy từ access token và nội dung được kiểm tra ở database.
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

COMMIT;

-- Kiểm tra function đã được tạo thành công.
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'list_product_reviews';
