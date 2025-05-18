import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const attacks = await prisma.securityAttack.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    })

    return NextResponse.json({ success: true, attacks })
  } catch (error) {
    console.error("Error fetching security attacks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch security attacks" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { type, payload, ipAddress, userAgent, status, description } = await req.json()

    if (!type || !payload) {
      return NextResponse.json({ error: "Type and payload are required" }, { status: 400 })
    }

    const attack = await prisma.securityAttack.create({
      data: {
        type,
        payload,
        ipAddress,
        userAgent,
        status: status || "DETECTED",
        description,
      },
    })

    return NextResponse.json({ success: true, attack }, { status: 201 })
  } catch (error) {
    console.error("Error logging security attack:", error)
    return NextResponse.json({ error: "Failed to log security attack" }, { status: 500 })
  }
}
