import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { type, payload } = await req.json()

    if (!type || !payload) {
      return NextResponse.json({ error: "Type and payload are required" }, { status: 400 })
    }

    const status = "DETECTED"
    let description = ""

    switch (type) {
      case "SQL_INJECTION":
        description = "Simulated SQL injection attack"
        // Log to security logs
        await prisma.securityLog.create({
          data: {
            type: "SQL Injection",
            message: `Simulated SQLi: ${payload}`,
            timestamp: new Date(),
          },
        })
        break

      case "XSS":
        description = "Simulated cross-site scripting attack"
        // Log to security logs
        await prisma.securityLog.create({
          data: {
            type: "XSS",
            message: `Simulated XSS: ${payload}`,
            timestamp: new Date(),
          },
        })
        break

      case "BRUTE_FORCE":
        description = "Simulated brute force attack"
        // Log to security logs
        await prisma.securityLog.create({
          data: {
            type: "Brute Force",
            message: `Simulated brute force: ${payload}`,
            timestamp: new Date(),
          },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid attack type" }, { status: 400 })
    }

    // Log to security attacks table
    const attack = await prisma.securityAttack.create({
      data: {
        type,
        payload,
        status,
        description,
      },
    })

    return NextResponse.json({ success: true, attack }, { status: 201 })
  } catch (error) {
    console.error("Error simulating attack:", error)
    return NextResponse.json({ error: "Failed to simulate attack" }, { status: 500 })
  }
}
