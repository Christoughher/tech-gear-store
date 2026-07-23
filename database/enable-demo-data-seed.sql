-- =========================================================
-- PREFLIGHT CHECK FOR database/demo-seed/seed-demo-data.mjs
-- Safe migration: only creates a service-role-only validation RPC.
-- It does not insert, update or delete business data.
-- =========================================================

BEGIN;

DROP FUNCTION IF EXISTS public.check_demo_seed_schema();

CREATE FUNCTION public.check_demo_seed_schema()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  missing_items TEXT[];
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Service-role access required'
      USING ERRCODE = '42501';
  END IF;

  WITH required_columns(table_name, column_name) AS (
    VALUES
      ('users', 'id'),
      ('users', 'email'),
      ('users', 'display_name'),
      ('users', 'phone'),
      ('users', 'address'),
      ('users', 'role'),
      ('products', 'id'),
      ('products', 'sku'),
      ('products', 'name'),
      ('products', 'price'),
      ('products', 'category_id'),
      ('products', 'stock'),
      ('products', 'status'),
      ('products', 'created_at'),
      ('carts', 'id'),
      ('carts', 'user_id'),
      ('carts', 'status'),
      ('carts', 'checked_out_at'),
      ('carts', 'created_at'),
      ('carts', 'updated_at'),
      ('cart_items', 'id'),
      ('cart_items', 'cart_id'),
      ('cart_items', 'product_id'),
      ('cart_items', 'quantity'),
      ('cart_items', 'created_at'),
      ('cart_items', 'updated_at'),
      ('orders', 'id'),
      ('orders', 'user_id'),
      ('orders', 'cart_id'),
      ('orders', 'receiver_name'),
      ('orders', 'receiver_phone'),
      ('orders', 'shipping_address'),
      ('orders', 'shipping_method'),
      ('orders', 'total_price'),
      ('orders', 'status'),
      ('orders', 'note'),
      ('orders', 'created_at'),
      ('orders', 'updated_at'),
      ('order_items', 'id'),
      ('order_items', 'order_id'),
      ('order_items', 'product_id'),
      ('order_items', 'product_name'),
      ('order_items', 'product_sku'),
      ('order_items', 'quantity'),
      ('order_items', 'price_at_purchase'),
      ('order_items', 'created_at'),
      ('product_reviews', 'user_id')
  ),
  missing_columns AS (
    SELECT pg_catalog.format('column public.%I.%I', required.table_name, required.column_name) AS item
    FROM required_columns AS required
    LEFT JOIN information_schema.columns AS actual
      ON actual.table_schema = 'public'
     AND actual.table_name = required.table_name
     AND actual.column_name = required.column_name
    WHERE actual.column_name IS NULL
  ),
  required_triggers(table_name, trigger_name) AS (
    VALUES
      ('orders', 'validate_order_cart_before_write'),
      ('orders', 'mark_cart_checked_out_after_order')
  ),
  missing_triggers AS (
    SELECT pg_catalog.format('enabled trigger public.%I.%I', required.table_name, required.trigger_name) AS item
    FROM required_triggers AS required
    LEFT JOIN pg_catalog.pg_namespace AS namespace
      ON namespace.nspname = 'public'
    LEFT JOIN pg_catalog.pg_class AS relation
      ON relation.relnamespace = namespace.oid
     AND relation.relname = required.table_name
    LEFT JOIN pg_catalog.pg_trigger AS actual
      ON actual.tgrelid = relation.oid
     AND actual.tgname = required.trigger_name
     AND NOT actual.tgisinternal
    WHERE actual.oid IS NULL OR actual.tgenabled NOT IN ('O', 'A')
  ),
  required_constraints(table_name, constraint_name) AS (
    VALUES
      ('carts', 'carts_checkout_time_check'),
      ('cart_items', 'unique_cart_product'),
      ('orders', 'orders_cart_user_fk'),
      ('orders', 'orders_cart_id_key'),
      ('orders', 'orders_shipping_method_check'),
      ('orders', 'orders_status_check'),
      ('order_items', 'unique_order_product')
  ),
  missing_constraints AS (
    SELECT pg_catalog.format('validated constraint public.%I.%I', required.table_name, required.constraint_name) AS item
    FROM required_constraints AS required
    LEFT JOIN pg_catalog.pg_namespace AS namespace
      ON namespace.nspname = 'public'
    LEFT JOIN pg_catalog.pg_class AS relation
      ON relation.relnamespace = namespace.oid
     AND relation.relname = required.table_name
    LEFT JOIN pg_catalog.pg_constraint AS actual
      ON actual.conrelid = relation.oid
     AND actual.conname = required.constraint_name
    WHERE actual.oid IS NULL OR NOT actual.convalidated
  ),
  missing_indexes AS (
    SELECT 'index public.unique_active_cart_per_user'::TEXT AS item
    WHERE NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_index AS index_definition
      JOIN pg_catalog.pg_class AS index_relation
        ON index_relation.oid = index_definition.indexrelid
      JOIN pg_catalog.pg_class AS table_relation
        ON table_relation.oid = index_definition.indrelid
      JOIN pg_catalog.pg_namespace AS namespace
        ON namespace.oid = table_relation.relnamespace
      WHERE namespace.nspname = 'public'
        AND table_relation.relname = 'carts'
        AND index_relation.relname = 'unique_active_cart_per_user'
        AND index_definition.indisunique
        AND index_definition.indisvalid
        AND index_definition.indisready
        AND index_definition.indpred IS NOT NULL
    )
  )
  SELECT pg_catalog.array_agg(all_missing.item ORDER BY all_missing.item)
  INTO missing_items
  FROM (
    SELECT item FROM missing_columns
    UNION ALL
    SELECT item FROM missing_triggers
    UNION ALL
    SELECT item FROM missing_constraints
    UNION ALL
    SELECT item FROM missing_indexes
  ) AS all_missing;

  IF pg_catalog.array_length(missing_items, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Demo seed schema prerequisites missing: %',
      pg_catalog.array_to_string(missing_items, ', ')
      USING ERRCODE = '55000';
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'ok', true,
    'schema_version', 'techno-demo-seed-v1',
    'checked_at', pg_catalog.now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_demo_seed_schema() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_demo_seed_schema() FROM anon;
REVOKE ALL ON FUNCTION public.check_demo_seed_schema() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_demo_seed_schema() TO service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- SQL Editor (postgres) cannot execute the service-role-only RPC directly as a
-- browser user. The Node seed script calls and verifies it using the backend key.
