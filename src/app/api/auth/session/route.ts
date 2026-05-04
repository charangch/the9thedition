import { NextResponse } from "next/server";
import { resolveAvatarSource, resolveProfileAvatarUrl } from "@/lib/avatar";
import { getProfileForUser } from "@/lib/profile";
import { getServerSession } from "@/lib/session";
import { getDisplayNameFromUser } from "@/lib/user-display";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ user: null, profile: null });
  }

  let profile = null;
  try {
    profile = await getProfileForUser(session.user.id, session.accessToken);
  } catch {
    profile = null;
  }

  const u = session.user;
  const avatarSource = resolveAvatarSource(u, profile);
  return NextResponse.json({
    user: {
      id: u.id,
      email: u.email,
      name: getDisplayNameFromUser(u),
      avatarUrl: resolveProfileAvatarUrl(u, profile),
      avatarSource: avatarSource.kind,
      avatarSourceLabel: avatarSource.label,
    },
    profile,
  });
}
