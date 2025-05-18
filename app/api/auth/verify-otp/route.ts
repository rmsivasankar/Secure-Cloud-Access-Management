import { NextResponse } from "next/server"
import { verifyOTP } from "@/lib/otp"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Verify the OTP
    const isValid = await verifyOTP(email, otp)

    if (!isValid) {
      // Log failed verification attempt
      await prisma.securityLog.create({
        data: {
          type: "OTP_VERIFICATION",
          message: `Failed OTP verification attempt for ${email}`,
          timestamp: new Date(),
        },
      })

      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Log successful verification
    await prisma.securityLog.create({
      data: {
        type: "OTP_VERIFICATION",
        message: `Successful OTP verification for ${email}`,
        timestamp: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
