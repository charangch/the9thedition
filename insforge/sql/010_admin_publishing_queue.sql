CREATE TABLE IF NOT EXISTS public.admin_publishing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('project', 'product', 'student')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'review', 'published')),
  title TEXT NOT NULL,
  source_text TEXT NOT NULL DEFAULT '',
  source_pdf_url TEXT,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  video_links TEXT[] NOT NULL DEFAULT '{}',
  published_slug TEXT,
  published_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_publishing_queue_created_idx ON public.admin_publishing_queue (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_publishing_queue_status_idx ON public.admin_publishing_queue (status);

ALTER TABLE public.admin_publishing_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_publishing_queue_admin_only" ON public.admin_publishing_queue;
CREATE POLICY "admin_publishing_queue_admin_only"
  ON public.admin_publishing_queue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.published_students (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Student Projects',
  school_name TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  video_links TEXT[] NOT NULL DEFAULT '{}',
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_queue_id UUID REFERENCES public.admin_publishing_queue (id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS published_students_published_idx ON public.published_students (published_at DESC);

ALTER TABLE public.published_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "published_students_public_select" ON public.published_students;
CREATE POLICY "published_students_public_select"
  ON public.published_students FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "published_students_admin_write" ON public.published_students;
CREATE POLICY "published_students_admin_write"
  ON public.published_students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
