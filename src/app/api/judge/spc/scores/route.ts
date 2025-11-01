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

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch final scores from database for the current judge
    // `sPCFinalScore` uses an unconventional capitalized model name; cast to any to satisfy TS in this file
    const scores = await (prisma as any).sPCFinalScore.findMany({
      where: {
        judgeId: session.user.id
      },
      include: {
        submission: {
          include: {
            registration: {
              include: {
                participant: {
                  select: { fullName: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const transformedScores = (scores as any[]).map((score: any) => ({
      participantId: score.submissionId,
      participantName: score.submission?.registration?.participant?.fullName || 'Unknown',
      judgeId: score.judgeId,
      judgeName: score.judgeName,
      pemaparanMateri: score.pemaparanMateri,
      pertanyaanJawaban: score.pertanyaanJawaban,
      kesesuaianTema: score.kesesuaianTema,
      total: score.total,
      feedback: score.feedback
    }))

    return NextResponse.json({ scores: transformedScores })
  } catch (error) {
    console.error('Error fetching SPC scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    // Do not call prisma.$disconnect() here to avoid closing shared client in serverless env
  }
}