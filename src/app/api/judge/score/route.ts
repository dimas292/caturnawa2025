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
        team3: {
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
        team4: {
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

    // Get all participants from all teams (BP format: 4 teams)
    const team1ParticipantIds = match.team1?.teamMembers.map(tm => tm.participantId) || []
    const team2ParticipantIds = match.team2?.teamMembers.map(tm => tm.participantId) || []
    const team3ParticipantIds = match.team3?.teamMembers.map(tm => tm.participantId) || []
    const team4ParticipantIds = match.team4?.teamMembers.map(tm => tm.participantId) || []
    const allParticipantIds = [...team1ParticipantIds, ...team2ParticipantIds, ...team3ParticipantIds, ...team4ParticipantIds]

    // Handle duplicate participantIds by averaging scores
    // This happens when a team has the same participant for both speakers (data issue)
    const participantScoresMap = new Map<string, number[]>()
    
    for (const scoreEntry of scores) {
      const existing = participantScoresMap.get(scoreEntry.participantId) || []
      existing.push(scoreEntry.score)
      participantScoresMap.set(scoreEntry.participantId, existing)
    }
    
    const deduplicatedScores = Array.from(participantScoresMap.entries()).map(([participantId, scoresList]) => {
      if (scoresList.length > 1) {
        const avgScore = scoresList.reduce((sum, s) => sum + s, 0) / scoresList.length
        console.warn(`⚠️ Backend: Participant ${participantId} has ${scoresList.length} scores [${scoresList.join(', ')}], averaging to ${avgScore}`)
        return { participantId, score: avgScore }
      }
      return { participantId, score: scoresList[0] }
    })
    
    if (deduplicatedScores.length !== scores.length) {
      console.log(`ℹ️ Backend: Processed ${scores.length} scores into ${deduplicatedScores.length} unique participant scores`)
    }

    // Validate all participants are in the match
    for (const scoreEntry of deduplicatedScores) {
      if (!allParticipantIds.includes(scoreEntry.participantId)) {
        return NextResponse.json(
          { error: `Participant ${scoreEntry.participantId} is not in this match` },
          { status: 400 }
        )
      }
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing scores from this judge for this match (if any)
      const deleted = await tx.debateScore.deleteMany({
        where: {
          matchId: matchId,
          judgeId: user.id
        }
      })

      if (deleted.count > 0) {
        console.log(`⚠️  Judge has existing scores, deleted ${deleted.count} old scores for re-submission`)
      }

      const savedScores = []

      // Create all new scores (using deduplicated array)
      for (const scoreEntry of deduplicatedScores) {
        const savedScore = await tx.debateScore.create({
          data: {
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
        
        console.log(`✓ Saved score for ${savedScore.participant.fullName}: ${savedScore.score}`)
        savedScores.push(savedScore)
      }

      // If markAsCompleted is true, mark the match as completed and calculate BP rankings
      let updatedMatch = match
      if (markAsCompleted) {
        // Calculate team scores for BP format (4 teams)
        const team1Scores = savedScores.filter(score => team1ParticipantIds.includes(score.participantId))
        const team2Scores = savedScores.filter(score => team2ParticipantIds.includes(score.participantId))
        const team3Scores = savedScores.filter(score => team3ParticipantIds.includes(score.participantId))
        const team4Scores = savedScores.filter(score => team4ParticipantIds.includes(score.participantId))

        const team1Total = team1Scores.length > 0 ? team1Scores.reduce((sum, s) => sum + s.score, 0) : 0
        const team2Total = team2Scores.length > 0 ? team2Scores.reduce((sum, s) => sum + s.score, 0) : 0
        const team3Total = team3Scores.length > 0 ? team3Scores.reduce((sum, s) => sum + s.score, 0) : 0
        const team4Total = team4Scores.length > 0 ? team4Scores.reduce((sum, s) => sum + s.score, 0) : 0

        // Create team ranking array for BP format
        const teamRankings = [
          { teamId: match.team1Id, teamName: 'OG', total: team1Total, position: 'OG' },
          { teamId: match.team2Id, teamName: 'OO', total: team2Total, position: 'OO' },
          { teamId: match.team3Id, teamName: 'CG', total: team3Total, position: 'CG' },
          { teamId: match.team4Id, teamName: 'CO', total: team4Total, position: 'CO' }
        ].filter(team => team.teamId) // Only include teams that exist
        .sort((a, b) => b.total - a.total) // Sort by total score (highest first)

        // Assign BP victory points: 1st=3pts, 2nd=2pts, 3rd=1pt, 4th=0pts
        const victoryPoints = [3, 2, 1, 0]
        const firstPlaceTeamId = teamRankings[0]?.teamId

        // Update match with completion and rankings
        updatedMatch = await tx.debateMatch.update({
          where: { id: matchId },
          data: {
            completedAt: new Date(),
            firstPlaceTeamId: firstPlaceTeamId,
            secondPlaceTeamId: teamRankings[1]?.teamId,
            thirdPlaceTeamId: teamRankings[2]?.teamId,
            fourthPlaceTeamId: teamRankings[3]?.teamId
          },
          include: {
            round: { include: { competition: true } },
            team1: { include: { teamMembers: true } },
            team2: { include: { teamMembers: true } },
            team3: { include: { teamMembers: true } },
            team4: { include: { teamMembers: true } },
            scores: true
          }
        })

        // Update team standings with BP scoring
        for (let i = 0; i < teamRankings.length; i++) {
          const team = teamRankings[i]
          if (team.teamId) {
            await updateBPTeamStanding(tx, team.teamId, updatedMatch, team.total, victoryPoints[i], i + 1)
          }
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

// Helper function to update team standings with BP scoring system
async function updateBPTeamStanding(
  tx: any, 
  registrationId: string, 
  match: any, 
  teamTotalScore: number,
  victoryPointsEarned: number,
  placement: number // 1st, 2nd, 3rd, 4th
) {
  const currentStanding = await tx.teamStanding.findUnique({
    where: { registrationId }
  })

  const matchesPlayed = (currentStanding?.matchesPlayed || 0) + 1
  const firstPlaces = (currentStanding?.firstPlaces || 0) + (placement === 1 ? 1 : 0)
  const secondPlaces = (currentStanding?.secondPlaces || 0) + (placement === 2 ? 1 : 0)
  const thirdPlaces = (currentStanding?.thirdPlaces || 0) + (placement === 3 ? 1 : 0)
  const fourthPlaces = (currentStanding?.fourthPlaces || 0) + (placement === 4 ? 1 : 0)
  const speakerPoints = (currentStanding?.speakerPoints || 0) + teamTotalScore

  const updatedData = {
    matchesPlayed,
    teamPoints: (currentStanding?.teamPoints || 0) + victoryPointsEarned,
    speakerPoints,
    
    // Position tracking for BP
    firstPlaces,
    secondPlaces,
    thirdPlaces,
    fourthPlaces,
    
    // Calculate average speaker points and average position
    averageSpeakerPoints: speakerPoints / matchesPlayed,
    avgPosition: ((firstPlaces * 1) + (secondPlaces * 2) + (thirdPlaces * 3) + (fourthPlaces * 4)) / matchesPlayed
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

// API to get leaderboard with BP tie-breaker logic
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