"use client"

import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/Navbar"
import { useEffect } from "react"
import type React from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  return (
    <SessionProvider>
      <html lang="en" className="dark">
        <head>
          <title>Umbrella Corporation</title>
          <meta name="description" content="Umbrella Corporation Security System" />
        </head>
        <body className="bg-gray-900 text-gray-100 min-h-screen">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </SessionProvider>
  )
}
