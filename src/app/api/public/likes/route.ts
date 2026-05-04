import { NextResponse } from "next/server";
import { z } from "zod";
import { adjustLikeCount, getLikeCount } from "@/lib/like-store";

const targetSchema = z.string().min(1).max(512);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = targetSchema.safeParse(searchParams.get("target") ?? "");
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }
  const count = getLikeCount(parsed.data);
  return NextResponse.json({ count });
}

const postSchema = z.object({
  target: z.string().min(1).max(512),
  action: z.enum(["like", "unlike"]),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { target, action } = postSchema.parse(json);
    const delta = action === "like" ? 1 : -1;
    const count = adjustLikeCount(target, delta);
    return NextResponse.json({ count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
