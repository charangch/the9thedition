import { NextResponse } from "next/server";
import { z } from "zod";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { getServerSession } from "@/lib/session";

const createSchema = z.object({
  targetType: z.enum(["professional", "topic", "section"]),
  targetSlug: z.string().min(1).max(160),
  targetName: z.string().min(1).max(180),
});

const removeSchema = z.object({
  targetType: z.enum(["professional", "topic", "section"]),
  targetSlug: z.string().min(1).max(160),
});

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = createInsForgeServerClient(session.accessToken);
  const { data, error } = await client.database
    .from("reader_follows")
    .select("id, target_type, target_slug, target_name, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ follows: data ?? [] });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = createInsForgeServerClient(session.accessToken);
  const { error } = await client.database.from("reader_follows").upsert(
    [
      {
        user_id: session.user.id,
        target_type: parsed.data.targetType,
        target_slug: parsed.data.targetSlug,
        target_name: parsed.data.targetName,
      },
    ],
    { onConflict: "user_id,target_type,target_slug" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = removeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = createInsForgeServerClient(session.accessToken);
  const { error } = await client.database
    .from("reader_follows")
    .delete()
    .eq("user_id", session.user.id)
    .eq("target_type", parsed.data.targetType)
    .eq("target_slug", parsed.data.targetSlug);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
