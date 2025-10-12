import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competition') || 'KDBI'
    const stage = searchParams.get('stage') || 'PRELIMINARY'
    const includeFrozen = searchParams.get('includeFrozen') === 'true' // Admin can see frozen rounds

    // Get frozen rounds for this competition
    const frozenRounds = await prisma.debateRound.findMany({
      where: {
        competition: { type: competitionType as any },
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

    // Get all team standings for the competition with optimized query
    const standings = await prisma.teamStanding.findMany({
      where: {
        registration: {
          competition: { type: competitionType as any },
          status: 'VERIFIED' // Only show verified teams
        }
      },
      select: {
        teamPoints: true,
        speakerPoints: true,
        averageSpeakerPoints: true,
        matchesPlayed: true,
        firstPlaces: true,
        secondPlaces: true,
        thirdPlaces: true,
        fourthPlaces: true,
        avgPosition: true,
        updatedAt: true,
        registration: {
          select: {
            id: true,
            teamName: true,
            participant: {
              select: {
                institution: true
              }
            },
            teamMembers: {
              select: {
                role: true,
                position: true,
                participant: {
                  select: {
                    fullName: true
                  }
                }
              },
              orderBy: { position: 'asc' }
            },
            competition: {
              select: {
                shortName: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { teamPoints: 'desc' },
        { speakerPoints: 'desc' }, // Total speaker points for tiebreaker
        { averageSpeakerPoints: 'desc' }, // Average per speaker as secondary tiebreaker
        { avgPosition: 'asc' } // Best average position as final tiebreaker
      ]
    })

    // Format frozen rounds info
    const frozenRoundsList = frozenRounds.map(r => 
      `${r.stage}_R${r.roundNumber}_S${r.session}`
    )
    
    // Optimize: Build leaderboard directly from standings without additional queries
    // Since the TeamStanding table already contains calculated statistics
    const leaderboard = standings.map((standing, index) => {
        return {
          rank: index + 1,
          teamId: standing.registration.id,
          teamName: standing.registration.teamName,
          institution: standing.registration.participant.institution,
          
          // Points and statistics (use pre-calculated values from TeamStanding)
          teamPoints: standing.teamPoints,
          speakerPoints: standing.speakerPoints,
          averageSpeakerPoints: standing.matchesPlayed > 0 ? 
            standing.speakerPoints / standing.matchesPlayed : 0, // Average team total per round (BP tiebreaker)
          matchesPlayed: standing.matchesPlayed,
          
          // Position breakdown
          firstPlaces: standing.firstPlaces,
          secondPlaces: standing.secondPlaces,
          thirdPlaces: standing.thirdPlaces,
          fourthPlaces: standing.fourthPlaces,
          avgPosition: standing.avgPosition,
          
          // Team members info
          members: standing.registration.teamMembers.map(member => ({
            name: member.participant.fullName,
            role: member.role,
            position: member.position
          })),
          
          // Competition info
          competition: standing.registration.competition.shortName,
          
          // Progress indicators
          trend: index < standings.length / 3 ? 'up' : 
                 index > standings.length * 2 / 3 ? 'down' : 'stable',
          
          // Additional metadata
          lastUpdated: standing.updatedAt
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