-- User-uploaded profile photo (OAuth avatars stay on auth user; this overrides display when set).
-- Apply with: npx @insforge/cli db query "$(cat insforge/sql/002_profile_avatar.sql)"
-- Ensure a public storage bucket exists (e.g. "avatars") for uploads; see web/.env.example.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS custom_avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS custom_avatar_storage_key TEXT;
