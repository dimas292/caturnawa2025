import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get EDC competition
    const competition = await prisma.competition.findUnique({
      where: {
        type: 'EDC'
      }
    })

    if (!competition) {
      return NextResponse.json({ error: 'EDC competition not found' }, { status: 404 })
    }

    // Calculate leaderboard from completed matches in FINAL stage
    const completedMatches = await prisma.debateMatch.findMany({
      where: {
        round: {
          competitionId: competition.id,
          stage: 'FINAL'
        },
        completedAt: { not: null }
      },
      include: {
        scores: true,
        team1: {
          include: {
            teamMembers: {
              select: {
                participantId: true,
                fullName: true,
                role: true
              }
            },
            participant: {
              select: {
                fullName: true,
                institution: true,
                email: true
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
                role: true
              }
            },
            participant: {
              select: {
                fullName: true,
                institution: true,
                email: true
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
                role: true
              }
            },
            participant: {
              select: {
                fullName: true,
                institution: true,
                email: true
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
                role: true
              }
            },
            participant: {
              select: {
                fullName: true,
                institution: true,
                email: true
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
            institution: team.data!.participant?.institution || 'Unknown',
            email: team.data!.participant?.email || '',
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
    const standings = Object.values(teamStandings).map((standing: any) => {
      const averageSpeakerPoints = standing.matchesPlayed > 0
        ? standing.speakerPoints / standing.matchesPlayed / 2 // Divide by 2 for average per speaker
        : 0
      
      return {
        ...standing,
        averageSpeakerPoints,
        avgPosition: standing.matchesPlayed > 0 
          ? ((standing.firstPlaces * 1) + (standing.secondPlaces * 2) + (standing.thirdPlaces * 3) + (standing.fourthPlaces * 4)) / standing.matchesPlayed
          : 0
      }
    })

    // Sort by BP tiebreaker rules
    standings.sort((a: any, b: any) => {
      if (b.teamPoints !== a.teamPoints) return b.teamPoints - a.teamPoints
      if (b.speakerPoints !== a.speakerPoints) return b.speakerPoints - a.speakerPoints
      return a.avgPosition - b.avgPosition
    })

    // Transform data for table
    const tableData = standings.map((standing: any, index: number) => ({
      rank: index + 1,
      id: standing.teamId,
      teamName: standing.teamName,
      institution: standing.institution,
      email: standing.email,
      members: standing.members.map((m: any) => m.fullName),
      matchesPlayed: standing.matchesPlayed,
      teamPoints: standing.teamPoints,
      speakerPoints: Math.round(standing.speakerPoints * 100) / 100,
      avgPosition: Math.round(standing.avgPosition * 100) / 100,
      firstPlaces: standing.firstPlaces,
      secondPlaces: standing.secondPlaces,
      thirdPlaces: standing.thirdPlaces,
      fourthPlaces: standing.fourthPlaces
    }))

    return NextResponse.json({
      success: true,
      data: tableData,
      total: tableData.length
    })

  } catch (error) {
    console.error('Error fetching EDC final scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
