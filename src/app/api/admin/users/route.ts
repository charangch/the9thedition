import { NextResponse } from "next/server";
import { z } from "zod";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import {
  createInsForgeServerClient,
  createInsForgeServerClientPublic,
  createInsForgeServiceClient,
} from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(120).optional(),
});

const deleteSchema = z.object({
  userId: z.string().uuid(),
});

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = createInsForgeServerClient(admin.session.accessToken);
  const { data, error } = await client.database
    .from("profiles")
    .select("user_id, role, display_name")
    .eq("role", "admin")
    .order("display_name", { ascending: true })
    .limit(300);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ users: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (!isAllowedAdminEmail(parsed.data.email)) {
    return NextResponse.json({ error: "Only @theninthedition.com emails are allowed for admins." }, { status: 400 });
  }

  // Create auth user with the public auth API first.
  const publicClient = createInsForgeServerClientPublic();
  const { data: authData, error: signUpError } = await publicClient.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.displayName?.trim() || undefined,
  });
  if (signUpError) return NextResponse.json({ error: signUpError.message }, { status: 400 });

  // Resolve user id and upsert profile role/display.
  const userId = await (async () => {
    try {
      const svc = createInsForgeServiceClient();
      const { data: users } = await svc.database
        .from("auth.users")
        .select("id")
        .eq("email", parsed.data.email)
        .limit(1);
      return Array.isArray(users) && users[0] ? String((users[0] as { id: string }).id) : null;
    } catch {
      return null;
    }
  })();

  if (!userId && !authData?.accessToken) {
    return NextResponse.json(
      { error: "User created but profile setup is pending. Sign in once, then assign role." },
      { status: 202 },
    );
  }

  const effectiveUserId = userId;
  if (effectiveUserId) {
    const client = createInsForgeServerClient(admin.session.accessToken);
    const { error } = await client.database.from("profiles").upsert(
      [
        {
          user_id: effectiveUserId,
          role: "admin",
          display_name: parsed.data.displayName?.trim() || parsed.data.email,
        },
      ],
      { onConflict: "user_id" },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  void request;
  return NextResponse.json(
    { error: "Role editing is disabled. User management supports admin create/delete only." },
    { status: 405 },
  );
}

export async function DELETE(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const json = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.userId === admin.session.user.id) {
    return NextResponse.json({ error: "You cannot remove your own admin account." }, { status: 400 });
  }

  // Safe fallback: remove profile row so user is effectively removed from managed roles.
  const client = createInsForgeServerClient(admin.session.accessToken);
  const { error } = await client.database.from("profiles").delete().eq("user_id", parsed.data.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
