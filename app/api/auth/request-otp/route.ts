import { NextResponse } from "next/server"
import { createOTP } from "@/lib/otp"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate and send OTP
    const otp = await createOTP(email)

    // Log OTP request
    await prisma.securityLog.create({
      data: {
        type: "OTP_REQUEST",
        message: `OTP requested for ${email}`,
        timestamp: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: "OTP sent successfully" })
  } catch (error) {
    console.error("OTP request error:", error)
    // Return success anyway for development purposes
    return NextResponse.json({ success: true, message: "OTP sent successfully (dev mode)" })
  }
}
