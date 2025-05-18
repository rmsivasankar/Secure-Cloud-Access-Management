import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "Unknown IP"

  return NextResponse.json({ ip })
}
