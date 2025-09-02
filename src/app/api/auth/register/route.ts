// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(1, "Nama harus diisi"),
  fullName: z.string().min(1, "Nama lengkap harus diisi"),
  gender: z.enum(["MALE", "FEMALE"], { message: "Jenis kelamin harus dipilih" }),
  whatsappNumber: z.string().min(1, "Nomor WhatsApp harus diisi"),
  institution: z.string().min(1, "Institusi harus diisi"),
  faculty: z.string().optional().nullable(),
  studyProgram: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
  teamName: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Data tidak valid", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, password, name, fullName, gender, whatsappNumber, institution, faculty, studyProgram, studentId, teamName } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with participant profile
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "participant",
        participant: {
          create: {
            email,
            fullName,
            gender: gender as "MALE" | "FEMALE",
            whatsappNumber,
            institution,
            faculty,
            studyProgram,
            studentId,
          }
        }
      },
      include: {
        participant: true
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: "Registrasi berhasil",
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}