-- Editorial workflow: extended statuses, soft delete, professional project counts.
-- Apply: npx @insforge/cli db query "$(cat insforge/sql/019_editorial_workflow.sql)"

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS project_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.published_projects
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS editorial_status TEXT NOT NULL DEFAULT 'published';

ALTER TABLE public.admin_publishing_queue
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS editorial_payload JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Expand queue status values (keep legacy pending for older rows).
ALTER TABLE public.admin_publishing_queue
  DROP CONSTRAINT IF EXISTS admin_publishing_queue_status_check;

ALTER TABLE public.admin_publishing_queue
  ADD CONSTRAINT admin_publishing_queue_status_check
  CHECK (
    status IN (
      'pending',
      'draft',
      'review',
      'ready',
      'published',
      'archived',
      'deleted'
    )
  );

CREATE INDEX IF NOT EXISTS published_projects_published_at_idx
  ON public.published_projects (published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS published_projects_deleted_at_idx
  ON public.published_projects (deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS admin_publishing_queue_status_idx
  ON public.admin_publishing_queue (status, updated_at DESC);
