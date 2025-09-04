import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, secretKey } = body

    // Security: Require secret key to create admin
    if (secretKey !== process.env.ADMIN_CREATE_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid secret key." },
        { status: 401 }
      )
    }

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin"
      }
    })

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = adminUser

    return NextResponse.json({
      message: "Admin created successfully",
      admin: adminWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}