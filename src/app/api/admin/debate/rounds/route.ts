import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { competitionId, stage, roundNumber, roundName } = await request.json()

    if (!competitionId || !stage || !roundNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: competitionId, stage, roundNumber' },
        { status: 400 }
      )
    }

    // Verify competition exists and is debate type
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    if (!['KDBI', 'EDC'].includes(competition.type)) {
      return NextResponse.json({ error: 'Competition must be debate type (KDBI or EDC)' }, { status: 400 })
    }

    // Create the round
    const round = await prisma.debateRound.create({
      data: {
        competitionId,
        stage: stage.toUpperCase(),
        roundNumber,
        roundName: roundName || `${stage} Round ${roundNumber}`
      }
    })

    console.log(`Admin ${user.email} created debate round: ${round.roundName} for ${competition.name}`)

    return NextResponse.json({
      success: true,
      data: { round }
    })

  } catch (error) {
    console.error('Error creating debate round:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create debate round',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

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
    const competitionId = searchParams.get('competitionId')

    const whereClause = competitionId ? { competitionId } : {}

    const rounds = await prisma.debateRound.findMany({
      where: {
        ...whereClause,
        competition: {
          type: { in: ['KDBI', 'EDC'] }
        }
      },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        matches: {
          include: {
            _count: {
              select: {
                scores: true
              }
            }
          }
        }
      },
      orderBy: [
        { competition: { type: 'asc' } },
        { stage: 'asc' },
        { roundNumber: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: { rounds }
    })

  } catch (error) {
    console.error('Error fetching debate rounds:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch debate rounds',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}