-- Bug reports from /report-bug (server inserts via INSFORGE_SERVICE_KEY only).
-- Apply: npx @insforge/cli db query "$(cat insforge/sql/017_bug_reports.sql)"

CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary TEXT NOT NULL,
  steps TEXT,
  browser TEXT,
  page_url TEXT,
  screenshot_url TEXT,
  contact_email TEXT,
  user_agent TEXT,
  ip_prefix TEXT
);

CREATE INDEX IF NOT EXISTS bug_reports_created_at_idx ON public.bug_reports (created_at DESC);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: only service role / dashboard admin may read or insert.
