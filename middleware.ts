import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req) {
  const token = await getToken({ req })
  const url = req.nextUrl.pathname

  if (!token && url.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ["/dashboard/:path*"] }
