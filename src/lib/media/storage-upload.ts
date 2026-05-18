import type { createInsForgeServerClient } from "@/lib/insforge-server";
import { extensionForImageMime, isAllowedImageUpload, resolveImageMime } from "@/lib/media/file-mime";

type StorageClient = ReturnType<typeof createInsForgeServerClient>;

export type UploadedMedia = { url: string; key: string };

export async function uploadImageToBucket(
  client: StorageClient,
  bucket: string,
  keyPrefix: string,
  file: Blob,
  filename?: string,
): Promise<UploadedMedia> {
  if (!isAllowedImageUpload(file, filename)) {
    throw new Error(
      `Unsupported image type. Use JPEG, PNG, WebP, GIF, or AVIF (file: ${filename ?? "unknown"}).`,
    );
  }

  const mime = resolveImageMime(file, filename);
  const ext = extensionForImageMime(mime, filename);
  const key = `${keyPrefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const body =
    file instanceof File && file.type === mime
      ? file
      : new File([file], filename ?? `upload.${ext}`, { type: mime });

  const storage = client.storage.from(bucket);
  const { data, error } = await storage.upload(key, body);

  if (error) {
    const message = error.message ?? `Upload failed for bucket "${bucket}".`;
    if (/uploaded_via/i.test(message) && /does not exist/i.test(message)) {
      throw new Error(
        "InsForge storage schema is missing the uploaded_via column. From the web folder, run: npx @insforge/cli link && npx @insforge/cli db import insforge/sql/023_storage_objects_uploaded_via.sql",
      );
    }
    throw new Error(message);
  }

  const uploadedKey = data?.key ?? key;
  const url = data?.url?.trim() || storage.getPublicUrl(uploadedKey);

  if (!url) {
    throw new Error(`Upload succeeded but no public URL was returned for bucket "${bucket}".`);
  }

  return { url, key: uploadedKey };
}

export function parseUploadFormFiles(form: FormData): File[] {
  const fromFiles = form.getAll("files");
  const fromFile = form.getAll("file");
  const merged = [...fromFiles, ...fromFile];
  return merged.filter((x): x is File => x instanceof File);
}
