-- Apply with:
-- npx @insforge/cli db query "$(cat insforge/sql/007_submission_template_and_publish.sql)"

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS video_links TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS external_links TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS published_slug TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS public.published_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Architecture & Design',
  location TEXT,
  byline TEXT,
  hero_image_url TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
  video_links TEXT[] NOT NULL DEFAULT '{}'::text[],
  external_links TEXT[] NOT NULL DEFAULT '{}'::text[],
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_submission_id UUID REFERENCES public.submissions (id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS published_projects_slug_idx ON public.published_projects (slug);
CREATE INDEX IF NOT EXISTS published_projects_published_at_idx ON public.published_projects (published_at DESC);

ALTER TABLE public.published_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "published_projects_public_read" ON public.published_projects;
CREATE POLICY "published_projects_public_read"
  ON public.published_projects FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "published_projects_admin_write" ON public.published_projects;
CREATE POLICY "published_projects_admin_write"
  ON public.published_projects FOR ALL
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
