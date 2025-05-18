import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: ["static.wikia.nocookie.net"], // Add your external image domains here
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
