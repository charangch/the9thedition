import { NextResponse } from "next/server";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { getServerSession } from "@/lib/session";

const MAX_FILES = 25;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function submissionsBucket() {
  return process.env.INSFORGE_SUBMISSIONS_BUCKET?.trim() || "submission-media";
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  const files = form.getAll("files").filter((x) => x instanceof Blob) as Blob[];
  if (files.length === 0) {
    return NextResponse.json({ error: "Select at least one image." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Upload up to ${MAX_FILES} images at once.` }, { status: 400 });
  }

  const client = createInsForgeServerClient(session.accessToken);
  const bucket = submissionsBucket();
  const uploaded: string[] = [];

  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP, or GIF images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Each image must be 10 MB or smaller." }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/gif" ? "gif" : file.type === "image/webp" ? "webp" : "jpg";
    const key = `${session.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { data, error } = await client.storage.from(bucket).upload(key, file);
    if (error || !data?.url) {
      return NextResponse.json(
        { error: error?.message ?? `Image upload failed. Ensure '${bucket}' bucket exists and is public.` },
        { status: 400 },
      );
    }
    uploaded.push(data.url);
  }

  return NextResponse.json({ ok: true, urls: uploaded });
}
