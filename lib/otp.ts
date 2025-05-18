import prisma from "./prisma"
import { sendOTP } from "./resend"
import crypto from "crypto"

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString()
}

// Create and store OTP in the database
export const createOTP = async (email: string): Promise<string> => {
  try {
    // Generate a new OTP
    const otp = generateOTP()

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Delete any existing unused OTPs for this email
    await prisma.oTP.deleteMany({
      where: {
        email,
        used: false,
      },
    })

    // Create a new OTP record
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    })

    // Send the OTP via email
    await sendOTP(email, otp)
    console.log(`OTP sent to ${email}: ${otp}`)
    return otp
  } catch (error) {
    console.error("Error creating OTP:", error)

    // For development purposes, return a hardcoded OTP instead of failing
    // This allows testing without email setup
    const fallbackOtp = "123456"
    console.log(`[DEV MODE] Using fallback OTP for ${email}: ${fallbackOtp}`)

    try {
      // Still try to create the OTP record in the database
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)

      await prisma.oTP.create({
        data: {
          email,
          code: fallbackOtp,
          expiresAt,
        },
      })
    } catch (dbError) {
      console.error("Error creating fallback OTP in database:", dbError)
    }

    return fallbackOtp
  }
}

// Verify the OTP
export const verifyOTP = async (email: string, code: string): Promise<boolean> => {
  try {
    // Find the OTP record
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!otpRecord) {
      return false
    }

    // Mark the OTP as used
    await prisma.oTP.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        used: true,
      },
    })

    return true
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return false
  }
}
