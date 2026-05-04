CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  firm TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS professionals_slug_idx ON public.professionals (slug);
CREATE INDEX IF NOT EXISTS professionals_firm_idx ON public.professionals (lower(firm));
CREATE INDEX IF NOT EXISTS companies_slug_idx ON public.companies (slug);
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies (lower(name));

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "professionals_public_read" ON public.professionals;
CREATE POLICY "professionals_public_read"
  ON public.professionals FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "companies_public_read" ON public.companies;
CREATE POLICY "companies_public_read"
  ON public.companies FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "professionals_admin_write" ON public.professionals;
CREATE POLICY "professionals_admin_write"
  ON public.professionals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "companies_admin_write" ON public.companies;
CREATE POLICY "companies_admin_write"
  ON public.companies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

ALTER TABLE public.published_projects
  ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.professionals (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '{"images":[],"videos":[]}'::jsonb;

ALTER TABLE public.published_products
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '{"images":[],"videos":[],"pdfs":[]}'::jsonb;

ALTER TABLE public.published_students
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '{"images":[],"videos":[]}'::jsonb;

ALTER TABLE public.admin_publishing_queue
  ADD COLUMN IF NOT EXISTS taxonomy_name TEXT,
  ADD COLUMN IF NOT EXISTS taxonomy_kind TEXT,
  ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '{"images":[],"videos":[],"pdfs":[]}'::jsonb;

CREATE INDEX IF NOT EXISTS published_projects_created_at_idx ON public.published_projects (created_at DESC);
CREATE INDEX IF NOT EXISTS published_projects_trending_idx ON public.published_projects (is_trending, created_at DESC);
