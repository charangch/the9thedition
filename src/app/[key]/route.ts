import { NextResponse } from "next/server";

/**
 * IndexNow key file: https://www.example.com/{INDEXNOW_KEY}.txt
 * Content must equal the key (see IndexNow documentation).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  const secret = process.env.INDEXNOW_KEY?.trim();
  if (!secret || key !== `${secret}.txt`) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return new NextResponse(secret, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
