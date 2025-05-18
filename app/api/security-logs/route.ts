import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch security logs from the database
    const logs = await prisma.securityLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 50, // Limit to the most recent 50 logs
    })

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error) {
    console.error("Error fetching security logs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch security logs" }, { status: 500 })
  }
}
