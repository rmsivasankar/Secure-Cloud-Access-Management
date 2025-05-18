import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role: "USER" },
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error creating user" }, { status: 500 })
  }
}
