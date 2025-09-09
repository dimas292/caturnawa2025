import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'judge') {
      return NextResponse.json({ error: 'Judge access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competition')
    const stage = searchParams.get('stage') 
    const onlyLive = searchParams.get('onlyLive') === 'true'
    const onlyPending = searchParams.get('onlyPending') === 'true'
    const matchId = searchParams.get('matchId')

    // Build where clause for rounds
    const roundWhereClause: any = {
      competition: {
        type: competitionType ? { in: competitionType.split(',') } : { in: ['KDBI', 'EDC'] }
      }
    }

    if (stage) {
      roundWhereClause.stage = stage
    }

    // Build match where clause
    const matchWhereClause: any = {
      round: roundWhereClause,
      // Only include matches that have teams assigned
      AND: [
        { team1Id: { not: null } },
        { team2Id: { not: null } }
      ]
    }

    // If specific match requested
    if (matchId) {
      matchWhereClause.id = matchId
    }

    // Fetch debate matches with all related data
    const matches = await prisma.debateMatch.findMany({
      where: matchWhereClause,
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
            participant: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            teamMembers: {
              include: {
                participant: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    gender: true,
                    institution: true
                  }
                }
              },
              orderBy: { position: 'asc' }
            }
          }
        },
        team2: {
          include: {
            participant: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            teamMembers: {
              include: {
                participant: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    gender: true,
                    institution: true
                  }
                }
              },
              orderBy: { position: 'asc' }
            }
          }
        },
        scores: {
          include: {
            participant: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { round: { stage: 'asc' } },
        { round: { roundNumber: 'asc' } },
        { matchNumber: 'asc' }
      ]
    })

    // Transform matches for frontend consumption
    const transformedMatches = matches.map(match => {
      const team1Members = match.team1?.teamMembers || []
      const team2Members = match.team2?.teamMembers || []
      const totalExpectedScores = team1Members.length + team2Members.length

      // Group scores by participant
      const scoresByParticipant = match.scores.reduce((acc, score) => {
        acc[score.participantId] = score
        return acc
      }, {} as Record<string, any>)

      // Calculate team scores
      const team1Scores = team1Members.map(member => 
        scoresByParticipant[member.participantId]
      ).filter(Boolean)
      
      const team2Scores = team2Members.map(member => 
        scoresByParticipant[member.participantId]
      ).filter(Boolean)

      const team1TotalScore = team1Scores.reduce((sum, score) => sum + score.score, 0)
      const team2TotalScore = team2Scores.reduce((sum, score) => sum + score.score, 0)

      const team1AvgScore = team1Scores.length > 0 ? team1TotalScore / team1Scores.length : 0
      const team2AvgScore = team2Scores.length > 0 ? team2TotalScore / team2Scores.length : 0

      // Determine match status
      let matchStatus: 'pending' | 'scoring' | 'completed' | 'live' = 'pending'
      let winner: 'team1' | 'team2' | 'draw' | null = null

      if (match.scheduledAt && !match.completedAt) {
        const now = new Date()
        const scheduled = new Date(match.scheduledAt)
        const scheduledEnd = new Date(scheduled.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration
        
        if (now >= scheduled && now <= scheduledEnd) {
          matchStatus = 'live'
        }
      }

      if (match.completedAt) {
        if (match.scores.length === totalExpectedScores) {
          matchStatus = 'completed'
          // Determine winner
          if (team1AvgScore > team2AvgScore) {
            winner = 'team1'
          } else if (team2AvgScore > team1AvgScore) {
            winner = 'team2'
          } else {
            winner = 'draw'
          }
        } else {
          matchStatus = 'scoring'
        }
      }

      const isLiveMatch = matchStatus === 'live'
      const needsScoring = matchStatus === 'scoring' || (matchStatus === 'completed' && match.scores.length < totalExpectedScores)

      return {
        id: match.id,
        matchNumber: match.matchNumber,
        round: {
          id: match.round.id,
          stage: match.round.stage,
          roundNumber: match.round.roundNumber,
          roundName: match.round.roundName,
          competition: match.round.competition
        },
        team1: match.team1 ? {
          id: match.team1.id,
          teamName: match.team1.teamName,
          leader: match.team1.participant,
          members: team1Members,
          scores: team1Scores,
          totalScore: team1TotalScore,
          averageScore: team1AvgScore
        } : null,
        team2: match.team2 ? {
          id: match.team2.id,
          teamName: match.team2.teamName,
          leader: match.team2.participant,
          members: team2Members,
          scores: team2Scores,
          totalScore: team2TotalScore,
          averageScore: team2AvgScore
        } : null,
        winnerTeamId: match.winnerTeamId,
        winner,
        status: matchStatus,
        isLive: isLiveMatch,
        needsScoring,
        scoringProgress: {
          completed: match.scores.length,
          total: totalExpectedScores,
          percentage: totalExpectedScores > 0 ? Math.round((match.scores.length / totalExpectedScores) * 100) : 0
        },
        scheduledAt: match.scheduledAt,
        completedAt: match.completedAt,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
      }
    })

    // Apply filters
    let filteredMatches = transformedMatches

    if (onlyLive) {
      filteredMatches = filteredMatches.filter(match => match.isLive)
    }

    if (onlyPending) {
      filteredMatches = filteredMatches.filter(match => match.needsScoring)
    }

    // Calculate statistics
    const stats = {
      totalMatches: transformedMatches.length,
      liveMatches: transformedMatches.filter(m => m.isLive).length,
      completedMatches: transformedMatches.filter(m => m.status === 'completed').length,
      pendingScoring: transformedMatches.filter(m => m.needsScoring).length,
      byStage: {
        preliminary: transformedMatches.filter(m => m.round.stage === 'PRELIMINARY').length,
        semifinal: transformedMatches.filter(m => m.round.stage === 'SEMIFINAL').length,
        final: transformedMatches.filter(m => m.round.stage === 'FINAL').length
      },
      byCompetition: {
        KDBI: transformedMatches.filter(m => m.round.competition.type === 'KDBI').length,
        EDC: transformedMatches.filter(m => m.round.competition.type === 'EDC').length
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        matches: filteredMatches,
        stats,
        filters: {
          competition: competitionType || 'all',
          stage: stage || 'all',
          onlyLive,
          onlyPending
        }
      }
    })

  } catch (error) {
    console.error('Error fetching debate matches:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch debate matches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}