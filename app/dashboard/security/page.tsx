"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, AlertTriangle, RefreshCw, Send } from "lucide-react"

type SecurityAttack = {
  id: string
  type: string
  payload: string
  timestamp: string
  status: string
  description?: string
}

export default function SecurityDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [attacks, setAttacks] = useState<SecurityAttack[]>([])
  const [attackType, setAttackType] = useState("SQL_INJECTION")
  const [payload, setPayload] = useState("")
  const [isSimulating, setIsSimulating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "loading") return // Wait until session loads

    if (!session) {
      router.replace("/auth/login") // Redirect if not logged in
    } else if (session.user.role !== "ADMIN") {
      router.replace("/dashboard/user") // Redirect non-admins
    } else {
      setIsAuthorized(true) // Set authorization for admins
      fetchAttacks() // Fetch attacks data
    }
  }, [session, status, router])

  const fetchAttacks = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/security/attacks")
      const data = await res.json()

      if (data.success) {
        setAttacks(data.attacks || [])
      } else {
        setError("Failed to fetch security attacks")
      }
    } catch (error) {
      console.error("Error fetching security attacks:", error)
      setError("Error connecting to server")
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAttack = async () => {
    setError("")
    setSuccess("")
    setIsSimulating(true)

    try {
      const res = await fetch("/api/security/simulate-attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: attackType, payload }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(`Successfully simulated ${attackType} attack`)
        setPayload("")
        fetchAttacks() // Refresh the attacks list
      } else {
        setError(data.error || "Failed to simulate attack")
      }
    } catch (error) {
      console.error("Error simulating attack:", error)
      setError("An error occurred while simulating the attack")
    } finally {
      setIsSimulating(false)
    }
  }

  const getAttackTypeColor = (type: string) => {
    switch (type) {
      case "SQL_INJECTION":
        return "text-red-400"
      case "XSS":
        return "text-yellow-400"
      case "BRUTE_FORCE":
        return "text-purple-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DETECTED":
        return "text-yellow-400"
      case "BLOCKED":
        return "text-green-400"
      case "SUCCESSFUL":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  if (status === "loading" || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-cyan-400 animate-pulse">Authenticating...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent">
          Security Attack Simulator
        </h1>
        <p className="text-gray-400">Test and monitor security vulnerabilities</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg relative">
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
        <div className="mb-6 bg-green-900/50 border border-green-700 text-green-400 px-4 py-3 rounded-lg relative">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            <span>{success}</span>
          </div>
          <button
            onClick={() => setSuccess("")}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-400 hover:text-green-300"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1 bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Simulate Attack</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="attackType" className="block text-sm font-medium text-gray-300 mb-1">
                Attack Type
              </label>
              <select
                id="attackType"
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="SQL_INJECTION">SQL Injection</option>
                <option value="XSS">Cross-Site Scripting (XSS)</option>
                <option value="BRUTE_FORCE">Brute Force</option>
              </select>
            </div>

            <div>
              <label htmlFor="payload" className="block text-sm font-medium text-gray-300 mb-1">
                Payload
              </label>
              <textarea
                id="payload"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder={
                  attackType === "SQL_INJECTION"
                    ? "' OR 1=1 --"
                    : attackType === "XSS"
                      ? "<script>alert('XSS')</script>"
                      : "password123"
                }
                rows={4}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <button
              onClick={simulateAttack}
              disabled={isSimulating || !payload}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                isSimulating || !payload
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg hover:shadow-red-500/25"
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Simulate Attack
                </>
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-400">Security Attacks Log</h2>
            <button
              onClick={fetchAttacks}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse text-cyan-400">Loading security data...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700/50 text-left">
                    <th className="p-3 border-b border-gray-600">Type</th>
                    <th className="p-3 border-b border-gray-600">Payload</th>
                    <th className="p-3 border-b border-gray-600">Status</th>
                    <th className="p-3 border-b border-gray-600">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {attacks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-gray-400">
                        No security attacks detected.
                      </td>
                    </tr>
                  ) : (
                    attacks.map((attack) => (
                      <tr key={attack.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className={`p-3 border-b border-gray-700 ${getAttackTypeColor(attack.type)}`}>
                          {attack.type}
                        </td>
                        <td className="p-3 border-b border-gray-700 text-gray-300">
                          <div className="max-w-xs truncate">{attack.payload}</div>
                        </td>
                        <td className={`p-3 border-b border-gray-700 ${getStatusColor(attack.status)}`}>
                          {attack.status}
                        </td>
                        <td className="p-3 border-b border-gray-700 text-gray-400">
                          {new Date(attack.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
