-- Lead capture: reader enquiries about a project.
-- Apply: npx @insforge/cli db query "$(cat insforge/sql/003_project_enquiries.sql)"

CREATE TABLE IF NOT EXISTS public.project_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_enquiries_project_slug_idx ON public.project_enquiries (project_slug);
CREATE INDEX IF NOT EXISTS project_enquiries_created_at_idx ON public.project_enquiries (created_at DESC);

ALTER TABLE public.project_enquiries ENABLE ROW LEVEL SECURITY;

-- Public can insert enquiries (validated in app). No public read.
DROP POLICY IF EXISTS "project_enquiries_insert_public" ON public.project_enquiries;
CREATE POLICY "project_enquiries_insert_public"
  ON public.project_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
