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

    // Find DCC registrations for this participant
    const registrations = await prisma.registration.findMany({
      where: {
        participantId: participant.id,
        competition: {
          type: {
            in: ['DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO']
          }
        }
      },
      include: {
        competition: true,
        dccSubmission: true
      }
    })

    const result: any = {
      infografis: null,
      video: null
    }

    registrations.forEach(registration => {
      const submission = registration.dccSubmission

      if (submission) {
        const submissionData = {
          submitted: true,
          submittedAt: submission.createdAt.toISOString(),
          status: submission.status.toLowerCase(),
          feedback: submission.feedback,
          judulKarya: submission.judulKarya,
          deskripsiKarya: submission.deskripsiKarya,
          category: registration.competition.type,
          fileUrl: submission.fileKarya
        }

        if (registration.competition.type === 'DCC_INFOGRAFIS') {
          result.infografis = submissionData
        } else if (registration.competition.type === 'DCC_SHORT_VIDEO') {
          result.video = submissionData
        }
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching DCC submission status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}