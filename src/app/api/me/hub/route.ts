import { NextResponse } from "next/server";
import { getReaderHub } from "@/lib/reader-hub";
import { getProfileForUser } from "@/lib/profile";
import { getServerSession } from "@/lib/session";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, hub] = await Promise.all([
    getProfileForUser(session.user.id, session.accessToken),
    getReaderHub(session.accessToken),
  ]);

  return NextResponse.json({
    user: { id: session.user.id, email: session.user.email },
    profile,
    ...hub,
  });
}
