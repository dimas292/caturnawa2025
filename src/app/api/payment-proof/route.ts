import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // For now, we'll return a mock file URL
    // In production, you would upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    const mockFileUrl = `https://example.com/payment-proofs/${Date.now()}-${file.name}`

    // Update registration with payment proof
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        paymentProofUrl: mockFileUrl,
        status: "PAYMENT_UPLOADED"
      }
    })

    // Create registration file record
    await prisma.registrationFile.create({
      data: {
        registrationId: registrationId,
        fileName: file.name,
        fileType: "PAYMENT_PROOF",
        fileUrl: mockFileUrl,
        fileSize: file.size,
        mimeType: file.type,
        originalName: file.name
      }
    })

    return NextResponse.json(
      { 
        message: "Bukti pembayaran berhasil diupload",
        fileUrl: mockFileUrl,
        fileName: file.name,
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
