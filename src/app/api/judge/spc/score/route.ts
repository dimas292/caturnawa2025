import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const {
      participantId,
      materi,
      penyampaian,
      bahasa,
      feedback
    } = body

    // Validate required fields
    if (!participantId || !materi || !penyampaian || !bahasa) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total
    const total = materi + penyampaian + bahasa

    // Upsert the score (update if exists, create if not)
    const score = await prisma.sPCFinalScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId: participantId,
          judgeId: session.user.id
        }
      },
      update: {
        materi,
        penyampaian,
        bahasa,
        total,
        feedback: feedback || null,
        judgeName: session.user.name || 'Unknown Judge'
      },
      create: {
        submissionId: participantId,
        judgeId: session.user.id,
        judgeName: session.user.name || 'Unknown Judge',
        materi,
        penyampaian,
        bahasa,
        total,
        feedback: feedback || null
      }
    })

    return NextResponse.json({
      success: true,
      score
    })
  } catch (error) {
    console.error('Error saving SPC final score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}