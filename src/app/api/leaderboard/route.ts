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

    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competition') || 'KDBI'
    const stage = searchParams.get('stage') // optional filter by stage

    // Get all team standings with registration and participant data
    const standings = await prisma.teamStanding.findMany({
      include: {
        registration: {
          include: {
            participant: {
              select: {
                id: true,
                fullName: true,
                institution: true
              }
            },
            competition: {
              select: {
                id: true,
                name: true,
                type: true
              }
            },
            teamMembers: {
              include: {
                participant: {
                  select: {
                    id: true,
                    fullName: true
                  }
                },
              },
              orderBy: { position: 'asc' }
            }
          }
        }
      },
      where: {
        registration: {
          competition: {
            type: competitionType
          }
        }
      }
    })

    // Apply British Parliamentary tie-breaker logic:
    // 1. Total Team Points (Victory Points) - PRIMARY
    // 2. Total Speaker Points - TIE-BREAKER
    // 3. Average Speaker Points - SECONDARY TIE-BREAKER
    // 4. Number of 1st places - TERTIARY TIE-BREAKER
    const sortedStandings = standings
      .sort((a, b) => {
        // Primary: Total Team Points (higher is better)
        if (b.teamPoints !== a.teamPoints) {
          return b.teamPoints - a.teamPoints
        }
        
        // Tie-breaker: Total Speaker Points (higher is better)
        if (b.speakerPoints !== a.speakerPoints) {
          return b.speakerPoints - a.speakerPoints
        }
        
        // Secondary tie-breaker: Average Speaker Points (higher is better)
        if (b.averageSpeakerPoints !== a.averageSpeakerPoints) {
          return b.averageSpeakerPoints - a.averageSpeakerPoints
        }
        
        // Tertiary tie-breaker: Number of 1st places (higher is better)
        if (b.firstPlaces !== a.firstPlaces) {
          return b.firstPlaces - a.firstPlaces
        }
        
        // Final tie-breaker: Number of 2nd places
        return b.secondPlaces - a.secondPlaces
      })
      .map((standing, index) => ({
        rank: index + 1,
        teamId: standing.registration.id,
        teamName: standing.registration.teamName,
        leader: {
          name: standing.registration.participant?.fullName || 'Unknown',
          institution: standing.registration.participant?.institution || 'Unknown'
        },
        members: standing.registration.teamMembers.map(tm => ({
          id: tm.participant?.id,
          name: tm.participant?.fullName || 'Unknown Member',
          position: tm.position
        })),
        
        // BP Scoring Statistics
        teamPoints: standing.teamPoints,
        speakerPoints: standing.speakerPoints,
        averageSpeakerPoints: standing.averageSpeakerPoints,
        matchesPlayed: standing.matchesPlayed,
        
        // Position breakdown
        placements: {
          first: standing.firstPlaces,
          second: standing.secondPlaces, 
          third: standing.thirdPlaces,
          fourth: standing.fourthPlaces
        },
        
        // Competition info
        competition: standing.registration.competition
      }))

    // Calculate statistics
    const stats = {
      totalTeams: sortedStandings.length,
      averageTeamPoints: sortedStandings.length > 0 
        ? sortedStandings.reduce((sum, s) => sum + s.teamPoints, 0) / sortedStandings.length 
        : 0,
      averageSpeakerPoints: sortedStandings.length > 0
        ? sortedStandings.reduce((sum, s) => sum + s.averageSpeakerPoints, 0) / sortedStandings.length
        : 0,
      totalMatches: sortedStandings.length > 0
        ? Math.max(...sortedStandings.map(s => s.matchesPlayed))
        : 0
    }

    return NextResponse.json({
      success: true,
      data: {
        standings: sortedStandings,
        stats,
        tieBreaker: {
          primary: "Team Points (Victory Points)",
          secondary: "Total Speaker Points", 
          tertiary: "Average Speaker Points",
          quaternary: "Number of 1st Places"
        },
        filters: {
          competition: competitionType,
          stage: stage || 'all'
        }
      }
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}