import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const registrationId = formData.get('registrationId') as string

    if (!file || !registrationId) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max for payment proof)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File terlalu besar. Maksimal 5MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan: JPG, PNG, PDF" },
        { status: 400 }
      )
    }

    // Check if registration exists and belongs to user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { participant: true }
    })

    if (!user?.participant) {
      return NextResponse.json(
        { error: "Profil participant tidak ditemukan" },
        { status: 404 }
      )
    }

    const registration = await prisma.registration.findFirst({
      where: {
        id: registrationId,
        participantId: user.participant.id
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename for payment proof
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `payment-${timestamp}-${registrationId}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    
    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Create file URL - use API endpoint for better production compatibility
    const fileUrl = `/api/files/${fileName}`

    // Check if payment proof already exists
    const existingPaymentFile = await prisma.registrationFile.findFirst({
      where: {
        registrationId: registrationId,
        fileType: "PAYMENT_PROOF"
      }
    })

    if (existingPaymentFile) {
      // Delete the old payment proof file from filesystem
      const oldFilePath = join(process.cwd(), 'public', existingPaymentFile.fileUrl.replace('/', ''))
      if (existsSync(oldFilePath)) {
        try {
          await require('fs/promises').unlink(oldFilePath)
        } catch (error) {
          console.log('Could not delete old payment file:', error)
        }
      }

      // Update existing record
      await prisma.registrationFile.update({
        where: { id: existingPaymentFile.id },
        data: {
          fileName: fileName,
          originalName: file.name,
          fileUrl: fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date()
        }
      })
    } else {
      // Create new registration file record
      await prisma.registrationFile.create({
        data: {
          registrationId: registrationId,
          fileName: fileName,
          fileType: "PAYMENT_PROOF",
          fileUrl: fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          originalName: file.name
        }
      })
    }

    // Update registration with payment proof (always update)
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        paymentProofUrl: fileUrl,
        status: "PAYMENT_UPLOADED"
      }
    })

    return NextResponse.json(
      { 
        message: "Bukti pembayaran berhasil diupload",
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: file.size,
        mimeType: file.type
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Payment proof upload error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload bukti pembayaran" },
      { status: 500 }
    )
  }
}
