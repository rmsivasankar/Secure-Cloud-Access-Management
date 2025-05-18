import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const logs = await prisma.securityLog.findMany({
      orderBy: { timestamp: "desc" },
    })

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    console.error("Error fetching security logs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch logs" })
  }
}
