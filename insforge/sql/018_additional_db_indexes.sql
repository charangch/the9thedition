-- Performance indexes for common filters and admin views.
-- Apply: npx @insforge/cli db query "$(cat insforge/sql/018_additional_db_indexes.sql)"

CREATE INDEX IF NOT EXISTS inquiries_email_lower_idx ON public.inquiries (lower(email));
CREATE INDEX IF NOT EXISTS inquiries_status_created_idx ON public.inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS submissions_status_created_idx ON public.submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS published_projects_category_idx ON public.published_projects (category);
CREATE INDEX IF NOT EXISTS published_projects_professional_slug_idx ON public.published_projects (professional_slug)
  WHERE professional_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
