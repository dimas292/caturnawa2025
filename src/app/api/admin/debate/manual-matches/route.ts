import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Create manual matches with selected teams
export async function POST(request: NextRequest) {
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

    const { 
      competitionType, 
      stage, 
      roundName, 
      matches 
    } = await request.json()

    if (!competitionType || !stage || !matches || !Array.isArray(matches)) {
      return NextResponse.json(
        { error: 'Missing required fields: competitionType, stage, matches' },
        { status: 400 }
      )
    }

    if (!['KDBI', 'EDC'].includes(competitionType)) {
      return NextResponse.json(
        { error: 'Competition type must be KDBI or EDC' },
        { status: 400 }
      )
    }

    // Validate matches format
    for (const match of matches) {
      if (!match.room || !match.teams || !Array.isArray(match.teams)) {
        return NextResponse.json(
          { error: 'Each match must have room and teams array' },
          { status: 400 }
        )
      }

      // For British Parliamentary, need exactly 4 teams
      if (match.teams.length !== 4) {
        return NextResponse.json(
          { error: 'British Parliamentary format requires exactly 4 teams per match' },
          { status: 400 }
        )
      }
    }

    // Get competition
    const competition = await prisma.competition.findFirst({
      where: { type: competitionType }
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    // Create or find round
    let round = await prisma.debateRound.findFirst({
      where: {
        competitionId: competition.id,
        stage: stage.toUpperCase(),
        roundName: roundName || `${stage} Round 1`
      }
    })

    if (!round) {
      round = await prisma.debateRound.create({
        data: {
          competitionId: competition.id,
          stage: stage.toUpperCase(),
          roundNumber: 1,
          roundName: roundName || `${stage} Round 1`
        }
      })
    }

    // Create matches
    const createdMatches = []
    
    for (let i = 0; i < matches.length; i++) {
      const matchData = matches[i]
      
      const match = await prisma.debateMatch.create({
        data: {
          roundId: round.id,
          matchNumber: i + 1,
          matchFormat: 'BP', // British Parliamentary
          team1Id: matchData.teams[0], // Opening Government
          team2Id: matchData.teams[1], // Opening Opposition
          team3Id: matchData.teams[2], // Closing Government  
          team4Id: matchData.teams[3], // Closing Opposition
          status: 'scheduled',
          isLive: false,
          roomName: matchData.room
        }
      })

      createdMatches.push(match)
    }

    

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdMatches.length} matches`,
      data: { 
        roundId: round.id,
        roundName: round.roundName,
        matchesCreated: createdMatches.length,
        matches: createdMatches
      }
    })

  } catch (error) {
    console.error('Error creating manual matches:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create manual matches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get existing manual matches
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
    const competitionType = searchParams.get('competitionType')

    const whereClause: any = {
      round: {
        competition: {
          type: { in: ['KDBI', 'EDC'] }
        }
      }
    }

    if (competitionType && ['KDBI', 'EDC'].includes(competitionType)) {
      whereClause.round.competition.type = competitionType
    }

    const matches = await prisma.debateMatch.findMany({
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
            id: true,
            teamName: true,
            participant: { select: { fullName: true } }
          }
        },
        team2: {
          select: { 
            id: true,
            teamName: true,
            participant: { select: { fullName: true } }
          }
        },
        team3: {
          select: { 
            id: true,
            teamName: true,
            participant: { select: { fullName: true } }
          }
        },
        team4: {
          select: { 
            id: true,
            teamName: true,
            participant: { select: { fullName: true } }
          }
        },
        _count: {
          select: { scores: true }
        }
      },
      orderBy: [
        { round: { stage: 'asc' } },
        { round: { roundNumber: 'asc' } },
        { matchNumber: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: { matches }
    })

  } catch (error) {
    console.error('Error fetching manual matches:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch manual matches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}