"use client"

import { signIn } from "next-auth/react"
import { FaGithub } from "react-icons/fa"

export default function GitHubAuthButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="w-full flex items-center justify-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors"
    >
      <FaGithub size={20} />
      Sign in with GitHub
    </button>
  )
}
