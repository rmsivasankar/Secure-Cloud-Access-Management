"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Shield, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-900 border-b border-cyan-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 relative mr-2">
                <div className="absolute inset-0 bg-red-600 rounded-full opacity-80 animate-pulse"></div>
                <Shield className="w-10 h-10 text-white relative z-10" />
              </div>
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent"
              >
                Secure Cloud Access Management System
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <div className="text-sm text-cyan-400 px-3 py-1 rounded-full border border-cyan-800 bg-gray-800/50">
                  {session.user?.email}
                </div>
                <Link href="/dashboard" className="px-4 py-2 text-gray-300 hover:text-cyan-400 transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800 text-white rounded-md border border-red-800/50 transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 bg-cyan-900/50 hover:bg-cyan-800 text-white rounded-md border border-cyan-800/50 transition-all hover:shadow-[0_0_15px_rgba(8,145,178,0.5)]"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {session ? (
              <>
                <div className="text-sm text-cyan-400 px-3 py-2 block">{session.user?.email}</div>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-300 hover:text-cyan-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-cyan-400 hover:text-cyan-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
