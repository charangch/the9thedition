import { NextResponse } from "next/server";
import { getMySubmissions } from "@/lib/my-submissions";
import { getServerSession } from "@/lib/session";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await getMySubmissions(session.accessToken);
  return NextResponse.json({ submissions });
}
