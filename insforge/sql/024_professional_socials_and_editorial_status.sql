/* Professional socials + published project editorial/archive fields.
   Apply: npx @insforge/cli db import insforge/sql/024_professional_socials_and_editorial_status.sql */

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT;

ALTER TABLE public.published_projects
  ADD COLUMN IF NOT EXISTS editorial_status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS published_projects_editorial_status_idx
  ON public.published_projects (editorial_status, archived_at DESC NULLS LAST);
