"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts"

export default function SecurityAlerts() {
  const [securityLogs, setSecurityLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/security-logs")
        const data = await res.json()

        if (data.success) {
          setSecurityLogs(data.logs || [])
        } else {
          setError("Failed to fetch security logs")
        }
      } catch (error) {
        console.error("Error fetching security logs:", error)
        setError("Error connecting to server")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  // Default attack types if none are found
  const attackCounts = {
    "SQL Injection": 0,
    XSS: 0,
    "Brute Force": 0,
    Other: 0,
  }

  // Count attack types safely
  securityLogs.forEach((log) => {
    const type = log.type || "Other" // Use 'type' field instead of 'attackType'
    if (attackCounts[type] !== undefined) {
      attackCounts[type]++
    } else {
      attackCounts["Other"]++
    }
  })

  const chartData = Object.entries(attackCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // Cyberpunk/Tech theme colors
  const COLORS = ["#ff0055", "#00ccff", "#33ff33", "#ffcc00"]

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400 border-b border-cyan-800 pb-2">
        Security Monitoring System
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-cyan-400">Loading security data...</div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-md text-red-400">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Threat Analysis</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        borderColor: "#0e7490",
                        color: "#e5e7eb",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Security Status</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>System Integrity</span>
                  <div className="w-1/2 bg-gray-700 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <span className="text-cyan-400">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Firewall Status</span>
                  <div className="w-1/2 bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Threat Level</span>
                  <div className="w-1/2 bg-gray-700 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                  <span className="text-yellow-400">Medium</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Security Incident Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700/50 text-left">
                    <th className="p-3 border-b border-gray-600">Type</th>
                    <th className="p-3 border-b border-gray-600">Message</th>
                    <th className="p-3 border-b border-gray-600">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-4 text-gray-400">
                        No security incidents detected.
                      </td>
                    </tr>
                  ) : (
                    securityLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                        <td
                          className={`p-3 border-b border-gray-700 ${log.type === "SQL Injection" ? "text-red-400" : log.type === "XSS" ? "text-orange-400" : "text-gray-300"}`}
                        >
                          {log.type || "Unknown"}
                        </td>
                        <td className="p-3 border-b border-gray-700 text-gray-300">
                          {log.message || "No details available"}
                        </td>
                        <td className="p-3 border-b border-gray-700 text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
