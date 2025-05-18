import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ip = searchParams.get("ip")

    if (!ip) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 })
    }

    // Check if IP is explicitly allowed or blocked
    const ipRule = await prisma.iPAccess.findUnique({
      where: { ipAddress: ip },
    })

    // If no rule exists, default to allowed for development purposes
    // In production, you might want to change this default behavior
    if (!ipRule) {
      return NextResponse.json({ allowed: true, reason: "No rule found, default to allowed" })
    }

    const allowed = ipRule.type === "ALLOWED"

    return NextResponse.json({
      allowed,
      reason: allowed ? "IP is explicitly allowed" : "IP is explicitly blocked",
      rule: ipRule,
    })
  } catch (error) {
    console.error("Error checking IP access:", error)
    // Default to allowed in case of error for development purposes
    return NextResponse.json({ allowed: true, reason: "Error checking IP, default to allowed" })
  }
}
