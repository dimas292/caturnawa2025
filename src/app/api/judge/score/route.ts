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

    if (user?.role !== 'judge') {
      return NextResponse.json({ error: 'Judge access required' }, { status: 403 })
    }

    const body = await request.json()
    const { matchId, scores, markAsCompleted } = body

    // Validate required fields
    if (!matchId || !scores || !Array.isArray(scores)) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId and scores array' },
        { status: 400 }
      )
    }

    // Validate each score entry
    for (const scoreEntry of scores) {
      if (!scoreEntry.participantId || typeof scoreEntry.score !== 'number') {
        return NextResponse.json(
          { error: 'Each score entry must have participantId and score' },
          { status: 400 }
        )
      }

      if (scoreEntry.score < 1 || scoreEntry.score > 100) {
        return NextResponse.json(
          { error: 'Score must be between 1 and 100' },
          { status: 400 }
        )
      }
    }

    // Verify the match exists and get match details
    const match = await prisma.debateMatch.findUnique({
      where: { id: matchId },
      include: {
        round: {
          include: {
            competition: true
          }
        },
        team1: {
          include: {
            teamMembers: {
              select: {
                participantId: true,
                fullName: true,
                position: true
              }
            }
          }
        },
        team2: {
          include: {
            teamMembers: {
              select: {
                participantId: true,
                fullName: true,
                position: true
              }
            }
          }
        },
        scores: true
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Get all participants from both teams
    const team1ParticipantIds = match.team1?.teamMembers.map(tm => tm.participantId) || []
    const team2ParticipantIds = match.team2?.teamMembers.map(tm => tm.participantId) || []
    const allParticipantIds = [...team1ParticipantIds, ...team2ParticipantIds]

    // Validate that all score entries are for participants in this match
    for (const scoreEntry of scores) {
      if (!allParticipantIds.includes(scoreEntry.participantId)) {
        return NextResponse.json(
          { error: `Participant ${scoreEntry.participantId} is not in this match` },
          { status: 400 }
        )
      }
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      const savedScores = []

      // Save or update scores
      for (const scoreEntry of scores) {
        const savedScore = await tx.debateScore.upsert({
          where: {
            matchId_participantId: {
              matchId: matchId,
              participantId: scoreEntry.participantId
            }
          },
          update: {
            score: scoreEntry.score,
            judgeId: user.id
          },
          create: {
            matchId: matchId,
            participantId: scoreEntry.participantId,
            score: scoreEntry.score,
            judgeId: user.id
          },
          include: {
            participant: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        })
        savedScores.push(savedScore)
      }

      // If markAsCompleted is true, mark the match as completed and determine winner
      let updatedMatch = match
      if (markAsCompleted) {
        // Calculate team scores
        const team1Scores = savedScores.filter(score => 
          team1ParticipantIds.includes(score.participantId)
        )
        const team2Scores = savedScores.filter(score => 
          team2ParticipantIds.includes(score.participantId)
        )

        const team1AvgScore = team1Scores.length > 0 ? 
          team1Scores.reduce((sum, s) => sum + s.score, 0) / team1Scores.length : 0
        const team2AvgScore = team2Scores.length > 0 ? 
          team2Scores.reduce((sum, s) => sum + s.score, 0) / team2Scores.length : 0

        // Determine winner
        let winnerTeamId = null
        if (team1AvgScore > team2AvgScore) {
          winnerTeamId = match.team1Id
        } else if (team2AvgScore > team1AvgScore) {
          winnerTeamId = match.team2Id
        }
        // If scores are equal, leave winnerTeamId as null (draw)

        // Update match
        updatedMatch = await tx.debateMatch.update({
          where: { id: matchId },
          data: {
            completedAt: new Date(),
            winnerTeamId: winnerTeamId
          },
          include: match.round ? {
            round: {
              include: {
                competition: true
              }
            },
            team1: {
              include: {
                teamMembers: true
              }
            },
            team2: {
              include: {
                teamMembers: true
              }
            }
          } : undefined
        })

        // Update team standings
        if (match.team1Id) {
          await updateTeamStanding(tx, match.team1Id, updatedMatch, team1AvgScore, winnerTeamId === match.team1Id)
        }
        if (match.team2Id) {
          await updateTeamStanding(tx, match.team2Id, updatedMatch, team2AvgScore, winnerTeamId === match.team2Id)
        }
      }

      return { savedScores, updatedMatch }
    })

    console.log(`Judge ${user.email} submitted ${scores.length} scores for match ${matchId}`)
    if (markAsCompleted) {
      console.log(`Match ${matchId} marked as completed`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${scores.length} scores${markAsCompleted ? ' and completed match' : ''}`,
      data: {
        scores: result.savedScores,
        match: result.updatedMatch,
        matchCompleted: markAsCompleted
      }
    })

  } catch (error) {
    console.error('Error saving debate scores:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to update team standings
async function updateTeamStanding(
  tx: any, 
  registrationId: string, 
  match: any, 
  teamAvgScore: number, 
  isWinner: boolean
) {
  const currentStanding = await tx.teamStanding.findUnique({
    where: { registrationId }
  })

  const stage = match.round.stage.toLowerCase()
  const isNewMatch = !currentStanding || currentStanding.matchesPlayed === 0

  const newVP = isWinner ? 1 : 0
  const updatedData = {
    matchesPlayed: (currentStanding?.matchesPlayed || 0) + 1,
    wins: (currentStanding?.wins || 0) + (isWinner ? 1 : 0),
    losses: (currentStanding?.losses || 0) + (isWinner ? 0 : 1),
    totalScore: (currentStanding?.totalScore || 0) + teamAvgScore,
    victoryPoints: (currentStanding?.victoryPoints || 0) + newVP
  }

  // Calculate new average
  updatedData.averageScore = updatedData.totalScore / updatedData.matchesPlayed

  // Update stage-specific data
  if (stage === 'preliminary') {
    updatedData.prelimVP = (currentStanding?.prelimVP || 0) + newVP
    const prelimMatches = Math.floor(updatedData.matchesPlayed) // Assuming all matches so far are prelim for simplicity
    updatedData.prelimAvgScore = updatedData.totalScore / prelimMatches
  } else if (stage === 'semifinal') {
    updatedData.semifinalVP = (currentStanding?.semifinalVP || 0) + newVP
    updatedData.semifinalAvgScore = teamAvgScore // This could be more sophisticated
  } else if (stage === 'final') {
    updatedData.finalVP = (currentStanding?.finalVP || 0) + newVP
    updatedData.finalAvgScore = teamAvgScore
  }

  await tx.teamStanding.upsert({
    where: { registrationId },
    update: updatedData,
    create: {
      registrationId,
      ...updatedData
    }
  })
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

    if (user?.role !== 'judge') {
      return NextResponse.json({ error: 'Judge access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      )
    }

    // Get existing scores for the match
    const scores = await prisma.debateScore.findMany({
      where: { matchId },
      include: {
        participant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            institution: true
          }
        },
        match: {
          select: {
            id: true,
            matchNumber: true,
            round: {
              select: {
                stage: true,
                roundName: true,
                competition: {
                  select: {
                    name: true,
                    type: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { scores }
    })

  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}