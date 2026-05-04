import { NextResponse } from "next/server";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { getProfileForUser } from "@/lib/profile";
import { getServerSession } from "@/lib/session";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function avatarBucket(): string {
  return process.env.INSFORGE_AVATAR_BUCKET?.trim() || "avatars";
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const raw = form?.get("file");
  if (!(raw instanceof Blob)) {
    return NextResponse.json({ error: "Expected multipart field \"file\" with an image." }, { status: 400 });
  }

  const type = raw.type || "application/octet-stream";
  if (!ALLOWED.has(type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, WebP, or GIF image (max 5 MB)." },
      { status: 400 },
    );
  }
  if (raw.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
  }

  const ext = EXT[type] ?? "jpg";
  const key = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const client = createInsForgeServerClient(session.accessToken);
  const bucket = avatarBucket();

  const existing = await getProfileForUser(session.user.id, session.accessToken);
  const oldKey = existing?.custom_avatar_storage_key?.trim();

  if (oldKey) {
    await client.storage.from(bucket).remove(oldKey);
  }

  const { data, error } = await client.storage.from(bucket).upload(key, raw);

  if (error || !data?.url || !data?.key) {
    return NextResponse.json(
      {
        error:
          error?.message ??
          "Upload failed. Create a public storage bucket (e.g. \"avatars\") in InsForge and set INSFORGE_AVATAR_BUCKET if needed.",
      },
      { status: 400 },
    );
  }

  const { error: dbErr } = await client.database
    .from("profiles")
    .update({
      custom_avatar_url: data.url,
      custom_avatar_storage_key: data.key,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", session.user.id);

  if (dbErr) {
    await client.storage.from(bucket).remove(data.key).catch(() => {});
    return NextResponse.json(
      { error: dbErr.message ?? "Could not save profile. Apply migration insforge/sql/002_profile_avatar.sql." },
      { status: 400 },
    );
  }

  const profile = await getProfileForUser(session.user.id, session.accessToken);
  return NextResponse.json({ ok: true, url: data.url, profile });
}

export async function DELETE() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = createInsForgeServerClient(session.accessToken);
  const bucket = avatarBucket();
  const existing = await getProfileForUser(session.user.id, session.accessToken);
  const oldKey = existing?.custom_avatar_storage_key?.trim();

  if (oldKey) {
    await client.storage.from(bucket).remove(oldKey);
  }

  const { error } = await client.database
    .from("profiles")
    .update({
      custom_avatar_url: null,
      custom_avatar_storage_key: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const profile = await getProfileForUser(session.user.id, session.accessToken);
  return NextResponse.json({ ok: true, profile });
}
