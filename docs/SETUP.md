# the9thedition Setup

## 1) Link InsForge and install deps

```bash
cd web
npm install
npx @insforge/cli link
```

## 2) Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `INSFORGE_SERVICE_KEY` (server only)
- `INSFORGE_AVATAR_BUCKET` (default `avatars`)
- Optional Directus values if connected

## 3) Apply SQL migrations

```bash
npx @insforge/cli db query "$(cat insforge/sql/001_profiles_and_submissions.sql)"
npx @insforge/cli db query "$(cat insforge/sql/002_reader_hub.sql)"
npx @insforge/cli db query "$(cat insforge/sql/002_profile_avatar.sql)"
npx @insforge/cli db query "$(cat insforge/sql/003_project_enquiries.sql)"
npx @insforge/cli db query "$(cat insforge/sql/004_reader_folders.sql)"
npx @insforge/cli db query "$(cat insforge/sql/005_layout_documents.sql)"
```

## 4) Create storage bucket(s)

```bash
npx @insforge/cli storage create-bucket avatars -y
```

## 5) Bootstrap first admin (one time)

1. Sign up normally once to create the user.
2. Get that user UUID from InsForge auth/users.
3. Run:

```bash
ADMIN_BOOTSTRAP_USER_ID="<user-uuid>" npm run bootstrap:admin
```

This sets `profiles.role = admin` for that user.

## 6) Run app and checks

```bash
npm run dev
npm run lint
npm run build
```
