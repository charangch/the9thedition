import { cookies } from "next/headers";
import type { UserSchema } from "@insforge/shared-schemas";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookies";
import { createInsForgeServerClient } from "@/lib/insforge-server";

export type ServerSession = {
  user: UserSchema;
  accessToken: string;
  refreshToken: string | undefined;
};

export async function getServerSession(): Promise<ServerSession | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }

  const client = createInsForgeServerClient(accessToken);
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) {
    return null;
  }

  return {
    user: data.user,
    accessToken,
    refreshToken,
  };
}
