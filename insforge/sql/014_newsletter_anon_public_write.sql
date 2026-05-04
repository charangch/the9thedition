-- Public newsletter API uses the anon key from Next.js; allow insert/update only for
-- rows without a linked auth user (web signups). Service role still bypasses RLS when configured.
-- Apply with: npx @insforge/cli db query "$(cat insforge/sql/014_newsletter_anon_public_write.sql)"

DROP POLICY IF EXISTS "newsletter_anon_public_insert" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_anon_public_insert"
  ON public.newsletter_subscriptions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "newsletter_anon_public_update" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_anon_public_update"
  ON public.newsletter_subscriptions FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);
