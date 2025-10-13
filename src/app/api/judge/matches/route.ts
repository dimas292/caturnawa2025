// src/app/api/judge/matches/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'judge' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage') || 'PRELIMINARY'
    const roundNumber = searchParams.get('round') ? parseInt(searchParams.get('round')!) : 1
    const sessionNumber = searchParams.get('session') ? parseInt(searchParams.get('session')!) : undefined
    const competition = searchParams.get('competition') || 'KDBI'

    // Build where clause with optional session filter
    const whereClause: any = {
      round: {
        competition: { type: competition as any },
        stage: stage as any,
        roundNumber: roundNumber
      }
    }

    // Add session filter only if provided (for PRELIMINARY stage)
    if (sessionNumber !== undefined) {
      whereClause.round.session = sessionNumber
    }

    // Get matches for the specified stage and round
    const matches = await prisma.debateMatch.findMany({
      where: whereClause,
      include: {
        round: {
          include: {
            competition: {
              select: {
                id: true,
                name: true,
                type: true,
                category: true
              }
            }
          }
        },
        team1: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team2: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team3: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team4: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        judge: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        scores: {
          where: {
            judgeId: session.user.id
          }
        }
      },
      orderBy: {
        matchNumber: 'asc'
      }
    })

    // Format matches for frontend
    const toTeam = (team: any, index: number) => {
      if (!team) return null
      const membersArr = (team.teamMembers || [])
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        .slice(0, 2)
        .map((member: any) => ({
          participantId: member.participantId ?? member.participant?.id,
          fullName: member.fullName ?? member.participant?.fullName ?? 'Unknown',
          position: member.position ?? 0,
          participant: {
            fullName: member.fullName ?? member.participant?.fullName ?? 'Unknown'
          }
        }))
      const fallbackName = membersArr.map((m: any) => m.fullName).join(' & ')
      return {
        id: team.id,
        teamName: team.teamName || fallbackName || `Team ${index + 1}`,
        members: membersArr
      }
    }

    const formattedMatches = matches.map(match => {
      return {
        id: match.id,
        matchNumber: match.matchNumber,
        roundName: match.round.roundName,
        stage: match.round.stage,
        judge: match.judge ? {
          id: match.judge.id,
          name: match.judge.name,
          email: match.judge.email
        } : null,
        team1: toTeam(match.team1, 0),
        team2: toTeam(match.team2, 1),
        team3: toTeam(match.team3, 2),
        team4: toTeam(match.team4, 3),
        hasScored: match.scores.length > 0,
        isCompleted: !!match.completedAt,
        scheduledAt: match.scheduledAt,
        completedAt: match.completedAt
      }
    })

    return NextResponse.json({ matches: formattedMatches })

  } catch (error) {
    const details = error instanceof Error ? { message: error.message, stack: error.stack } : { message: 'Unknown error' }
    console.error('Error fetching judge matches:', details)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: details.message
    }, { status: 500 })
  }
}
