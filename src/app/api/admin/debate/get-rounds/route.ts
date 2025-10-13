import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competition') || 'KDBI'
    const stage = searchParams.get('stage')

    // Build where clause
    const where: any = {
      competition: {
        type: competitionType as any
      }
    }

    if (stage) {
      where.stage = stage
    }

    // Get all rounds with frozen status
    const rounds = await prisma.debateRound.findMany({
      where,
      include: {
        competition: {
          select: {
            name: true,
            shortName: true,
            type: true
          }
        },
        matches: {
          select: {
            id: true,
            hasScored: true
          }
        }
      },
      orderBy: [
        { stage: 'asc' },
        { roundNumber: 'asc' },
        { session: 'asc' }
      ]
    })

    // Add statistics to each round
    const roundsWithStats = rounds.map(round => ({
      id: round.id,
      roundName: round.roundName,
      stage: round.stage,
      roundNumber: round.roundNumber,
      session: round.session,
      motion: round.motion,
      isFrozen: round.isFrozen,
      frozenAt: round.frozenAt,
      frozenBy: round.frozenBy,
      competition: round.competition,
      totalMatches: round.matches.length,
      scoredMatches: round.matches.filter(m => m.hasScored).length,
      createdAt: round.createdAt,
      updatedAt: round.updatedAt
    }))

    return NextResponse.json({
      success: true,
      rounds: roundsWithStats,
      count: roundsWithStats.length
    })

  } catch (error) {
    console.error('Error fetching rounds:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
