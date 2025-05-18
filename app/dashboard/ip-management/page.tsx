"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw, Plus, Trash2, Check } from "lucide-react"

type IPRule = {
  id: string
  ipAddress: string
  type: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function IPManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [ipRules, setIpRules] = useState<IPRule[]>([])
  const [newIpAddress, setNewIpAddress] = useState("")
  const [newIpType, setNewIpType] = useState("ALLOWED")
  const [newIpDescription, setNewIpDescription] = useState("")
  const [isAdding, setIsAdding] = useState(false)
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
      fetchIpRules() // Fetch IP rules
    }
  }, [session, status, router])

  const fetchIpRules = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/ip-access")
      const data = await res.json()

      if (data.success) {
        setIpRules(data.ipRules || [])
      } else {
        setError("Failed to fetch IP access rules")
      }
    } catch (error) {
      console.error("Error fetching IP access rules:", error)
      setError("Error connecting to server")
    } finally {
      setIsLoading(false)
    }
  }

  const addIpRule = async () => {
    setError("")
    setSuccess("")
    setIsAdding(true)

    // Validate IP address format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(newIpAddress)) {
      setError("Please enter a valid IPv4 address")
      setIsAdding(false)
      return
    }

    try {
      const res = await fetch("/api/ip-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: newIpAddress,
          type: newIpType,
          description: newIpDescription,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.updated ? "IP rule updated successfully" : "IP rule added successfully")
        setNewIpAddress("")
        setNewIpDescription("")
        fetchIpRules() // Refresh the IP rules list
      } else {
        setError(data.error || "Failed to add IP rule")
      }
    } catch (error) {
      console.error("Error adding IP rule:", error)
      setError("An error occurred while adding the IP rule")
    } finally {
      setIsAdding(false)
    }
  }

  const deleteIpRule = async (id: string) => {
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`/api/ip-access?id=${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setSuccess("IP rule deleted successfully")
        fetchIpRules() // Refresh the IP rules list
      } else {
        const data = await res.json()
        setError(data.error || "Failed to delete IP rule")
      }
    } catch (error) {
      console.error("Error deleting IP rule:", error)
      setError("An error occurred while deleting the IP rule")
    }
  }

  const getTypeColor = (type: string) => {
    return type === "ALLOWED" ? "text-green-400" : "text-red-400"
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
          IP Access Management
        </h1>
        <p className="text-gray-400">Control which IP addresses can access the signup page</p>
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
            <Check className="w-5 h-5 mr-2" />
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
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Add IP Rule</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-300 mb-1">
                IP Address
              </label>
              <input
                id="ipAddress"
                type="text"
                placeholder="e.g., 192.168.1.1"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <div>
              <label htmlFor="ipType" className="block text-sm font-medium text-gray-300 mb-1">
                Rule Type
              </label>
              <select
                id="ipType"
                value={newIpType}
                onChange={(e) => setNewIpType(e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="ALLOWED">Allow Access</option>
                <option value="BLOCKED">Block Access</option>
              </select>
            </div>

            <div>
              <label htmlFor="ipDescription" className="block text-sm font-medium text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="ipDescription"
                placeholder="Add a note about this IP rule"
                value={newIpDescription}
                onChange={(e) => setNewIpDescription(e.target.value)}
                rows={2}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <button
              onClick={addIpRule}
              disabled={isAdding || !newIpAddress}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                isAdding || !newIpAddress
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25"
              }`}
            >
              {isAdding ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add IP Rule
                </>
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-400">IP Access Rules</h2>
            <button
              onClick={fetchIpRules}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse text-cyan-400">Loading IP rules...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700/50 text-left">
                    <th className="p-3 border-b border-gray-600">IP Address</th>
                    <th className="p-3 border-b border-gray-600">Type</th>
                    <th className="p-3 border-b border-gray-600">Description</th>
                    <th className="p-3 border-b border-gray-600">Added</th>
                    <th className="p-3 border-b border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ipRules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-gray-400">
                        No IP rules found. Add your first rule to control access.
                      </td>
                    </tr>
                  ) : (
                    ipRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="p-3 border-b border-gray-700 text-gray-300">{rule.ipAddress}</td>
                        <td className={`p-3 border-b border-gray-700 ${getTypeColor(rule.type)}`}>{rule.type}</td>
                        <td className="p-3 border-b border-gray-700 text-gray-400">
                          {rule.description || <span className="text-gray-600 italic">No description</span>}
                        </td>
                        <td className="p-3 border-b border-gray-700 text-gray-400">
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 border-b border-gray-700">
                          <button
                            onClick={() => deleteIpRule(rule.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
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
