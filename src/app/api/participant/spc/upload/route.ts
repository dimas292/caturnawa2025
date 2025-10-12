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
    const catatan = formData.get('catatan') as string
    const fileKarya = formData.get('fileKarya') as File | null
    const suratOrisinalitas = formData.get('suratOrisinalitas') as File | null
    const suratPengalihanHakCipta = formData.get('suratPengalihanHakCipta') as File | null

    // Validate required fields
    if (!judulKarya) {
      return NextResponse.json(
        { error: 'Judul karya is required' },
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

    // Find registration for SPC
    const registration = await prisma.registration.findFirst({
      where: {
        participantId: participant.id,
        competition: {
          type: 'SPC'
        }
      },
      include: {
        competition: true,
        spcSubmission: true
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'You are not registered for SPC' },
        { status: 400 }
      )
    }

    // Prepare file URLs
    let fileKaryaUrl = registration.spcSubmission?.fileKarya
    let suratOrisinalitasUrl = registration.spcSubmission?.suratOrisinalitas
    let suratPengalihanHakCiptaUrl = registration.spcSubmission?.suratPengalihanHakCipta

    // Upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'spc')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Validate and save fileKarya if provided
    if (fileKarya) {
      if (fileKarya.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'File karya must be PDF' },
          { status: 400 }
        )
      }
      if (fileKarya.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File karya size exceeds 10MB limit' },
          { status: 400 }
        )
      }

      const fileName = `spc-karya-${registration.id}-${Date.now()}.pdf`
      const filePath = join(uploadDir, fileName)
      const buffer = await fileKarya.arrayBuffer()
      await writeFile(filePath, Buffer.from(buffer))
      fileKaryaUrl = `/uploads/spc/${fileName}` // Accessible via public folder
    }

    // Validate and save suratOrisinalitas if provided
    if (suratOrisinalitas) {
      if (suratOrisinalitas.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Surat orisinalitas must be PDF' },
          { status: 400 }
        )
      }
      if (suratOrisinalitas.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Surat orisinalitas size exceeds 10MB limit' },
          { status: 400 }
        )
      }

      const fileName = `spc-orisinalitas-${registration.id}-${Date.now()}.pdf`
      const filePath = join(uploadDir, fileName)
      const buffer = await suratOrisinalitas.arrayBuffer()
      await writeFile(filePath, Buffer.from(buffer))
      suratOrisinalitasUrl = `/uploads/spc/${fileName}` // Accessible via public folder
    }

    // Validate and save suratPengalihanHakCipta if provided
    if (suratPengalihanHakCipta) {
      if (suratPengalihanHakCipta.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Surat pengalihan hak cipta must be PDF' },
          { status: 400 }
        )
      }
      if (suratPengalihanHakCipta.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Surat pengalihan hak cipta size exceeds 10MB limit' },
          { status: 400 }
        )
      }

      const fileName = `spc-hakcipta-${registration.id}-${Date.now()}.pdf`
      const filePath = join(uploadDir, fileName)
      const buffer = await suratPengalihanHakCipta.arrayBuffer()
      await writeFile(filePath, Buffer.from(buffer))
      suratPengalihanHakCiptaUrl = `/uploads/spc/${fileName}` // Accessible via public folder
    }

    // Check if this is an update or new submission
    if (registration.spcSubmission) {
      // Update existing submission
      const updatedSubmission = await prisma.sPCSubmission.update({
        where: { id: registration.spcSubmission.id },
        data: {
          judulKarya,
          catatan: catatan || null,
          fileKarya: fileKaryaUrl,
          suratOrisinalitas: suratOrisinalitasUrl,
          suratPengalihanHakCipta: suratPengalihanHakCiptaUrl,
          status: 'PENDING'
        }
      })

      return NextResponse.json({
        message: 'SPC submission updated successfully',
        submissionId: updatedSubmission.id
      })
    } else {
      // Validate all files are provided for new submission
      if (!fileKaryaUrl || !suratOrisinalitasUrl || !suratPengalihanHakCiptaUrl) {
        return NextResponse.json(
          { error: 'All files are required for new submission' },
          { status: 400 }
        )
      }

      // Create new submission
      const spcSubmission = await prisma.sPCSubmission.create({
        data: {
          registrationId: registration.id,
          judulKarya,
          catatan: catatan || null,
          fileKarya: fileKaryaUrl,
          suratOrisinalitas: suratOrisinalitasUrl,
          suratPengalihanHakCipta: suratPengalihanHakCiptaUrl,
          status: 'PENDING'
        }
      })

      return NextResponse.json({
        message: 'SPC submission created successfully',
        submissionId: spcSubmission.id
      })
    }

  } catch (error) {
    console.error('Error creating SPC submission:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
