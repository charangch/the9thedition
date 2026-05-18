/* InsForge platform migration 034: storage.objects columns for REST/S3 uploads.
   Fixes: column "uploaded_via" of relation "objects" does not exist
   Apply: cd web && npx @insforge/cli link
          npx @insforge/cli db import insforge/sql/023_storage_objects_uploaded_via.sql */

ALTER TABLE storage.objects
  ADD COLUMN IF NOT EXISTS uploaded_via TEXT NOT NULL DEFAULT 'rest'
    CHECK (uploaded_via IN ('rest', 's3', 'dashboard')),
  ADD COLUMN IF NOT EXISTS s3_access_key_id TEXT,
  ADD COLUMN IF NOT EXISTS etag TEXT;

CREATE INDEX IF NOT EXISTS idx_storage_objects_s3_access_key_id
  ON storage.objects (s3_access_key_id)
  WHERE s3_access_key_id IS NOT NULL;
