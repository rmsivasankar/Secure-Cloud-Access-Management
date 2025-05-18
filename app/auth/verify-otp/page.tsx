"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, AlertTriangle, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerifyOTP() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  // Redirect if no email is provided
  useEffect(() => {
    if (!email) {
      router.replace("/auth/login")
    }
  }, [email, router])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle input change
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  // Handle key down (for backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")

    if (!/^\d+$/.test(pastedData)) {
      return
    }

    const digits = pastedData.slice(0, 6).split("")
    const newOtp = [...otp]

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit
      }
    })

    setOtp(newOtp)

    // Focus the next empty input or the last one
    for (let i = digits.length; i < 6; i++) {
      const nextInput = document.getElementById(`otp-${i}`)
      if (nextInput) {
        nextInput.focus()
        break
      }
    }
  }

  // Request a new OTP
  const requestNewOTP = async () => {
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setTimeLeft(600) // Reset timer
        setSuccess("A new verification code has been sent to your email.")
        setTimeout(() => setSuccess(""), 5000)
      } else {
        setError(data.error || "Failed to send new code")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Submit OTP for verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess("Verification successful! Redirecting...")

        // Redirect to appropriate dashboard based on role
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setError(data.error || "Invalid verification code")
      }
    } catch (error) {
      setError("An error occurred during verification")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Left Image Section */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://pure4runner.com/images/pureumbrella.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Umbrella Corporation</h2>
          <p className="text-gray-300 max-w-md">Multi-factor authentication for enhanced security</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 bg-red-600 rounded-full opacity-80 animate-pulse"></div>
              <Shield className="w-16 h-16 text-white relative z-10" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            Verification Required
          </h2>

          <p className="text-center text-gray-400 mb-6">Enter the 6-digit code sent to {email}</p>

          {/* Error Alert */}
          {error && (
            <div
              className="mb-6 bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg relative"
              role="alert"
            >
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div
              className="mb-6 bg-green-900/50 border border-green-700 text-green-400 px-4 py-3 rounded-lg relative"
              role="alert"
            >
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Verification Code</label>
                <span className="text-sm text-cyan-400">Expires in {formatTime(timeLeft)}</span>
              </div>

              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isLoading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center space-y-4">
            <button
              onClick={requestNewOTP}
              disabled={isLoading || timeLeft > 540} // Disable for first minute
              className={`text-sm ${
                isLoading || timeLeft > 540 ? "text-gray-500 cursor-not-allowed" : "text-cyan-400 hover:text-cyan-300"
              }`}
            >
              {timeLeft > 540
                ? `Request new code in ${formatTime(timeLeft - 540)}`
                : "Didn't receive a code? Send again"}
            </button>

            <Link href="/auth/login" className="flex items-center text-sm text-gray-400 hover:text-gray-300">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
