import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Start or stop live match
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

    const { matchId, action } = await request.json()

    if (!matchId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, action' },
        { status: 400 }
      )
    }

    if (!['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "start" or "stop"' },
        { status: 400 }
      )
    }

    // Verify match exists
    const match = await prisma.debateMatch.findUnique({
      where: { id: matchId },
      include: {
        round: {
          include: {
            competition: {
              select: { name: true, type: true }
            }
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Update match status
    const updatedMatch = await prisma.debateMatch.update({
      where: { id: matchId },
      data: {
        isLive: action === 'start',
        status: action === 'start' ? 'in_progress' : 'pending',
        scheduledAt: action === 'start' ? new Date() : match.scheduledAt
      }
    })

    

    return NextResponse.json({
      success: true,
      message: action === 'start' ? 'Match started successfully' : 'Match stopped successfully',
      data: { match: updatedMatch }
    })

  } catch (error) {
    console.error('Error managing live match:', error)
    return NextResponse.json(
      { 
        error: 'Failed to manage live match',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get live matches status
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

    // Get all live matches
    const liveMatches = await prisma.debateMatch.findMany({
      where: {
        isLive: true
      },
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
      orderBy: { scheduledAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { 
        liveMatches,
        count: liveMatches.length 
      }
    })

  } catch (error) {
    console.error('Error fetching live matches:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch live matches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}