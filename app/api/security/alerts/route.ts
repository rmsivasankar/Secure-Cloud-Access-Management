import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get security alerts
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const alerts = await prisma.securityAlert.findMany({
      orderBy: { timestamp: "desc" },
    })

    return NextResponse.json({ success: true, alerts })
  } catch (error) {
    console.error("Error fetching security alerts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch security alerts" }, { status: 500 })
  }
}

// Create a new security alert
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { severity, title, description } = await req.json()

    if (!severity || !title || !description) {
      return NextResponse.json({ error: "Severity, title, and description are required" }, { status: 400 })
    }

    const alert = await prisma.securityAlert.create({
      data: {
        severity,
        title,
        description,
        status: "NEW",
      },
    })

    return NextResponse.json({ success: true, alert }, { status: 201 })
  } catch (error) {
    console.error("Error creating security alert:", error)
    return NextResponse.json({ success: false, error: "Failed to create security alert" }, { status: 500 })
  }
}

// Update a security alert
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id, status, resolvedBy } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ error: "Alert ID and status are required" }, { status: 400 })
    }

    const data: any = { status }

    // If resolving the alert, add resolution details
    if (status === "RESOLVED") {
      data.resolvedAt = new Date()
      data.resolvedBy = resolvedBy || session.user.id
    }

    const alert = await prisma.securityAlert.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, alert })
  } catch (error) {
    console.error("Error updating security alert:", error)
    return NextResponse.json({ success: false, error: "Failed to update security alert" }, { status: 500 })
  }
}
