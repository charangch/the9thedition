import { NextResponse } from "next/server";
import { z } from "zod";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { getServerSession } from "@/lib/session";

const folderSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

const itemSchema = z.object({
  folderId: z.string().uuid(),
  itemType: z.enum(["project", "article", "news"]),
  itemSlug: z.string().min(1).max(180),
  title: z.string().min(1).max(220),
  imageUrl: z.string().url().optional(),
});

const removeItemSchema = z.object({
  folderItemId: z.string().uuid(),
});

const removeFolderSchema = z.object({
  folderId: z.string().uuid(),
});

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const client = createInsForgeServerClient(session.accessToken);

  const [{ data: folders, error: fErr }, { data: items, error: iErr }] = await Promise.all([
    client.database
      .from("reader_folders")
      .select("id, name, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100),
    client.database
      .from("reader_folder_items")
      .select("id, folder_id, item_type, item_slug, title, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(400),
  ]);

  if (fErr || iErr) return NextResponse.json({ error: fErr?.message ?? iErr?.message }, { status: 400 });
  return NextResponse.json({ folders: folders ?? [], items: items ?? [] });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = folderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const client = createInsForgeServerClient(session.accessToken);
  const { error } = await client.database.from("reader_folders").upsert(
    [
      {
        user_id: session.user.id,
        name: parsed.data.name,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "user_id,name" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const client = createInsForgeServerClient(session.accessToken);
  const { error } = await client.database.from("reader_folder_items").upsert(
    [
      {
        folder_id: parsed.data.folderId,
        user_id: session.user.id,
        item_type: parsed.data.itemType,
        item_slug: parsed.data.itemSlug,
        title: parsed.data.title,
        image_url: parsed.data.imageUrl ?? null,
      },
    ],
    { onConflict: "folder_id,item_type,item_slug" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const removeItem = removeItemSchema.safeParse(body);
  const client = createInsForgeServerClient(session.accessToken);

  if (removeItem.success) {
    const { error } = await client.database
      .from("reader_folder_items")
      .delete()
      .eq("id", removeItem.data.folderItemId)
      .eq("user_id", session.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const removeFolder = removeFolderSchema.safeParse(body);
  if (!removeFolder.success) return NextResponse.json({ error: removeFolder.error.flatten() }, { status: 400 });

  const { error } = await client.database
    .from("reader_folders")
    .delete()
    .eq("id", removeFolder.data.folderId)
    .eq("user_id", session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
