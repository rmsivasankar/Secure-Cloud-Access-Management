"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Shield, Users, FileText, Globe } from "lucide-react"

// Sample top executives data
const executives = [
  { id: 1, name: "Albert Wesker", title: "CEO", image: "/avatar/1.jpg" },
  { id: 2, name: "William Birkin", title: "Lead Scientist", image: "/avatar/2.png" },
  { id: 3, name: "James Marcus", title: "Founder", image: "/avatar/3.png" },
  { id: 4, name: "Osmund Saddler", title: "Executive Officer", image: "/avatar/4.jpg" },
]

// Sample news data
const news = [
  {
    id: 1,
    title: "New Research Breakthrough",
    date: "2023-06-15",
    excerpt: "Umbrella scientists have made a significant breakthrough in viral research...",
  },
  {
    id: 2,
    title: "Quarterly Financial Report",
    date: "2023-05-30",
    excerpt: "The company has reported a 15% increase in revenue for the last quarter...",
  },
  {
    id: 3,
    title: "New Facility Opening",
    date: "2023-05-12",
    excerpt: "Umbrella Corporation is proud to announce the opening of a new research facility...",
  },
]

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return // Wait until session loads

    if (!session) {
      router.replace("/auth/login") // Redirect only if not logged in
    } else if (session.user.role === "ADMIN") {
      router.replace("/dashboard/admin") // Redirect admins to their dashboard
    } else {
      setIsAuthorized(true) // Set authorization only for users
      // Simulate loading data
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [session, status, router])

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
          Employee Portal
        </h1>
        <p className="text-gray-400">Welcome, {session?.user.email}. Access level: Standard</p>
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
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Security Status</h3>
              </div>
              <p className="text-3xl font-bold text-cyan-400">Active</p>
              <p className="text-sm text-gray-400">All systems operational</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Active Employees</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">1,248</p>
              <p className="text-sm text-gray-400">Worldwide</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-900/50 rounded-lg">
                  <FileText className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Research Projects</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-400">42</p>
              <p className="text-sm text-gray-400">In progress</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Global Facilities</h3>
              </div>
              <p className="text-3xl font-bold text-purple-400">28</p>
              <p className="text-sm text-gray-400">Across 14 countries</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">About Umbrella Corporation</h2>
              <div className="prose text-gray-300 max-w-none">
                <p className="mb-4">
                  The Umbrella Corporation is a leading multinational conglomerate with core businesses in
                  pharmaceutical products and bioengineering. Founded in 1968, Umbrella has been at the forefront of
                  medical technology and research for over five decades.
                </p>
                <p className="mb-4">
                  Our mission is to create a healthier world through groundbreaking research and innovative products.
                  With facilities across the globe, we're committed to advancing human potential and addressing the
                  world's most pressing health challenges.
                </p>
                <div className="flex justify-center my-4">
                  <div className="relative w-full max-w-2xl h-48 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-cyan-900/50"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-24 h-24 text-red-500 opacity-80" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-black/50 p-4">
                      <p className="text-center text-white font-bold">Safeguarding Humanity's Future</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Company News</h2>
              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="border-b border-gray-700 pb-3 last:border-0">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-xs text-gray-400 mb-1">{new Date(item.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-300">{item.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Executive Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {executives.map((executive) => (
                <div
                  key={executive.id}
                  className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-cyan-800 transition-all"
                >
                  <Image
                    src={executive.image || "/placeholder.svg"}
                    alt={executive.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                    width={200}
                    height={400}
                  />
                  <h3 className="text-lg font-semibold text-white">{executive.name}</h3>
                  <p className="text-cyan-400">{executive.title}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
