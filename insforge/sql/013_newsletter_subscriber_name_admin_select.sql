-- Apply with:
-- npx @insforge/cli db query "$(cat insforge/sql/013_newsletter_subscriber_name_admin_select.sql)"

-- Optional display name for public newsletter signups (no auth account).
ALTER TABLE public.newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS subscriber_name TEXT;

-- Admins must be able to SELECT all rows (including user_id NULL / public signups).
DROP POLICY IF EXISTS "newsletter_admin_select_all" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_admin_select_all"
  ON public.newsletter_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
