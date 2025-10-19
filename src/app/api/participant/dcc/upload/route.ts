import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.error('DCC Upload: No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'participant') {
      console.error('DCC Upload: User is not a participant')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const judulKarya = formData.get('judulKarya') as string
    const deskripsiKarya = formData.get('deskripsiKarya') as string
    const category = formData.get('category') as 'DCC_INFOGRAFIS' | 'DCC_SHORT_VIDEO'
    const fileKarya = formData.get('fileKarya') as File
    const videoLink = formData.get('videoLink') as string

    console.log('DCC Upload Request:', {
      category,
      judulKarya,
      deskripsiKarya,
      hasFile: !!fileKarya,
      fileName: fileKarya?.name,
      fileSize: fileKarya?.size,
      fileType: fileKarya?.type,
      hasVideoLink: !!videoLink,
      userId: session.user.id
    })

    // Validate required fields based on category
    if (!judulKarya || !deskripsiKarya || !category) {
      return NextResponse.json(
        { error: 'Judul, deskripsi, dan kategori harus diisi' },
        { status: 400 }
      )
    }

    // For DCC_SHORT_VIDEO, require videoLink instead of file
    if (category === 'DCC_SHORT_VIDEO') {
      if (!videoLink) {
        return NextResponse.json(
          { error: 'Link Google Drive video harus diisi' },
          { status: 400 }
        )
      }
      if (!videoLink.includes('drive.google.com')) {
        return NextResponse.json(
          { error: 'Link harus dari Google Drive' },
          { status: 400 }
        )
      }
    } else {
      // For DCC_INFOGRAFIS, require file
      if (!fileKarya) {
        return NextResponse.json(
          { error: 'File infografis harus diupload' },
          { status: 400 }
        )
      }
    }

    // Validate category
    if (!['DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Find participant
    const participant = await prisma.participant.findUnique({
      where: { userId: session.user.id }
    })

    if (!participant) {
      console.error('DCC Upload: Participant not found for userId:', session.user.id)
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    console.log('DCC Upload: Participant found:', participant.id)

    // Find registration for the specific competition category
    const registration = await prisma.registration.findFirst({
      where: {
        participantId: participant.id,
        competition: {
          type: category
        },
        status: 'VERIFIED' // Only allow upload if registration is verified
      },
      include: {
        competition: true,
        dccSubmission: true
      }
    })

    console.log('DCC Upload: Registration search result:', {
      found: !!registration,
      category,
      participantId: participant.id
    })

    if (!registration) {
      // Check if registration exists but not verified
      const unverifiedReg = await prisma.registration.findFirst({
        where: {
          participantId: participant.id,
          competition: {
            type: category
          }
        },
        include: {
          competition: true
        }
      })

      if (unverifiedReg) {
        console.error('DCC Upload: Registration found but not verified:', unverifiedReg.status)
        return NextResponse.json(
          { error: `Pendaftaran Anda belum diverifikasi. Status: ${unverifiedReg.status}` },
          { status: 400 }
        )
      }

      console.error('DCC Upload: No registration found for category:', category)
      return NextResponse.json(
        { error: `Anda belum terdaftar untuk ${category}` },
        { status: 400 }
      )
    }

    // Check if already submitted
    if (registration.dccSubmission) {
      console.error('DCC Upload: Already submitted for category:', category)
      return NextResponse.json(
        { error: 'Anda sudah submit karya untuk kategori ini' },
        { status: 400 }
      )
    }

    let fileKaryaPath = ''

    // Handle file upload for DCC_INFOGRAFIS or link for DCC_SHORT_VIDEO
    if (category === 'DCC_INFOGRAFIS') {
      // Validate file constraints
      const constraints = getFileConstraints(category)

      if (fileKarya.size > constraints.maxSize) {
        const maxSizeMB = constraints.maxSize / (1024 * 1024)
        console.error('DCC Upload: File too large:', fileKarya.size, 'Max:', constraints.maxSize)
        return NextResponse.json(
          { error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB` },
          { status: 400 }
        )
      }

      if (!constraints.allowedTypes.includes(fileKarya.type)) {
        console.error('DCC Upload: Invalid file type:', fileKarya.type, 'Allowed:', constraints.allowedTypes)
        return NextResponse.json(
          { error: `Format file tidak valid. Yang diperbolehkan: ${constraints.allowedExtensions.join(', ')}` },
          { status: 400 }
        )
      }

      // Save file to public directory so it's accessible
      const fileExtension = getFileExtension(fileKarya.name)
      const fileName = `dcc-${category.toLowerCase()}-${registration.id}-${Date.now()}${fileExtension}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'dcc')

      // Ensure upload directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      const filePath = join(uploadDir, fileName)
      const buffer = await fileKarya.arrayBuffer()
      await writeFile(filePath, Buffer.from(buffer))

      fileKaryaPath = `/uploads/dcc/${fileName}`
    } else {
      // For DCC_SHORT_VIDEO, use the Google Drive link
      fileKaryaPath = videoLink
    }

    // Create DCC submission in database
    console.log('DCC Upload: Creating submission with data:', {
      registrationId: registration.id,
      judulKarya,
      deskripsiKarya: deskripsiKarya?.substring(0, 50),
      fileKaryaPath
    })

    const dccSubmission = await prisma.dCCSubmission.create({
      data: {
        registrationId: registration.id,
        judulKarya,
        deskripsiKarya,
        fileKarya: fileKaryaPath,
        status: 'PENDING'
      }
    })

    console.log('DCC Upload: Submission created successfully:', dccSubmission.id)

    return NextResponse.json({
      message: 'Karya DCC berhasil disubmit',
      submissionId: dccSubmission.id
    })

  } catch (error) {
    console.error('Error creating DCC submission:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function getFileConstraints(category: string) {
  if (category === 'DCC_INFOGRAFIS') {
    return {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
      allowedExtensions: ['.png', '.jpg', '.jpeg', '.pdf']
    }
  } else {
    return {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
      allowedExtensions: ['.mp4', '.mov', '.avi']
    }
  }
}

function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.'))
}