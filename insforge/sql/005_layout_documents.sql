-- Apply with:
-- npx @insforge/cli db query "$(cat insforge/sql/005_layout_documents.sql)"

CREATE TABLE IF NOT EXISTS public.layout_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS layout_documents_slug_idx ON public.layout_documents (slug);
CREATE INDEX IF NOT EXISTS layout_documents_status_idx ON public.layout_documents (status);

ALTER TABLE public.layout_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "layout_documents_admin_select" ON public.layout_documents;
CREATE POLICY "layout_documents_admin_select"
  ON public.layout_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "layout_documents_admin_write" ON public.layout_documents;
CREATE POLICY "layout_documents_admin_write"
  ON public.layout_documents FOR ALL
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
