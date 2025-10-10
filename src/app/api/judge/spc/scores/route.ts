import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock scores data for testing
const mockSPCScores = [
  {
    participantId: 'spc-003',
    participantName: 'Budi Santoso',
    judgeId: 'judge1',
    judgeName: 'Dr. Andi Wijaya',
    materi: 85,
    penyampaian: 80,
    bahasa: 88,
    total: 253,
    feedback: 'Presentasi yang sangat baik dengan argumen yang kuat dan penyampaian yang menarik.'
  },
  {
    participantId: 'spc-004',
    participantName: 'Maya Kusuma',
    judgeId: 'judge1',
    judgeName: 'Dr. Andi Wijaya',
    materi: 88,
    penyampaian: 82,
    bahasa: 85,
    total: 255,
    feedback: 'Topik yang sangat relevan dengan analisis yang mendalam dan penyampaian yang baik.'
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For testing, return mock data (filter by current judge if needed)
    console.log('📊 Returning mock SPC scores for testing')

    // Filter scores for current judge (in real implementation)
    const judgeScores = mockSPCScores.filter(score =>
      score.judgeId === 'judge1' // In real implementation: session.user.id
    )

    return NextResponse.json({
      scores: judgeScores,
      message: 'Mock data for testing - scores loaded successfully'
    })

    /*
    // TODO: Uncomment when database is ready
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const scores = await prisma.sPCFinalScore.findMany({
      where: {
        judgeId: session.user.id
      },
      include: {
        submission: {
          include: {
            registration: {
              include: {
                participant: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const transformedScores = scores.map(score => ({
      participantId: score.submissionId,
      participantName: score.submission.registration.participant?.fullName || 'Unknown',
      judgeId: score.judgeId,
      judgeName: score.judgeName,
      materi: score.materi,
      penyampaian: score.penyampaian,
      bahasa: score.bahasa,
      total: score.total,
      feedback: score.feedback
    }))

    return NextResponse.json({
      scores: transformedScores
    })
    */

  } catch (error) {
    console.error('Error fetching SPC scores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}