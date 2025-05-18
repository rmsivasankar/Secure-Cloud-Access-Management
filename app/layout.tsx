import "@/styles/globals.css"
import type React from "react"
import ClientLayout from "./ClientLayout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
