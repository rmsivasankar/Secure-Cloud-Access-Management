import Image from "next/image"
import Link from "next/link"
import { Shield, ChevronRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-800/50 text-cyan-400 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Secure Access Portal
              </div>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent">
                Umbrella Corporation
              </span>
              <br />
              <span className="text-white">Advanced Security Systems</span>
            </h1>

            <p className="text-xl text-gray-300">
              Your gateway to advanced bioweaponry and secure operations. Login or sign up to access classified
              information and resources.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-medium rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Login
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg border border-gray-700 transition-colors"
              >
                Request Access
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-cyan-400">28+</div>
                <div className="text-sm text-gray-400">Global Facilities</div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-cyan-400">5000+</div>
                <div className="text-sm text-gray-400">Employees</div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-cyan-400">99.9%</div>
                <div className="text-sm text-gray-400">Security Rating</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-cyan-500 rounded-lg blur opacity-30"></div>
            <div className="relative bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex justify-center mb-6">
                <Image
                  src="/wallpaper/Umbrella.webp"
                  alt="Umbrella Corporation"
                  className="w-full h-auto object-contain rounded-lg"
                  width={500}
                  height={300}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <Shield className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="font-medium text-white">Advanced Security</h3>
                    <p className="text-sm text-gray-400">Multi-layered protection systems</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">B</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Bioweapon Research</h3>
                    <p className="text-sm text-gray-400">Cutting-edge development facilities</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center">
                    <span className="text-green-400 font-bold">G</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Global Operations</h3>
                    <p className="text-sm text-gray-400">Worldwide secure facilities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
