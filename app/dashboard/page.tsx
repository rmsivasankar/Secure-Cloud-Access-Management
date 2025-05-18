"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Wait for session to load

    if (!session) {
      router.push("/auth/login") // Redirect to login if not authenticated
    } else if (session.user.role === "ADMIN") {
      router.push("/dashboard/admin") // Redirect Admins
    } else {
      router.push("/dashboard/user") // Redirect Users
    }
  }, [session, status, router])

  return <div className="text-center">Redirecting...</div>
}
