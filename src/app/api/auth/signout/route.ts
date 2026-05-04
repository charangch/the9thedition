import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, clearAuthCookies } from "@/lib/auth-cookies";
import { createInsForgeServerClient } from "@/lib/insforge-server";

export async function POST() {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;

  if (access) {
    const client = createInsForgeServerClient(access);
    await client.auth.signOut();
  }

  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
