import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get security metrics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get attack counts by type
    const attackCounts = await prisma.securityAttack.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
    })

    // Get alert counts by severity
    const alertCounts = await prisma.securityAlert.groupBy({
      by: ["severity"],
      _count: {
        severity: true,
      },
    })

    // Get latest metrics
    const metrics = await prisma.securityMetric.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    // Get total counts
    const totalAttacks = await prisma.securityAttack.count()
    const totalAlerts = await prisma.securityAlert.count()
    const totalLogs = await prisma.securityLog.count()

    // Get recent activity
    const recentActivity = await prisma.securityLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 5,
    })

    return NextResponse.json({
      success: true,
      metrics: {
        attackCounts,
        alertCounts,
        metrics,
        totals: {
          attacks: totalAttacks,
          alerts: totalAlerts,
          logs: totalLogs,
        },
        recentActivity,
      },
    })
  } catch (error) {
    console.error("Error fetching security metrics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch security metrics" }, { status: 500 })
  }
}

// Create or update security metrics
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, value, unit, category } = await req.json()

    if (!name || value === undefined) {
      return NextResponse.json({ error: "Name and value are required" }, { status: 400 })
    }

    const metric = await prisma.securityMetric.create({
      data: {
        name,
        value,
        unit,
        category,
      },
    })

    return NextResponse.json({ success: true, metric }, { status: 201 })
  } catch (error) {
    console.error("Error creating security metric:", error)
    return NextResponse.json({ success: false, error: "Failed to create security metric" }, { status: 500 })
  }
}
