-- Fix: allow draft / deleted / archived statuses used by the admin publish flow.
-- Run: npx @insforge/cli db query "ALTER TABLE public.admin_publishing_queue DROP CONSTRAINT IF EXISTS admin_publishing_queue_status_check;"

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
