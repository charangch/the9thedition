import { NextResponse } from "next/server";
import { z } from "zod";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { getProfileForUser } from "@/lib/profile";
import { getServerSession } from "@/lib/session";

const patchSchema = z.object({
  displayName: z.string().max(120).optional(),
  bio: z.string().max(220).optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagramHandle: z.string().max(80).optional(),
});

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfileForUser(session.user.id, session.accessToken);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.displayName !== undefined) payload.display_name = parsed.data.displayName;
  if (parsed.data.bio !== undefined) payload.bio = parsed.data.bio;
  if (parsed.data.website !== undefined) payload.website = parsed.data.website || null;
  if (parsed.data.instagramHandle !== undefined) {
    payload.instagram_handle = parsed.data.instagramHandle.replace(/^@/, "");
  }

  const client = createInsForgeServerClient(session.accessToken);
  const { error } = await client.database.from("profiles").update(payload).eq("user_id", session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const profile = await getProfileForUser(session.user.id, session.accessToken);
  return NextResponse.json({ ok: true, profile });
}
