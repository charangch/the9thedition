import { NextResponse } from "next/server";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";
import { parseUploadFormFiles, uploadImageToBucket } from "@/lib/media/storage-upload";

const MAX_FILES = 60;
const MAX_BYTES = 25 * 1024 * 1024;

function submissionsBucket() {
  return process.env.INSFORGE_SUBMISSIONS_BUCKET?.trim() || "submission-media";
}

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const files = parseUploadFormFiles(form);
  if (files.length === 0) {
    return NextResponse.json({ error: "Select at least one image file." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Upload up to ${MAX_FILES} files at once.` }, { status: 400 });
  }

  const client = createInsForgeServerClient(admin.session.accessToken);
  const bucket = submissionsBucket();
  const keyPrefix = `admin-publishing/${admin.session.user.id}`;
  const uploaded: string[] = [];

  try {
    for (const file of files) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "Each file must be 25 MB or smaller." }, { status: 400 });
      }
      const result = await uploadImageToBucket(client, bucket, keyPrefix, file, file.name);
      uploaded.push(result.url);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, urls: uploaded });
}
