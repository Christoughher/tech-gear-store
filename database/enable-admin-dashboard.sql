-- =========================================================
-- ENABLE LIVE ADMIN KPI + CHART DATA ON AN EXISTING DATABASE
-- Safe migration: does not delete business data.
-- Low-stock threshold: 50 products.
-- =========================================================

BEGIN;

DROP FUNCTION IF EXISTS public.get_admin_dashboard_kpis();
DROP FUNCTION IF EXISTS public.get_admin_monthly_metrics(INTEGER);
DROP FUNCTION IF EXISTS public.get_admin_category_sales();

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

REVOKE ALL ON FUNCTION public.get_admin_dashboard_kpis() FROM anon;
REVOKE ALL ON FUNCTION public.get_admin_monthly_metrics(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.get_admin_category_sales() FROM anon;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_monthly_metrics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_category_sales() TO authenticated;

COMMIT;

-- Verification: all three routines must appear.
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_admin_dashboard_kpis',
    'get_admin_monthly_metrics',
    'get_admin_category_sales'
  )
ORDER BY routine_name;
