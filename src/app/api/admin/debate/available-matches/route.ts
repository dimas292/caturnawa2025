import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get available matches that can be started live
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competitionType') // KDBI or EDC

    // Get matches that are not live and not completed
    const whereClause: any = {
      isLive: false,
      status: { not: 'completed' },
      round: {
        competition: {
          type: { in: ['KDBI', 'EDC'] }
        }
      }
    }

    if (competitionType && ['KDBI', 'EDC'].includes(competitionType)) {
      whereClause.round.competition.type = competitionType
    }

    const availableMatches = await prisma.debateMatch.findMany({
      where: whereClause,
      include: {
        round: {
          include: {
            competition: {
              select: { name: true, type: true }
            }
          }
        },
        team1: {
          select: {
            teamName: true,
            leader: { select: { fullName: true } }
          }
        },
        team2: {
          select: {
            teamName: true,
            leader: { select: { fullName: true } }
          }
        },
        team3: {
          select: {
            teamName: true,
            leader: { select: { fullName: true } }
          }
        },
        team4: {
          select: {
            teamName: true,
            leader: { select: { fullName: true } }
          }
        },
        _count: {
          select: {
            scores: true
          }
        }
      },
      orderBy: [
        { round: { stage: 'asc' } },
        { round: { roundNumber: 'asc' } },
        { matchNumber: 'asc' }
      ]
    })

    // Group by stage for easier management
    const matchesByStage = availableMatches.reduce((acc, match) => {
      const stage = match.round.stage
      if (!acc[stage]) {
        acc[stage] = []
      }
      acc[stage].push(match)
      return acc
    }, {} as Record<string, typeof availableMatches>)

    return NextResponse.json({
      success: true,
      data: { 
        availableMatches,
        matchesByStage,
        totalAvailable: availableMatches.length
      }
    })

  } catch (error) {
    console.error('Error fetching available matches:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch available matches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}