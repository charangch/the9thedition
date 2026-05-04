-- PostgREST / InsForge upsert(..., { onConflict: "email" }) requires a unique constraint or
-- unique index on column "email". The table already has a unique index on lower(email); add
-- one on email so public signups (lowercased in the API) merge correctly.
-- Apply with: npx @insforge/cli db query "$(cat insforge/sql/015_newsletter_email_unique_for_upsert.sql)"

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscriptions_email_unique
  ON public.newsletter_subscriptions (email);
