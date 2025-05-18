import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get all IP access rules
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const ipRules = await prisma.iPAccess.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, ipRules })
  } catch (error) {
    console.error("Error fetching IP access rules:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch IP access rules" }, { status: 500 })
  }
}

// Create a new IP access rule
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { ipAddress, type, description } = await req.json()

    if (!ipAddress || !type) {
      return NextResponse.json({ error: "IP address and type are required" }, { status: 400 })
    }

    // Check if IP already exists
    const existingRule = await prisma.iPAccess.findUnique({
      where: { ipAddress },
    })

    if (existingRule) {
      // Update existing rule
      const updatedRule = await prisma.iPAccess.update({
        where: { ipAddress },
        data: {
          type,
          description,
          updatedAt: new Date(),
          createdBy: session.user.id,
        },
      })

      return NextResponse.json({ success: true, ipRule: updatedRule, updated: true })
    }

    // Create new rule
    const newRule = await prisma.iPAccess.create({
      data: {
        ipAddress,
        type,
        description,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({ success: true, ipRule: newRule }, { status: 201 })
  } catch (error) {
    console.error("Error creating IP access rule:", error)
    return NextResponse.json({ success: false, error: "Failed to create IP access rule" }, { status: 500 })
  }
}

// Delete an IP access rule
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "IP rule ID is required" }, { status: 400 })
    }

    await prisma.iPAccess.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting IP access rule:", error)
    return NextResponse.json({ success: false, error: "Failed to delete IP access rule" }, { status: 500 })
  }
}
