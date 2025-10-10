import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has judge role
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
    const competitionType = searchParams.get('competition') // 'KDBI' or 'EDC'
    const stage = searchParams.get('stage') // 'PRELIMINARY', 'SEMIFINAL', 'FINAL'
    const onlyUnscored = searchParams.get('onlyUnscored') === 'true'

    // Build where clause
    const whereClause: any = {
      competition: {
        type: competitionType ? { in: competitionType.split(',') } : { in: ['KDBI', 'EDC'] }
      },
      status: 'VERIFIED' // Only include verified registrations
    }

    // Fetch debate participants with their team members and scoring data
    const participants = await prisma.registration.findMany({
      where: whereClause,
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        competition: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true
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
                institution: true,
                faculty: true,
                studyProgram: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        },
        teamStanding: true,
        // Get match history for this team
        team1Matches: {
          include: {
            round: true,
            team2: {
              select: {
                id: true,
                teamName: true,
                participant: {
                  select: {
                    fullName: true
                  }
                }
              }
            },
            scores: {
              include: {
                participant: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              }
            }
          }
        },
        team2Matches: {
          include: {
            round: true,
            team1: {
              select: {
                id: true,
                teamName: true,
                participant: {
                  select: {
                    fullName: true
                  }
                }
              }
            },
            scores: {
              include: {
                participant: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { competition: { type: 'asc' } },
        { teamName: 'asc' }
      ]
    })

    // Transform the data for easier consumption by the frontend
    const transformedParticipants = participants.map(registration => {
      // Combine all matches (both team1 and team2)
      const allMatches = [
        ...registration.team1Matches.map(match => ({
          ...match,
          isTeam1: true,
          opponent: match.team2,
          teamRole: 'team1' as const
        })),
        ...registration.team2Matches.map(match => ({
          ...match,
          isTeam1: false,
          opponent: match.team1,
          teamRole: 'team2' as const
        }))
      ].sort((a, b) => {
        // Sort by stage and round
        const stageOrder = { PRELIMINARY: 1, SEMIFINAL: 2, FINAL: 3 }
        if (a.round.stage !== b.round.stage) {
          return stageOrder[a.round.stage as keyof typeof stageOrder] - 
                 stageOrder[b.round.stage as keyof typeof stageOrder]
        }
        return a.round.roundNumber - b.round.roundNumber
      })

      // Calculate team statistics
      const teamMembers = registration.teamMembers.map(member => {
        // Calculate individual scores from all matches
        const individualScores = allMatches.flatMap(match => 
          match.scores.filter(score => score.participant.id === member.participantId)
        )

        const totalIndividualScore = individualScores.reduce((sum, score) => sum + score.score, 0)
        const averageIndividualScore = individualScores.length > 0 ? 
          totalIndividualScore / individualScores.length : 0

        return {
          id: member.id,
          position: member.position,
          role: member.role,
          fullName: member.fullName,
          email: member.email,
          phone: member.phone,
          institution: member.institution,
          faculty: member.faculty,
          studentId: member.studentId,
          participantId: member.participantId,
          participant: member.participant,
          // Scoring data
          individualScores,
          totalScore: totalIndividualScore,
          averageScore: averageIndividualScore,
          matchesScored: individualScores.length
        }
      })

      // Team-level statistics
      const matchesPlayed = allMatches.filter(match => match.completedAt).length
      const wins = allMatches.filter(match => 
        match.completedAt && match.winnerTeamId === registration.id
      ).length
      const totalTeamScore = teamMembers.reduce((sum, member) => sum + member.totalScore, 0)
      const averageTeamScore = teamMembers.length > 0 ? totalTeamScore / teamMembers.length : 0

      // Filter by stage if requested
      const filteredMatches = stage ? 
        allMatches.filter(match => match.round.stage === stage) : 
        allMatches

      // Check if team has unscored matches (for filtering)
      const hasUnscoredMatches = allMatches.some(match => 
        match.completedAt && match.scores.length < (registration.teamMembers.length * 2) // Each team member should have scores
      )

      return {
        id: registration.id,
        teamName: registration.teamName,
        status: registration.status,
        competition: registration.competition,
        leader: {
          id: registration.participant.id,
          fullName: registration.participant?.fullName || 'Unknown Participant',
          email: registration.participant.email,
          user: registration.participant.user
        },
        teamMembers,
        teamStanding: registration.teamStanding,
        // Match data
        matches: filteredMatches,
        allMatches: allMatches,
        // Statistics
        matchesPlayed,
        wins,
        losses: matchesPlayed - wins,
        totalTeamScore,
        averageTeamScore,
        // Scoring status
        hasUnscoredMatches,
        fullyScored: !hasUnscoredMatches && matchesPlayed > 0,
        // Timestamps
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt
      }
    })

    // Apply unscored filter if requested
    const finalParticipants = onlyUnscored ? 
      transformedParticipants.filter(p => p.hasUnscoredMatches) : 
      transformedParticipants

    // Get summary statistics
    const stats = {
      totalTeams: transformedParticipants.length,
      kdbietTeams: transformedParticipants.filter(p => p.competition.type === 'KDBI').length,
      edcTeams: transformedParticipants.filter(p => p.competition.type === 'EDC').length,
      teamsWithMatches: transformedParticipants.filter(p => p.matchesPlayed > 0).length,
      fullyScored: transformedParticipants.filter(p => p.fullyScored).length,
      needsScoring: transformedParticipants.filter(p => p.hasUnscoredMatches).length,
      totalMatches: transformedParticipants.reduce((sum, p) => sum + p.matchesPlayed, 0),
      averageScoresPerTeam: transformedParticipants.length > 0 ? 
        transformedParticipants.reduce((sum, p) => sum + p.averageTeamScore, 0) / transformedParticipants.length : 0
    }

    return NextResponse.json({
      success: true,
      data: {
        participants: finalParticipants,
        stats,
        filters: {
          competition: competitionType || 'all',
          stage: stage || 'all',
          onlyUnscored
        }
      }
    })

  } catch (error) {
    console.error('Error fetching debate participants:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch debate participants',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}