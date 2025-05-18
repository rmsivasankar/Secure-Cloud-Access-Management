"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import Image from "next/image"
import { Shield, AlertTriangle, Database, Eye } from "lucide-react"

// Register the necessary components
ChartJS.register(ArcElement, Tooltip, Legend)

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return // Wait until session loads

    if (!session) {
      router.replace("/auth/login") // Redirect only if not logged in
    } else if (session.user.role === "USER") {
      router.replace("/dashboard/user") // Redirect users to their dashboard
    } else {
      setIsAuthorized(true) // Set authorization only for admins
      // Simulate loading data
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [session, status, router])

  // Sample data for the pie chart with cyberpunk colors
  const inventoryData = {
    labels: ["Assault Rifles", "Pistols", "Shotguns", "Sniper Rifles"],
    datasets: [
      {
        label: "Weapons Inventory",
        data: [300, 150, 100, 50],
        backgroundColor: [
          "rgba(0, 204, 255, 0.7)",
          "rgba(255, 0, 85, 0.7)",
          "rgba(255, 204, 0, 0.7)",
          "rgba(51, 255, 51, 0.7)",
        ],
        borderColor: ["rgba(0, 204, 255, 1)", "rgba(255, 0, 85, 1)", "rgba(255, 204, 0, 1)", "rgba(51, 255, 51, 1)"],
        borderWidth: 1,
      },
    ],
  }

  // Sample weapon data for the inventory
  const weapons = [
    { id: 1, name: "AK-47", image: "/weapons/1.jpeg", status: "In Stock", count: 120 },
    { id: 2, name: "Glock 17", image: "/weapons/2.jpg", status: "In Stock", count: 85 },
    { id: 3, name: "Remington 870", image: "/weapons/1.jpeg", status: "Low Stock", count: 32 },
    { id: 4, name: "M24 Sniper", image: "/weapons/2.jpg", status: "In Stock", count: 45 },
  ]

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
          Weapons Inventory System
        </h1>
        <p className="text-gray-400">Welcome, {session?.user.email}. Security clearance: Administrator</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 h-40 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-900/50 rounded-lg">
                  <Database className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Total Inventory</h3>
              </div>
              <p className="text-3xl font-bold text-cyan-400">600</p>
              <p className="text-sm text-gray-400">+12% from last month</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-900/50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Low Stock</h3>
              </div>
              <p className="text-3xl font-bold text-red-400">32</p>
              <p className="text-sm text-gray-400">Requires attention</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Security Level</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">Alpha</p>
              <p className="text-sm text-gray-400">Maximum clearance</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-900/50 rounded-lg">
                  <Eye className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Active Users</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-400">8</p>
              <p className="text-sm text-gray-400">Currently online</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1 bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Inventory Distribution</h2>
              <div className="h-64">
                <Pie
                  data={inventoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: "#e5e7eb",
                          font: {
                            size: 12,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        titleColor: "#e5e7eb",
                        bodyColor: "#e5e7eb",
                        borderColor: "#0e7490",
                        borderWidth: 1,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">System Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Server Load</span>
                    <span className="text-cyan-400">42%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Network Status</span>
                    <span className="text-green-400">Optimal</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Security Protocol</span>
                    <span className="text-yellow-400">Level 3</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Storage Capacity</span>
                    <span className="text-red-400">78%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Weapons Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weapons.map((weapon) => (
                <div
                  key={weapon.id}
                  className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-cyan-800 transition-all"
                >
                  <div className="relative">
                    <Image
                      src={weapon.image || "/placeholder.svg"}
                      alt={weapon.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                      width={200}
                      height={400}
                    />
                    <div
                      className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${
                        weapon.status === "In Stock"
                          ? "bg-green-900/70 text-green-400"
                          : "bg-yellow-900/70 text-yellow-400"
                      }`}
                    >
                      {weapon.status}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{weapon.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-400">Quantity</p>
                    <p className="text-cyan-400 font-bold">{weapon.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
