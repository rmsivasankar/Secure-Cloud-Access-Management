"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, AlertTriangle, RefreshCw, Bell, CheckCircle, Clock, Activity } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts"

type SecurityMetrics = {
  attackCounts: Array<{ type: string; _count: { type: number } }>
  alertCounts: Array<{ severity: string; _count: { severity: number } }>
  metrics: Array<{
    id: string
    name: string
    value: number
    unit?: string
    category?: string
    timestamp: string
  }>
  totals: {
    attacks: number
    alerts: number
    logs: number
  }
  recentActivity: Array<{
    id: string
    type: string
    message: string
    timestamp: string
  }>
}

type SecurityAlert = {
  id: string
  severity: string
  title: string
  description: string
  status: string
  timestamp: string
  resolvedAt?: string
  resolvedBy?: string
}

export default function SOCDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (status === "loading") return // Wait until session loads

    if (!session) {
      router.replace("/auth/login") // Redirect if not logged in
    } else if (session.user.role !== "ADMIN") {
      router.replace("/dashboard/user") // Redirect non-admins
    } else {
      setIsAuthorized(true) // Set authorization for admins
      fetchData() // Fetch dashboard data
    }
  }, [session, status, router])

  const fetchData = async () => {
    setIsLoading(true)
    setRefreshing(true)
    try {
      // Fetch metrics
      const metricsRes = await fetch("/api/security/metrics")
      const metricsData = await metricsRes.json()

      if (metricsData.success) {
        setMetrics(metricsData.metrics)
      } else {
        setError("Failed to fetch security metrics")
      }

      // Fetch alerts
      const alertsRes = await fetch("/api/security/alerts")
      const alertsData = await alertsRes.json()

      if (alertsData.success) {
        setAlerts(alertsData.alerts || [])
      } else {
        setError("Failed to fetch security alerts")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Error connecting to server")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const updateAlertStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/security/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })

      if (res.ok) {
        fetchData() // Refresh data
      } else {
        const data = await res.json()
        setError(data.error || "Failed to update alert status")
      }
    } catch (error) {
      console.error("Error updating alert status:", error)
      setError("An error occurred while updating the alert")
    }
  }

  // Format attack data for pie chart
  const formatAttackData = () => {
    if (!metrics || !metrics.attackCounts) return []

    return metrics.attackCounts.map((item) => ({
      name: item.type,
      value: item._count.type,
    }))
  }

  // Format alert data for pie chart
  const formatAlertData = () => {
    if (!metrics || !metrics.alertCounts) return []

    return metrics.alertCounts.map((item) => ({
      name: item.severity,
      value: item._count.severity,
    }))
  }

  // Format metrics data for line chart
  const formatMetricsData = () => {
    if (!metrics || !metrics.metrics) return []

    return metrics.metrics.map((item) => ({
      name: item.name,
      value: item.value,
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
    }))
  }

  // Colors for charts
  const ATTACK_COLORS = ["#ff0055", "#00ccff", "#33ff33", "#ffcc00"]
  const ALERT_COLORS = ["#ff0055", "#ffcc00", "#33ff33"]

  // Get color for alert severity
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "text-red-400"
      case "MEDIUM":
        return "text-yellow-400"
      case "LOW":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  // Get color for alert status
  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "text-cyan-400"
      case "ACKNOWLEDGED":
        return "text-yellow-400"
      case "RESOLVED":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  // Get icon for alert status
  const getAlertStatusIcon = (status: string) => {
    switch (status) {
      case "NEW":
        return <Bell className="w-4 h-4" />
      case "ACKNOWLEDGED":
        return <Clock className="w-4 h-4" />
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent">
            Security Operations Center
          </h1>
          <p className="text-gray-400">Real-time security monitoring and incident response</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
            refreshing ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gray-800 text-cyan-400 hover:bg-gray-700"
          }`}
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 h-40 rounded-lg"></div>
          ))}
          <div className="md:col-span-2 bg-gray-800/50 h-80 rounded-lg"></div>
          <div className="md:col-span-2 bg-gray-800/50 h-80 rounded-lg"></div>
          <div className="md:col-span-4 bg-gray-800/50 h-96 rounded-lg"></div>
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-900/50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Security Attacks</h3>
              </div>
              <p className="text-3xl font-bold text-red-400">{metrics?.totals.attacks || 0}</p>
              <p className="text-sm text-gray-400">Total detected attacks</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-900/50 rounded-lg">
                  <Bell className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Security Alerts</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{metrics?.totals.alerts || 0}</p>
              <p className="text-sm text-gray-400">Active security alerts</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-900/50 rounded-lg">
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">System Status</h3>
              </div>
              <p className="text-3xl font-bold text-cyan-400">Active</p>
              <p className="text-sm text-gray-400">All systems operational</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Security Logs</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">{metrics?.totals.logs || 0}</p>
              <p className="text-sm text-gray-400">Total security events</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Attack Types Chart */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Attack Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatAttackData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {formatAttackData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ATTACK_COLORS[index % ATTACK_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        borderColor: "#0e7490",
                        color: "#e5e7eb",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alert Severity Chart */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Alert Severity</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatAlertData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        borderColor: "#0e7490",
                        color: "#e5e7eb",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#ff0055">
                      {formatAlertData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ALERT_COLORS[index % ALERT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Security Metrics Chart */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm mb-6">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Security Metrics Timeline</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatMetricsData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="timestamp" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#0e7490",
                      color: "#e5e7eb",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#00ccff" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Security Alerts Table */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Security Alerts</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700/50 text-left">
                    <th className="p-3 border-b border-gray-600">Severity</th>
                    <th className="p-3 border-b border-gray-600">Title</th>
                    <th className="p-3 border-b border-gray-600">Description</th>
                    <th className="p-3 border-b border-gray-600">Status</th>
                    <th className="p-3 border-b border-gray-600">Time</th>
                    <th className="p-3 border-b border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4 text-gray-400">
                        No security alerts found.
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className={`p-3 border-b border-gray-700 ${getAlertSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </td>
                        <td className="p-3 border-b border-gray-700 text-gray-300 font-medium">{alert.title}</td>
                        <td className="p-3 border-b border-gray-700 text-gray-400">
                          <div className="max-w-xs truncate">{alert.description}</div>
                        </td>
                        <td className={`p-3 border-b border-gray-700 ${getAlertStatusColor(alert.status)}`}>
                          <div className="flex items-center gap-1">
                            {getAlertStatusIcon(alert.status)}
                            <span>{alert.status}</span>
                          </div>
                        </td>
                        <td className="p-3 border-b border-gray-700 text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 border-b border-gray-700">
                          <div className="flex gap-2">
                            {alert.status === "NEW" && (
                              <button
                                onClick={() => updateAlertStatus(alert.id, "ACKNOWLEDGED")}
                                className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30 rounded-md transition-colors"
                                title="Acknowledge"
                              >
                                <Clock className="w-5 h-5" />
                              </button>
                            )}
                            {(alert.status === "NEW" || alert.status === "ACKNOWLEDGED") && (
                              <button
                                onClick={() => updateAlertStatus(alert.id, "RESOLVED")}
                                className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded-md transition-colors"
                                title="Resolve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
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
