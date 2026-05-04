-- Project enquiry phone (E.164). Apply with InsForge CLI when deploying.
-- npx @insforge/cli db query "$(cat insforge/sql/012_inquiries_phone_e164.sql)"

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS phone_e164 TEXT;

COMMENT ON COLUMN public.inquiries.phone_e164 IS 'International phone in E.164 (e.g. +919876543210).';
