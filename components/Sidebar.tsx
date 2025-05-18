"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Shield, AlertTriangle, Home, User, Database, ChevronRight, Globe, Lock, BarChart3 } from "lucide-react"

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-cyan-900/50 shadow-lg p-4 overflow-y-auto">
      <div className="mb-8 p-2">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 bg-red-600 rounded-full opacity-80 animate-pulse"></div>
            <Shield className="w-12 h-12 text-white relative z-10" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-center bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent">
          Security Terminal
        </h2>
      </div>

      <div className="space-y-1">
        {session?.user.role === "ADMIN" && (
          <>
            <Link
              href="/dashboard/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/dashboard/admin")
                  ? "bg-cyan-900/50 text-cyan-400 border-l-4 border-cyan-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <Database className="w-5 h-5" />
              <span>Admin Panel</span>
              {isActive("/dashboard/admin") && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>

            <Link
              href="/dashboard/alerts"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/dashboard/alerts")
                  ? "bg-cyan-900/50 text-cyan-400 border-l-4 border-cyan-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Security Alerts</span>
              {isActive("/dashboard/alerts") && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>

            <Link
              href="/dashboard/ip-management"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/dashboard/ip-management")
                  ? "bg-cyan-900/50 text-cyan-400 border-l-4 border-cyan-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>IP Management</span>
              {isActive("/dashboard/ip-management") && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>

            <Link
              href="/dashboard/security"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/dashboard/security")
                  ? "bg-cyan-900/50 text-cyan-400 border-l-4 border-cyan-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Attack Simulator</span>
              {isActive("/dashboard/security") && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>

            <Link
              href="/dashboard/soc"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/dashboard/soc")
                  ? "bg-cyan-900/50 text-cyan-400 border-l-4 border-cyan-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>SOC Dashboard</span>
              {isActive("/dashboard/soc") && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          </>
        )}

        {session?.user.role === "USER" && (
          <Link
            href="/dashboard/user"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive("/dashboard/user")
                ? "bg-cyan-900/50 text-cyan-400 border-l-4 border-cyan-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <User className="w-5 h-5" />
            <span>User Dashboard</span>
            {isActive("/dashboard/user") && <ChevronRight className="w-4 h-4 ml-auto" />}
          </Link>
        )}

        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/dashboard")
              ? "bg-cyan-900/50 text-cyan-400 border-l-4 border-cyan-400"
              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
          {isActive("/dashboard") && <ChevronRight className="w-4 h-4 ml-auto" />}
        </Link>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-4 bg-gray-800/50 rounded-lg border border-cyan-900/30">
          <div className="text-xs text-gray-400 mb-2">System Status</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Security Level</span>
            <span className="text-xs text-cyan-400">Alpha</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
