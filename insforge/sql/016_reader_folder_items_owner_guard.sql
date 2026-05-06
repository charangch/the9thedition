-- Enforce that inserted/updated folder items reference a folder owned by auth.uid().
-- Apply with:
-- npx @insforge/cli db query "$(cat insforge/sql/016_reader_folder_items_owner_guard.sql)"

DROP POLICY IF EXISTS "reader_folder_items_insert_own" ON public.reader_folder_items;
CREATE POLICY "reader_folder_items_insert_own"
  ON public.reader_folder_items FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.reader_folders f
      WHERE f.id = folder_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "reader_folder_items_update_own" ON public.reader_folder_items;
CREATE POLICY "reader_folder_items_update_own"
  ON public.reader_folder_items FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.reader_folders f
      WHERE f.id = folder_id
        AND f.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.reader_folders f
      WHERE f.id = folder_id
        AND f.user_id = auth.uid()
    )
  );
