-- Apply with:
-- npx @insforge/cli db query "$(cat insforge/sql/004_reader_folders.sql)"

CREATE TABLE IF NOT EXISTS public.reader_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reader_folders_unique UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS reader_folders_user_idx ON public.reader_folders (user_id);

ALTER TABLE public.reader_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reader_folders_select_own" ON public.reader_folders;
CREATE POLICY "reader_folders_select_own"
  ON public.reader_folders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_folders_insert_own" ON public.reader_folders;
CREATE POLICY "reader_folders_insert_own"
  ON public.reader_folders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_folders_update_own" ON public.reader_folders;
CREATE POLICY "reader_folders_update_own"
  ON public.reader_folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_folders_delete_own" ON public.reader_folders;
CREATE POLICY "reader_folders_delete_own"
  ON public.reader_folders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.reader_folder_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES public.reader_folders (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('project', 'article', 'product', 'news')),
  item_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reader_folder_items_unique UNIQUE (folder_id, item_type, item_slug)
);

CREATE INDEX IF NOT EXISTS reader_folder_items_user_idx ON public.reader_folder_items (user_id);
CREATE INDEX IF NOT EXISTS reader_folder_items_folder_idx ON public.reader_folder_items (folder_id);

ALTER TABLE public.reader_folder_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reader_folder_items_select_own" ON public.reader_folder_items;
CREATE POLICY "reader_folder_items_select_own"
  ON public.reader_folder_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_folder_items_insert_own" ON public.reader_folder_items;
CREATE POLICY "reader_folder_items_insert_own"
  ON public.reader_folder_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_folder_items_delete_own" ON public.reader_folder_items;
CREATE POLICY "reader_folder_items_delete_own"
  ON public.reader_folder_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
