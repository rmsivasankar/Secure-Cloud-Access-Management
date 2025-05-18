"use client"

import type React from "react"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import GitHubAuthButton from "@/components/GitHubAuthButton"
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("") // Store error message
  const [attempts, setAttempts] = useState(0) // Track login attempts
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const maxAttempts = 3 // Maximum allowed attempts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("") // Reset previous error
    setIsLoading(true)

    if (attempts >= maxAttempts) {
      setErrorMessage("Maximum login attempts exceeded. Please try again later.")
      setIsLoading(false)
      return
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.ok) {
        // Password is correct, now request OTP
        const otpRes = await fetch("/api/auth/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })

        if (otpRes.ok) {
          // Redirect to OTP verification page
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
        } else {
          const otpData = await otpRes.json()
          setErrorMessage(otpData.error || "Failed to send verification code")
        }
      } else {
        setAttempts((prev) => prev + 1) // Increment attempts on failure
        setErrorMessage("Invalid email or password. Please try again.")

        // Log failed login attempt
        await fetch("/api/security/attacks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "BRUTE_FORCE",
            payload: email,
            status: "DETECTED",
            description: `Failed login attempt ${attempts + 1} for ${email}`,
          }),
        })
      }
    } catch (error) {
      setErrorMessage("An error occurred during login. Please try again.")
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
          <p className="text-gray-300 max-w-md">Securing the future through advanced technology and innovation</p>
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

          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent mb-6">
            Secure Login
          </h2>

          {/* Error Alert */}
          {errorMessage && (
            <div
              className="mb-6 bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg relative"
              role="alert"
            >
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link href="/auth/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isLoading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25"
              }`}
              disabled={isLoading || attempts >= maxAttempts}
            >
              {isLoading ? "Authenticating..." : "Login"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <GitHubAuthButton />
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-cyan-400 hover:text-cyan-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
