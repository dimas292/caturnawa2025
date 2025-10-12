import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'participant') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Find participant
    const participant = await prisma.participant.findUnique({
      where: { userId: session.user.id }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    // Find SPC registration for this participant
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
        { status: 404 }
      )
    }

    const submission = registration.spcSubmission

    if (!submission) {
      // No submission yet
      return NextResponse.json({
        submitted: false
      })
    }

    // Return submission data
    return NextResponse.json({
      submitted: true,
      submittedAt: submission.createdAt.toISOString(),
      status: submission.status.toLowerCase(),
      feedback: submission.feedback,
      judulKarya: submission.judulKarya,
      catatan: submission.catatan,
      fileKarya: submission.fileKarya,
      suratOrisinalitas: submission.suratOrisinalitas,
      suratPengalihanHakCipta: submission.suratPengalihanHakCipta,
      qualifiedToFinal: submission.qualifiedToFinal,
      presentationOrder: submission.presentationOrder,
      scheduledTime: submission.scheduledTime
    })

  } catch (error) {
    console.error('Error fetching SPC submission status:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
