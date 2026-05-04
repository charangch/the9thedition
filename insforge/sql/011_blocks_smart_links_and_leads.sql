ALTER TABLE public.published_projects
  ADD COLUMN IF NOT EXISTS layout_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS professional_slug TEXT,
  ADD COLUMN IF NOT EXISTS linked_product_slugs TEXT[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.published_products
  ADD COLUMN IF NOT EXISTS layout_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.admin_publishing_queue
  ADD COLUMN IF NOT EXISTS layout_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  category TEXT,
  image_url TEXT,
  layout_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS layout_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.project_product_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT project_product_links_unique UNIQUE (project_slug, product_slug)
);

CREATE INDEX IF NOT EXISTS project_product_links_project_slug_idx ON public.project_product_links (project_slug);
CREATE INDEX IF NOT EXISTS project_product_links_product_slug_idx ON public.project_product_links (product_slug);

ALTER TABLE public.project_product_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_product_links_public_read" ON public.project_product_links;
CREATE POLICY "project_product_links_public_read"
  ON public.project_product_links FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "project_product_links_admin_write" ON public.project_product_links;
CREATE POLICY "project_product_links_admin_write"
  ON public.project_product_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_project_id_idx ON public.inquiries (project_id);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries (created_at DESC);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inquiries_public_insert" ON public.inquiries;
CREATE POLICY "inquiries_public_insert"
  ON public.inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_admin_read_write" ON public.inquiries;
CREATE POLICY "inquiries_admin_read_write"
  ON public.inquiries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );
