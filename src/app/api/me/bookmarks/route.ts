import { NextResponse } from "next/server";
import { z } from "zod";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { getServerSession } from "@/lib/session";

const createSchema = z.object({
  itemType: z.enum(["project", "article", "news"]),
  itemSlug: z.string().min(1).max(180),
  title: z.string().min(1).max(220),
  imageUrl: z.string().url().optional(),
});

const removeSchema = z.object({
  itemType: z.enum(["project", "article", "news"]),
  itemSlug: z.string().min(1).max(180),
});

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = createInsForgeServerClient(session.accessToken);
  const { data, error } = await client.database
    .from("reader_bookmarks")
    .select("id, item_type, item_slug, title, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ bookmarks: data ?? [] });
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
  const { error } = await client.database.from("reader_bookmarks").upsert(
    [
      {
        user_id: session.user.id,
        item_type: parsed.data.itemType,
        item_slug: parsed.data.itemSlug,
        title: parsed.data.title,
        image_url: parsed.data.imageUrl ?? null,
      },
    ],
    { onConflict: "user_id,item_type,item_slug" },
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
    .from("reader_bookmarks")
    .delete()
    .eq("user_id", session.user.id)
    .eq("item_type", parsed.data.itemType)
    .eq("item_slug", parsed.data.itemSlug);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
