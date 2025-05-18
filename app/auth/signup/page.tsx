"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { Shield, AlertTriangle, Check } from "lucide-react"
import Link from "next/link"

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("USER")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [allowed, setAllowed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkIP = async () => {
      try {
        setIsChecking(true)
        let userIP = "::-1"

        const res = await fetch("/api/get-ip")
        const data = await res.json()
        userIP = data.ip

        if (!userIP || userIP === "Unknown IP") {
          const externalRes = await fetch("https://api.ipify.org?format=json")
          const externalData = await externalRes.json()
          userIP = externalData.ip
        }

        console.log("Detected IPv4:", userIP)

        // Check if IP is in allowed list or not in blocked list
        const ipCheckRes = await fetch(`/api/ip-access/check?ip=${userIP}`)
        const ipCheckData = await ipCheckRes.json()

        setAllowed(ipCheckData.allowed)
      } catch (err) {
        console.error("Error fetching IP:", err)
        // Default to allowed in case of error for development purposes
        setAllowed(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkIP()
  }, [])

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, and numbers")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      if (res.ok) {
        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || "Signup failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-cyan-400 animate-pulse">Verifying access...</div>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 p-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-500 mb-2">Access Denied</h1>
        <p className="text-gray-400 text-center max-w-md">
          Your IP address is not authorized to access this registration portal. Please contact system administration if
          you believe this is an error.
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    )
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
          <p className="text-gray-300 max-w-md">Join our team of elite professionals</p>
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
            Create Account
          </h2>

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
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                Account Type
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
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
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
