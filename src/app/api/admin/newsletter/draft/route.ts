import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    { error: "Newsletter draft generation is disabled." },
    { status: 405 },
  );
}
