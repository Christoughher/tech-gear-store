DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_original_price_check'
  ) THEN
    ALTER TABLE public.products
    ADD CONSTRAINT products_original_price_check
    CHECK (original_price IS NULL OR original_price >= price);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_specifications_object_check'
  ) THEN
    ALTER TABLE public.products
    ADD CONSTRAINT products_specifications_object_check
    CHECK (jsonb_typeof(specifications) = 'object');
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_products_specifications_gin
ON public.products USING GIN (specifications);

CREATE INDEX IF NOT EXISTS idx_products_source_url
ON public.products(source_url);