import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Disable caching for real-time results
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Check if results are globally disabled
    if (process.env.SHOW_PUBLIC_RESULTS === 'false') {
      return NextResponse.json({ 
        error: 'Results are currently unavailable',
        message: 'Public results are temporarily disabled'
      }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competition') || 'KDBI'
    const stage = searchParams.get('stage') || 'PRELIMINARY'
    const roundNumber = parseInt(searchParams.get('round') || '1')
    const session = parseInt(searchParams.get('session') || '1')

    // Get the specific round
    const round = await prisma.debateRound.findFirst({
      where: {
        competition: { type: competitionType as any },
        stage: stage as any,
        roundNumber: roundNumber,
        session: session
      },
      include: {
        competition: true,
        matches: {
          include: {
            team1: {
              include: {
                teamMembers: {
                  include: { participant: true },
                  orderBy: { position: 'asc' }
                }
              }
            },
            team2: {
              include: {
                teamMembers: {
                  include: { participant: true },
                  orderBy: { position: 'asc' }
                }
              }
            },
            team3: {
              include: {
                teamMembers: {
                  include: { participant: true },
                  orderBy: { position: 'asc' }
                }
              }
            },
            team4: {
              include: {
                teamMembers: {
                  include: { participant: true },
                  orderBy: { position: 'asc' }
                }
              }
            },
            scores: {
              include: {
                participant: true
              }
            }
          },
          orderBy: { matchNumber: 'asc' }
        }
      }
    })

    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    // Check if round is frozen (public can't see frozen results)
    const isFrozen = false // TODO: Implement frozen rounds feature
    if (isFrozen) {
      return NextResponse.json({ 
        error: 'Round results are currently frozen',
        isFrozen: true,
        message: 'Results for this round are temporarily hidden and will be revealed soon'
      }, { status: 403 })
    }

    // Process matches data with PUBLIC access restrictions
    const roomResults = round.matches.map((match) => {
      // Process teams in this match
      const teams = []
      
      // Helper function to get PUBLIC team data with individual scores
      const getPublicTeamData = (team: any, position: string) => {
        if (!team) return null

        const teamScores = match.scores.filter(s => 
          team.teamMembers.some((tm: any) => tm.participantId === s.participantId)
        )

        // Calculate team score and individual participant scores
        const teamScore = teamScores.reduce((sum, s) => sum + s.score, 0)
        const teamRank = getTeamRank(match, team.id)
        const victoryPoints = getVictoryPoints(teamRank)
        
        // Get individual participant scores with names
        const participants = team.teamMembers
          .slice(0, 2) // Only take first 2 members (speakers)
          .map((member: any, memberIndex: number) => {
            // For teams with duplicate participantId, match by bpPosition
            const expectedBpPosition = `Team${getTeamNumber(match, team.id)}_Speaker${memberIndex + 1}`
            
            // Try to find score by participantId AND bpPosition first
            let participantScore = teamScores.find(s => 
              s.participantId === member.participantId && 
              s.bpPosition === expectedBpPosition
            )
            
            // Fallback: if no bpPosition match, find by participantId and position
            if (!participantScore) {
              const memberScores = teamScores.filter(s => s.participantId === member.participantId)
              if (memberScores.length > 1) {
                // Multiple scores for same participantId - use array index
                participantScore = memberScores[memberIndex]
              } else {
                // Single score for this participantId
                participantScore = memberScores[0]
              }
            }
            
            return {
              id: member.participantId,
              name: member.fullName || member.participant?.fullName || 'Unknown',
              role: member.role,
              position: member.position,
              score: participantScore ? participantScore.score : null,
              bpPosition: participantScore ? participantScore.bpPosition : null
            }
          })
          .sort((a: any, b: any) => a.position - b.position)

        // Calculate average score per participant (if scores exist)
        const averageScore = teamScores.length > 0 ? teamScore / participants.length : null

        return {
          id: team.id,
          name: team.teamName,
          position,
          teamScore: teamScores.length > 0 ? teamScore : null,
          averageScore: averageScore,
          rank: teamScores.length > 0 ? teamRank : null,
          victoryPoints: teamScores.length > 0 ? victoryPoints : null,
          participantCount: team.teamMembers.length,
          participants: participants
        }
      }

      // Process each team position
      if (match.team1) {
        const teamData = getPublicTeamData(match.team1, 'Opening Government (OG)')
        if (teamData) teams.push(teamData)
      }
      
      if (match.team2) {
        const teamData = getPublicTeamData(match.team2, 'Opening Opposition (OO)')
        if (teamData) teams.push(teamData)
      }
      
      if (match.team3) {
        const teamData = getPublicTeamData(match.team3, 'Closing Government (CG)')
        if (teamData) teams.push(teamData)
      }
      
      if (match.team4) {
        const teamData = getPublicTeamData(match.team4, 'Closing Opposition (CO)')
        if (teamData) teams.push(teamData)
      }

      return {
        roomNumber: match.matchNumber,
        teams: teams.filter(t => t !== null),
        isCompleted: match.completedAt !== null,
        completedAt: match.completedAt
        // NO judge information for public view
      }
    })

    // Calculate PUBLIC statistics (limited info)
    const completedTeams = roomResults
      .flatMap(room => room.teams)
      .filter(team => team.teamScore !== null)
    
    const publicStatistics = {
      totalRooms: roomResults.length,
      totalTeams: roomResults.flatMap(room => room.teams).length,
      completedRooms: roomResults.filter(room => room.isCompleted).length,
      victoryPointsDistribution: {
        first: completedTeams.filter(t => t.rank === 1).length,
        second: completedTeams.filter(t => t.rank === 2).length,
        third: completedTeams.filter(t => t.rank === 3).length,
        fourth: completedTeams.filter(t => t.rank === 4).length
      },
      // No detailed score statistics for public
    }

    return NextResponse.json({
      round: {
        id: round.id,
        stage: round.stage,
        roundNumber: round.roundNumber,
        roundName: round.roundName,
        motion: round.motion || `Motion for ${round.stage} Round ${round.roundNumber}`,
        competitionName: round.competition.name,
        isFrozen: isFrozen
      },
      roomResults,
      statistics: publicStatistics,
      generatedAt: new Date().toISOString(),
      accessLevel: 'public'
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error fetching public comprehensive results:', {
      message: errorMessage,
      stack: errorStack,
      error
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper functions (same as admin version)
function getTeamRank(match: any, teamId: string): number {
  if (match.firstPlaceTeamId === teamId) return 1
  if (match.secondPlaceTeamId === teamId) return 2
  if (match.thirdPlaceTeamId === teamId) return 3
  if (match.fourthPlaceTeamId === teamId) return 4
  return 4 // Default if can't determine
}

function getVictoryPoints(rank: number): number {
  switch (rank) {
    case 1: return 3
    case 2: return 2
    case 3: return 1
    case 4: return 0
    default: return 0
  }
}

function getTeamNumber(match: any, teamId: string): number {
  if (match.team1Id === teamId) return 1
  if (match.team2Id === teamId) return 2
  if (match.team3Id === teamId) return 3
  if (match.team4Id === teamId) return 4
  return 1 // Default fallback
}