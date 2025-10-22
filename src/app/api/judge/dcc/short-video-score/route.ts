import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Updated to use simplified scoring: konsepKreatif, produksiVideo, penyampaianPesan (max 300)

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
      submissionId,
      sinematografi,
      visualBentuk,
      visualEditing,
      isiPesan,
      feedback
    } = body

    // Validate required fields
    if (!submissionId || sinematografi === undefined || visualBentuk === undefined || visualEditing === undefined || isiPesan === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate score ranges (1-100)
    const scores = [sinematografi, visualBentuk, visualEditing, isiPesan]
    for (const score of scores) {
      if (score < 1 || score > 100) {
        return NextResponse.json(
          { error: 'All scores must be between 1 and 100' },
          { status: 400 }
        )
      }
    }

    const total = sinematografi + visualBentuk + visualEditing + isiPesan

    // Check if submission already has 3 judges (and current judge is not one of them)
    const existingScores = await prisma.dCCShortVideoScore.findMany({
      where: { submissionId }
    })

    const currentJudgeHasScored = existingScores.some(s => s.judgeId === session.user.id)
    
    if (existingScores.length >= 3 && !currentJudgeHasScored) {
      return NextResponse.json(
        { error: 'Maksimal 3 juri dapat menilai submission ini. Submission sudah dinilai oleh 3 juri.' },
        { status: 400 }
      )
    }

    // Upsert the score (update if exists, create if not)
    const score = await prisma.dCCShortVideoScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId: submissionId,
          judgeId: session.user.id
        }
      },
      update: {
        sinematografi,
        visualBentuk,
        visualEditing,
        isiPesan,
        total,
        feedback: feedback || null,
        judgeName: session.user.name || 'Unknown Judge'
      },
      create: {
        submissionId: submissionId,
        judgeId: session.user.id,
        judgeName: session.user.name || 'Unknown Judge',
        sinematografi,
        visualBentuk,
        visualEditing,
        isiPesan,
        total,
        feedback: feedback || null
      }
    })

    // Update submission status to REVIEWED (admin will decide finalists later)
    await prisma.dCCSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        status: 'REVIEWED',
        evaluatedAt: new Date(),
        evaluatedBy: session.user.id,
        feedback: feedback || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Penilaian short video berhasil disimpan',
      score,
      total,
      percentage: Math.round((total / 300) * 100)
    })
  } catch (error) {
    console.error('Error saving DCC short video score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}