import { NextResponse } from "next/server";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";

const MAX_FILES = 60;
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "text/plain",
]);

function submissionsBucket() {
  return process.env.INSFORGE_SUBMISSIONS_BUCKET?.trim() || "submission-media";
}

function extensionFor(file: Blob): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/webp") return "webp";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "text/plain") return "txt";
  return "jpg";
}

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  const files = form.getAll("files").filter((x) => x instanceof Blob) as Blob[];
  if (files.length === 0) {
    return NextResponse.json({ error: "Select at least one file." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Upload up to ${MAX_FILES} files at once.` }, { status: 400 });
  }

  const client = createInsForgeServerClient(admin.session.accessToken);
  const bucket = submissionsBucket();
  const uploaded: string[] = [];

  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Allowed file types: image, video, PDF, or plain text." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Each file must be 25 MB or smaller." }, { status: 400 });
    }

    const key = `admin-publishing/${admin.session.user.id}/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file)}`;
    const { data, error } = await client.storage.from(bucket).upload(key, file);
    if (error || !data?.url) {
      return NextResponse.json(
        { error: error?.message ?? `Upload failed. Ensure '${bucket}' bucket exists and is public.` },
        { status: 400 },
      );
    }
    uploaded.push(data.url);
  }

  return NextResponse.json({ ok: true, urls: uploaded });
}
