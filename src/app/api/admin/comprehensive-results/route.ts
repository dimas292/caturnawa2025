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

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competition') || 'KDBI'
    const stage = searchParams.get('stage') || 'PRELIMINARY'
    const roundNumber = parseInt(searchParams.get('round') || '1')
    const includeFrozen = searchParams.get('includeFrozen') === 'true'

    // Get the specific round
    const round = await prisma.debateRound.findFirst({
      where: {
        competition: { type: competitionType as any },
        stage: stage as any,
        roundNumber: roundNumber
      },
      include: {
        competition: true,
        matches: {
          include: {
            team1: {
              include: {
                participant: true,
                teamMembers: {
                  include: { participant: true }
                }
              }
            },
            team2: {
              include: {
                participant: true,
                teamMembers: {
                  include: { participant: true }
                }
              }
            },
            team3: {
              include: {
                participant: true,
                teamMembers: {
                  include: { participant: true }
                }
              }
            },
            team4: {
              include: {
                participant: true,
                teamMembers: {
                  include: { participant: true }
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

    // Check if round is frozen and user doesn't have permission to see frozen results
    // Note: isFrozen field needs to be added to DebateRound model
    const isFrozen = false // TODO: Implement frozen rounds feature
    if (isFrozen && !includeFrozen) {
      return NextResponse.json({ 
        error: 'Round results are frozen',
        isFrozen: true,
        message: 'This round\'s results are temporarily hidden'
      }, { status: 403 })
    }

    // Process matches data
    const roomResults = await Promise.all(
      round.matches.map(async (match) => {
        // Get judge information
        const judgeIds = [...new Set(match.scores.map(s => s.judgeId).filter(Boolean))] as string[]
        const judges = await prisma.user.findMany({
          where: { id: { in: judgeIds } }
        })

        // Process teams in this match
        const teams = []
        
        // Helper function to get team data
        const getTeamData = (team: any, position: string, bpPositions: string[]) => {
          if (!team) return null

          const teamScores = match.scores.filter(s => 
            team.teamMembers.some((tm: any) => tm.participantId === s.participantId)
          )

          const speakers = teamScores.map(score => ({
            name: score.participant.fullName,
            role: score.bpPosition || 'Unknown',
            score: score.score
          })).sort((a, b) => {
            const roleOrder = bpPositions
            return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
          })

          const teamScore = teamScores.reduce((sum, s) => sum + s.score, 0)
          
          // Determine rank based on team ranking logic
          const teamRank = getTeamRank(match, team.id)
          const victoryPoints = getVictoryPoints(teamRank)

          return {
            id: team.id,
            name: team.teamName,
            position,
            speakers,
            teamScore,
            rank: teamRank,
            victoryPoints
          }
        }

        // Process each team position
        if (match.team1) {
          const teamData = getTeamData(match.team1, 'Opening Government (OG)', ['PM', 'DPM'])
          if (teamData) teams.push(teamData)
        }
        
        if (match.team2) {
          const teamData = getTeamData(match.team2, 'Opening Opposition (OO)', ['LO', 'DLO'])
          if (teamData) teams.push(teamData)
        }
        
        if (match.team3) {
          const teamData = getTeamData(match.team3, 'Closing Government (CG)', ['MG', 'GW'])
          if (teamData) teams.push(teamData)
        }
        
        if (match.team4) {
          const teamData = getTeamData(match.team4, 'Closing Opposition (CO)', ['MO', 'OW'])
          if (teamData) teams.push(teamData)
        }

        return {
          roomNumber: match.matchNumber,
          judges: judges.map(j => ({
            id: j.id,
            name: j.name,
            role: judges.length > 1 ? 
              (judges.indexOf(j) === 0 ? 'Chief Judge' : `Panelist ${judges.indexOf(j)}`) : 
              'Judge'
          })),
          teams,
          isCompleted: match.completedAt !== null,
          completedAt: match.completedAt
        }
      })
    )

    // Calculate summary statistics
    const allTeams = roomResults.flatMap(room => room.teams)
    const allScores = allTeams.flatMap(team => team.speakers.map(s => s.score))
    
    const statistics = {
      totalRooms: roomResults.length,
      totalTeams: allTeams.length,
      averageTeamScore: allTeams.length > 0 ? 
        allTeams.reduce((sum, team) => sum + team.teamScore, 0) / allTeams.length : 0,
      scoreRange: {
        min: Math.min(...allScores.filter(s => s !== undefined)),
        max: Math.max(...allScores.filter(s => s !== undefined))
      },
      bestPerformingTeams: roomResults.map(room => {
        const bestTeam = room.teams.reduce((best: any, team) => 
          team.teamScore > (best?.teamScore || 0) ? team : best, null)
        return {
          roomNumber: room.roomNumber,
          team: bestTeam
        }
      }).filter(r => r.team !== null),
      highestIndividualScores: allTeams
        .flatMap(team => team.speakers)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5),
      victoryPointsDistribution: {
        first: allTeams.filter(t => t.rank === 1).length,
        second: allTeams.filter(t => t.rank === 2).length,
        third: allTeams.filter(t => t.rank === 3).length,
        fourth: allTeams.filter(t => t.rank === 4).length
      }
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
      statistics,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching comprehensive results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function getTeamRank(match: any, teamId: string): number {
  // Determine rank based on match results
  if (match.firstPlaceTeamId === teamId) return 1
  if (match.secondPlaceTeamId === teamId) return 2
  if (match.thirdPlaceTeamId === teamId) return 3
  if (match.fourthPlaceTeamId === teamId) return 4
  
  // If ranks not set, calculate based on team scores
  const teamScores = []
  
  if (match.team1?.id === teamId) {
    const scores = match.scores.filter((s: any) => 
      match.team1.teamMembers.some((tm: any) => tm.participantId === s.participantId)
    )
    teamScores.push({ teamId, totalScore: scores.reduce((sum: number, s: any) => sum + s.score, 0) })
  }
  
  // Similar logic for other teams...
  
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