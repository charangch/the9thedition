CREATE TABLE IF NOT EXISTS public.published_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Products',
  manufacturer TEXT,
  company_about TEXT,
  product_about TEXT,
  cta_text TEXT,
  cta_url TEXT,
  pdf_url TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_submission_id UUID REFERENCES public.submissions (id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS published_products_slug_idx ON public.published_products (slug);
CREATE INDEX IF NOT EXISTS published_products_published_at_idx ON public.published_products (published_at DESC);

ALTER TABLE public.published_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "published_products_public_read" ON public.published_products;
CREATE POLICY "published_products_public_read"
  ON public.published_products FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "published_products_admin_write" ON public.published_products;
CREATE POLICY "published_products_admin_write"
  ON public.published_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );
