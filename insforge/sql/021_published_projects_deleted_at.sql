-- Soft-delete for published projects (run if 019 was not applied).
ALTER TABLE public.published_projects
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS published_projects_deleted_at_idx
  ON public.published_projects (deleted_at)
  WHERE deleted_at IS NULL;
