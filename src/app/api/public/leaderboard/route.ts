import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competition') || 'KDBI'
    const stage = searchParams.get('stage') || 'PRELIMINARY'
    const includeFrozen = searchParams.get('includeFrozen') === 'true' // Admin can see frozen rounds

    // Get frozen rounds for this competition and stage
    const frozenRounds = await prisma.debateRound.findMany({
      where: {
        competition: { type: competitionType as any },
        stage: stage as any,
        isFrozen: true
      },
      select: {
        id: true,
        roundName: true,
        stage: true,
        roundNumber: true,
        session: true
      }
    })

    // Calculate leaderboard from completed matches in the selected stage
    // This gives us per-stage leaderboard instead of cumulative
    const completedMatches = await prisma.debateMatch.findMany({
      where: {
        round: {
          competition: { type: competitionType as any },
          stage: stage as any,
          ...(includeFrozen ? {} : { isFrozen: false })
        },
        completedAt: { not: null }
      },
      include: {
        round: {
          include: {
            competition: true
          }
        },
        scores: true,
        team1: {
          include: {
            teamMembers: {
              select: {
                participantId: true
              }
            },
            participant: {
              select: {
                institution: true
              }
            }
          }
        },
        team2: {
          include: {
            teamMembers: {
              select: {
                participantId: true
              }
            },
            participant: {
              select: {
                institution: true
              }
            }
          }
        },
        team3: {
          include: {
            teamMembers: {
              select: {
                participantId: true
              }
            },
            participant: {
              select: {
                institution: true
              }
            }
          }
        },
        team4: {
          include: {
            teamMembers: {
              select: {
                participantId: true
              }
            },
            participant: {
              select: {
                institution: true
              }
            }
          }
        }
      }
    })

    // Build standings from matches
    const teamStandings: Record<string, any> = {}

    for (const match of completedMatches) {
      const teams = [
        { id: match.team1Id, data: match.team1, participantIds: match.team1?.teamMembers.map(tm => tm.participantId) || [] },
        { id: match.team2Id, data: match.team2, participantIds: match.team2?.teamMembers.map(tm => tm.participantId) || [] },
        { id: match.team3Id, data: match.team3, participantIds: match.team3?.teamMembers.map(tm => tm.participantId) || [] },
        { id: match.team4Id, data: match.team4, participantIds: match.team4?.teamMembers.map(tm => tm.participantId) || [] }
      ].filter(t => t.id && t.data)

      // Calculate team scores
      const teamScores = teams.map(team => ({
        ...team,
        total: match.scores
          .filter(s => team.participantIds.includes(s.participantId))
          .reduce((sum, s) => sum + s.score, 0)
      })).sort((a, b) => b.total - a.total)

      // Assign victory points: 1st=3, 2nd=2, 3rd=1, 4th=0
      const victoryPoints = [3, 2, 1, 0]

      teamScores.forEach((team, index) => {
        if (!teamStandings[team.id!]) {
          teamStandings[team.id!] = {
            teamId: team.id,
            teamName: team.data!.teamName,
            institution: team.data!.participant.institution,
            teamPoints: 0,
            speakerPoints: 0,
            matchesPlayed: 0,
            firstPlaces: 0,
            secondPlaces: 0,
            thirdPlaces: 0,
            fourthPlaces: 0,
            members: team.data!.teamMembers || []
          }
        }

        const standing = teamStandings[team.id!]
        standing.matchesPlayed++
        standing.teamPoints += victoryPoints[index]
        standing.speakerPoints += team.total

        if (index === 0) standing.firstPlaces++
        else if (index === 1) standing.secondPlaces++
        else if (index === 2) standing.thirdPlaces++
        else if (index === 3) standing.fourthPlaces++
      })
    }

    // Convert to array and calculate averages
    const standings = Object.values(teamStandings).map((standing: any) => ({
      ...standing,
      averageSpeakerPoints: standing.matchesPlayed > 0 ? standing.speakerPoints / standing.matchesPlayed : 0,
      avgPosition: standing.matchesPlayed > 0 
        ? ((standing.firstPlaces * 1) + (standing.secondPlaces * 2) + (standing.thirdPlaces * 3) + (standing.fourthPlaces * 4)) / standing.matchesPlayed
        : 0
    }))

    // Sort by BP tiebreaker rules
    standings.sort((a: any, b: any) => {
      if (b.teamPoints !== a.teamPoints) return b.teamPoints - a.teamPoints
      if (b.speakerPoints !== a.speakerPoints) return b.speakerPoints - a.speakerPoints
      if (b.averageSpeakerPoints !== a.averageSpeakerPoints) return b.averageSpeakerPoints - a.averageSpeakerPoints
      return a.avgPosition - b.avgPosition
    })

    // Format frozen rounds info
    const frozenRoundsList = frozenRounds.map(r => 
      `${r.stage}_R${r.roundNumber}_S${r.session}`
    )
    
    // Build leaderboard from calculated standings
    const leaderboard = standings.map((standing: any, index: number) => {
        return {
          rank: index + 1,
          teamId: standing.teamId,
          teamName: standing.teamName,
          institution: standing.institution,
          
          // Points and statistics
          teamPoints: standing.teamPoints,
          speakerPoints: standing.speakerPoints,
          averageSpeakerPoints: standing.averageSpeakerPoints,
          matchesPlayed: standing.matchesPlayed,
          
          // Position breakdown
          firstPlaces: standing.firstPlaces,
          secondPlaces: standing.secondPlaces,
          thirdPlaces: standing.thirdPlaces,
          fourthPlaces: standing.fourthPlaces,
          avgPosition: standing.avgPosition,
          
          // Team members info
          members: standing.members.map((member: any) => ({
            name: member.fullName || member.participant?.fullName || 'Unknown',
            role: member.role,
            position: member.position
          })),
          
          // Competition info
          competition: competitionType,
          
          // Progress indicators
          trend: index < standings.length / 3 ? 'up' : 
                 index > standings.length * 2 / 3 ? 'down' : 'stable',
          
          // Additional metadata
          lastUpdated: new Date().toISOString()
        }
    })

    // Calculate tournament statistics
    const tournamentStats = {
      totalTeams: leaderboard.length,
      totalMatches: leaderboard.reduce((sum, team) => sum + team.matchesPlayed, 0) / 4, // 4 teams per match
      averageTeamPoints: leaderboard.length > 0 ? 
        leaderboard.reduce((sum, team) => sum + team.teamPoints, 0) / leaderboard.length : 0,
      averageSpeakerPoints: leaderboard.length > 0 ? 
        leaderboard.reduce((sum, team) => sum + team.averageSpeakerPoints, 0) / leaderboard.length : 0,
      
      // Frozen rounds info
      frozenRoundsInfo: frozenRounds.length > 0 ? {
        count: frozenRounds.length,
        rounds: frozenRoundsList,
        details: frozenRounds.map(r => ({
          roundName: r.roundName,
          stage: r.stage,
          roundNumber: r.roundNumber,
          session: r.session
        })),
        message: includeFrozen 
          ? `Showing all rounds (including ${frozenRounds.length} frozen round(s))`
          : `${frozenRounds.length} round(s) are currently frozen and not included in rankings`
      } : null,
      
      // Top performers
      topPerformers: {
        highestTeamPoints: leaderboard[0] || null,
        highestSpeakerAverage: [...leaderboard]
          .sort((a, b) => b.averageSpeakerPoints - a.averageSpeakerPoints)[0] || null,
        mostConsistent: [...leaderboard]
          .sort((a, b) => a.avgPosition - b.avgPosition)[0] || null
      }
    }

    const response = NextResponse.json({
      competition: {
        type: competitionType,
        name: competitionType === 'KDBI' ? 'Kompetisi Debate Bahasa Indonesia' : 
              competitionType === 'EDC' ? 'English Debate Competition' : competitionType
      },
      leaderboard,
      statistics: tournamentStats,
      frozenRoundsActive: frozenRounds.length > 0,
      generatedAt: new Date().toISOString(),
      accessLevel: 'public',
      dataCount: leaderboard.length,
      refreshInterval: 30 // seconds
    })

    // Set cache headers for realtime data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')

    return response

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}