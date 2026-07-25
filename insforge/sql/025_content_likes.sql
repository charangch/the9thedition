-- Public like counters for projects/articles (shared across visitors).
-- Apply with: npx @insforge/cli db query "$(cat insforge/sql/025_content_likes.sql)"

CREATE TABLE IF NOT EXISTS public.content_likes (
  target text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0 CHECK (count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_likes_public_select" ON public.content_likes;
CREATE POLICY "content_likes_public_select"
  ON public.content_likes FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "content_likes_public_insert" ON public.content_likes;
CREATE POLICY "content_likes_public_insert"
  ON public.content_likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "content_likes_public_update" ON public.content_likes;
CREATE POLICY "content_likes_public_update"
  ON public.content_likes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.adjust_content_like(p_target text, p_delta integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF p_target IS NULL OR length(trim(p_target)) = 0 OR length(p_target) > 512 THEN
    RAISE EXCEPTION 'invalid target';
  END IF;
  IF p_delta IS NULL OR p_delta = 0 THEN
    RAISE EXCEPTION 'invalid delta';
  END IF;

  INSERT INTO public.content_likes (target, count)
  VALUES (trim(p_target), GREATEST(0, p_delta))
  ON CONFLICT (target) DO UPDATE
  SET
    count = GREATEST(0, public.content_likes.count + p_delta),
    updated_at = now()
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.adjust_content_like(text, integer) TO anon, authenticated;
