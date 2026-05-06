import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizePlainText } from "@/lib/api-validation";
import { createInsForgeServerClientPublic, getInsForgePublicEnv } from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z
  .object({
    email: z.string().email(),
    status: z.enum(["subscribed", "unsubscribed"]),
    source: z.string().max(80).optional(),
    name: z.string().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "subscribed") {
      const trimmed = data.name?.trim() ?? "";
      if (trimmed.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is required to subscribe.",
          path: ["name"],
        });
      }
    }
  });

function dbErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const o = error as Record<string, unknown>;
    const msg = o.message ?? o.error ?? o.details ?? o.hint;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  if (typeof error === "string" && error.trim()) return error.trim();
  return "Database request failed.";
}

export async function POST(request: Request) {
  try {
    if (!getInsForgePublicEnv()) {
      return NextResponse.json(
        { error: "Newsletter is not configured on this server." },
        { status: 503 },
      );
    }

    const limiter = rateLimit(`newsletter:public:${clientIp(request)}`, { limit: 20, windowMs: 60_000 });
    if (!limiter.ok) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const email = sanitizePlainText(parsed.data.email, 320).toLowerCase();
    const now = new Date().toISOString();

    const client = createInsForgeServerClientPublic();

    if (parsed.data.status === "unsubscribed") {
      const { error } = await client.database
        .from("newsletter_subscriptions")
        .update({ status: "unsubscribed", updated_at: now })
        .eq("email", email);
      if (error) {
        console.error("newsletter unsubscribe:", error);
        return NextResponse.json({ error: dbErrorMessage(error) }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    const subscriberName = sanitizePlainText((parsed.data.name ?? "").trim(), 120);
    const source = sanitizePlainText(parsed.data.source ?? "web", 80);
    const { error } = await client.database.from("newsletter_subscriptions").upsert(
      [
        {
          user_id: null,
          email,
          subscriber_name: subscriberName,
          status: "subscribed",
          source,
          updated_at: now,
        },
      ],
      { onConflict: "email" },
    );

    if (error) {
      console.error("newsletter upsert:", error);
      return NextResponse.json({ error: dbErrorMessage(error) }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("newsletter/subscription:", e);
    const msg = e instanceof Error && e.message ? e.message : "Unexpected server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
