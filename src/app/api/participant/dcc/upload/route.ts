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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'participant') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const judulKarya = formData.get('judulKarya') as string
    const deskripsiKarya = formData.get('deskripsiKarya') as string
    const category = formData.get('category') as 'DCC_INFOGRAFIS' | 'DCC_SHORT_VIDEO'
    const fileKarya = formData.get('fileKarya') as File
    const videoLink = formData.get('videoLink') as string

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
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    // Find registration for the specific competition category
    const registration = await prisma.registration.findFirst({
      where: {
        participantId: participant.id,
        competition: {
          type: category
        }
      },
      include: {
        competition: true,
        dccSubmission: true
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: `You are not registered for ${category}` },
        { status: 400 }
      )
    }

    // Check if already submitted
    if (registration.dccSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted for this category' },
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
        return NextResponse.json(
          { error: `File size exceeds ${maxSizeMB}MB limit` },
          { status: 400 }
        )
      }

      if (!constraints.allowedTypes.includes(fileKarya.type)) {
        return NextResponse.json(
          { error: `Invalid file type. Allowed: ${constraints.allowedExtensions.join(', ')}` },
          { status: 400 }
        )
      }

      // Save file
      const fileExtension = getFileExtension(fileKarya.name)
      const fileName = `dcc-${category.toLowerCase()}-${registration.id}-${Date.now()}${fileExtension}`
      const uploadDir = join(process.cwd(), 'uploads', 'dcc')

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
    const dccSubmission = await prisma.dCCSubmission.create({
      data: {
        registrationId: registration.id,
        judulKarya,
        deskripsiKarya,
        fileKarya: fileKaryaPath,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'DCC submission created successfully',
      submissionId: dccSubmission.id
    })

  } catch (error) {
    console.error('Error creating DCC submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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