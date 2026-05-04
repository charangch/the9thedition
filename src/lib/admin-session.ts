import { getProfileForUser } from "@/lib/profile";
import { getServerSession } from "@/lib/session";

export async function requireAdminSession() {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  const profile = await getProfileForUser(session.user.id, session.accessToken);
  if (!profile || profile.role !== "admin") {
    return null;
  }
  return { session, profile };
}
