declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string
      email?: string
      image?: string
      role?: string
    }
  }

  interface User {
    id: string
    email: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}
