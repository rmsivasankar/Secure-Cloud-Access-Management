import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

const MAX_ATTEMPTS = 3 // Maximum allowed failed attempts
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes lockout

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        // Detect SQL Injection patterns
        const sqlInjectionPattern = /(\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|\*|')\b)/gi
        if (sqlInjectionPattern.test(credentials.email) || sqlInjectionPattern.test(credentials.password)) {
          await prisma.securityLog.create({
            data: {
              type: "SQL Injection",
              message: `SQLi attempt detected for email: ${credentials.email}`,
              timestamp: new Date(),
            },
          })

          // Log to security attacks table
          await prisma.securityAttack.create({
            data: {
              type: "SQL_INJECTION",
              payload: credentials.email,
              status: "BLOCKED",
              description: "SQL injection attempt in login credentials",
            },
          })

          throw new Error("Suspicious activity detected.")
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })

        if (!user) {
          throw new Error("User not found")
        }

        // Check for failed login attempts
        const lastFailedAttempt = await prisma.loginAttempt.findFirst({
          where: { email: credentials.email },
          orderBy: { timestamp: "desc" },
        })

        if (lastFailedAttempt && lastFailedAttempt.attempts >= MAX_ATTEMPTS) {
          const timeSinceLastAttempt = new Date().getTime() - new Date(lastFailedAttempt.timestamp).getTime()
          if (timeSinceLastAttempt < LOCKOUT_TIME) {
            throw new Error("Account locked. Try again later.")
          } else {
            // Reset attempts if lockout period is over
            await prisma.loginAttempt.deleteMany({ where: { email: credentials.email } })
          }
        }

        // Validate password
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          await prisma.loginAttempt.upsert({
            where: { email: credentials.email },
            update: { attempts: { increment: 1 }, timestamp: new Date() },
            create: { email: credentials.email, attempts: 1, timestamp: new Date() },
          })

          // Log failed login attempt
          await prisma.securityAttack.create({
            data: {
              type: "BRUTE_FORCE",
              payload: credentials.email,
              status: "DETECTED",
              description: "Failed login attempt with incorrect password",
            },
          })

          throw new Error("Invalid credentials.")
        }

        // Reset failed attempts on successful login
        await prisma.loginAttempt.deleteMany({ where: { email: credentials.email } })

        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role // Store role in JWT
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role // Attach role to session
      }
      return session
    },
    async redirect({ baseUrl }) {
      return baseUrl // Prevent unwanted redirects
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Create the NextAuth handler
const handler = NextAuth(authOptions)

// Export the handler for GET and POST requests
export { handler as GET, handler as POST }
