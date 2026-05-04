-- Apply with:
-- npx @insforge/cli db query "$(cat insforge/sql/002_reader_hub.sql)"

CREATE TABLE IF NOT EXISTS public.reader_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('professional', 'topic', 'section')),
  target_slug TEXT NOT NULL,
  target_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reader_follows_unique UNIQUE (user_id, target_type, target_slug)
);

CREATE INDEX IF NOT EXISTS reader_follows_user_idx ON public.reader_follows (user_id);

ALTER TABLE public.reader_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reader_follows_select_own" ON public.reader_follows;
CREATE POLICY "reader_follows_select_own"
  ON public.reader_follows FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_follows_insert_own" ON public.reader_follows;
CREATE POLICY "reader_follows_insert_own"
  ON public.reader_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_follows_delete_own" ON public.reader_follows;
CREATE POLICY "reader_follows_delete_own"
  ON public.reader_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.reader_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('project', 'article', 'product', 'news')),
  item_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reader_bookmarks_unique UNIQUE (user_id, item_type, item_slug)
);

CREATE INDEX IF NOT EXISTS reader_bookmarks_user_idx ON public.reader_bookmarks (user_id);

ALTER TABLE public.reader_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reader_bookmarks_select_own" ON public.reader_bookmarks;
CREATE POLICY "reader_bookmarks_select_own"
  ON public.reader_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_bookmarks_insert_own" ON public.reader_bookmarks;
CREATE POLICY "reader_bookmarks_insert_own"
  ON public.reader_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reader_bookmarks_delete_own" ON public.reader_bookmarks;
CREATE POLICY "reader_bookmarks_delete_own"
  ON public.reader_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  source TEXT NOT NULL DEFAULT 'web',
  consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email_unique_idx
  ON public.newsletter_subscriptions (lower(email));

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_select_own" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_select_own"
  ON public.newsletter_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "newsletter_insert_own" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_insert_own"
  ON public.newsletter_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "newsletter_update_own" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_update_own"
  ON public.newsletter_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
