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

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { competitionType } = await request.json()

    if (!competitionType || !['KDBI', 'EDC'].includes(competitionType)) {
      return NextResponse.json(
        { error: 'Invalid competition type. Must be KDBI or EDC' },
        { status: 400 }
      )
    }

    // Get competition
    const competition = await prisma.competition.findUnique({
      where: { type: competitionType }
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    // Get all verified teams for this competition
    const teams = await prisma.registration.findMany({
      where: {
        competitionId: competition.id,
        status: 'VERIFIED'
      },
      include: {
        participant: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (teams.length < 4) {
      return NextResponse.json(
        { error: `Need at least 4 teams to generate tournament. Found ${teams.length} teams.` },
        { status: 400 }
      )
    }

    console.log(`Generating tournament for ${competitionType} with ${teams.length} teams`)

    const results = await prisma.$transaction(async (tx) => {
      // Clear existing tournament structure for this competition
      await tx.debateScore.deleteMany({
        where: {
          match: {
            round: {
              competitionId: competition.id
            }
          }
        }
      })
      
      await tx.debateMatch.deleteMany({
        where: {
          round: {
            competitionId: competition.id
          }
        }
      })
      
      await tx.debateRound.deleteMany({
        where: { competitionId: competition.id }
      })

      // Reset team standings
      await tx.teamStanding.deleteMany({
        where: {
          registration: {
            competitionId: competition.id
          }
        }
      })

      const createdRounds = []
      const createdMatches = []

      // 1. CREATE PRELIMINARY ROUNDS (4 rounds)
      for (let roundNum = 1; roundNum <= 4; roundNum++) {
        const round = await tx.debateRound.create({
          data: {
            competitionId: competition.id,
            stage: 'PRELIMINARY',
            roundNumber: roundNum,
            roundName: `Preliminary Round ${roundNum}`
          }
        })
        createdRounds.push(round)

        // Generate BP matches for this round (4 teams per match)
        const matches = generateBPMatches(teams, roundNum)
        
        for (let i = 0; i < matches.length; i++) {
          const match = await tx.debateMatch.create({
            data: {
              roundId: round.id,
              matchNumber: i + 1,
              matchFormat: 'BP',
              team1Id: matches[i].og.id,    // Opening Government
              team2Id: matches[i].oo.id,    // Opening Opposition
              team3Id: matches[i].cg.id,    // Closing Government
              team4Id: matches[i].co.id     // Closing Opposition
            }
          })
          createdMatches.push(match)
        }
      }

      // 2. CREATE SEMIFINAL ROUNDS (if enough teams)
      if (teams.length >= 8) {
        const semifinalRound = await tx.debateRound.create({
          data: {
            competitionId: competition.id,
            stage: 'SEMIFINAL',
            roundNumber: 1,
            roundName: 'Semifinal'
          }
        })
        createdRounds.push(semifinalRound)

        // Create 2 semifinal matches (top 8 teams, 4 per match in BP)
        // For now, we'll just use first 8 teams, later this will be based on preliminary rankings
        const topTeams = teams.slice(0, 8)
        
        for (let i = 0; i < 2; i++) {
          const match = await tx.debateMatch.create({
            data: {
              roundId: semifinalRound.id,
              matchNumber: i + 1,
              matchFormat: 'BP',
              team1Id: topTeams[i * 4].id,      // OG
              team2Id: topTeams[i * 4 + 1].id,  // OO
              team3Id: topTeams[i * 4 + 2].id,  // CG
              team4Id: topTeams[i * 4 + 3].id   // CO
            }
          })
          createdMatches.push(match)
        }
      }

      // 3. CREATE FINAL ROUNDS (if enough teams)
      if (teams.length >= 4) {
        const finalRound = await tx.debateRound.create({
          data: {
            competitionId: competition.id,
            stage: 'FINAL',
            roundNumber: 1,
            roundName: 'Grand Final'
          }
        })
        createdRounds.push(finalRound)

        // Create 1 final match (top 4 teams in BP format)
        const topTeams = teams.slice(0, 4)
        
        const match = await tx.debateMatch.create({
          data: {
            roundId: finalRound.id,
            matchNumber: 1,
            matchFormat: 'BP',
            team1Id: topTeams[0].id,    // OG
            team2Id: topTeams[1].id,    // OO
            team3Id: topTeams[2].id,    // CG
            team4Id: topTeams[3].id     // CO
          }
        })
        createdMatches.push(match)
      }

      // Initialize BP team standings
      for (const team of teams) {
        await tx.teamStanding.create({
          data: {
            registrationId: team.id,
            teamPoints: 0,
            speakerPoints: 0,
            averageSpeakerPoints: 0,
            matchesPlayed: 0,
            firstPlaces: 0,
            secondPlaces: 0,
            thirdPlaces: 0,
            fourthPlaces: 0,
            avgPosition: 0
          }
        })
      }

      return { createdRounds, createdMatches }
    })

    console.log(`Successfully generated tournament for ${competitionType}:`)
    console.log(`- ${results.createdRounds.length} rounds created`)
    console.log(`- ${results.createdMatches.length} matches created`)
    console.log(`- ${teams.length} teams initialized`)

    return NextResponse.json({
      success: true,
      message: `Tournament generated successfully for ${competitionType}`,
      data: {
        competition: {
          id: competition.id,
          name: competition.name,
          type: competition.type
        },
        teamsCount: teams.length,
        roundsCreated: results.createdRounds.length,
        matchesCreated: results.createdMatches.length,
        rounds: results.createdRounds.map(r => ({
          id: r.id,
          stage: r.stage,
          roundName: r.roundName
        }))
      }
    })

  } catch (error) {
    console.error('Error generating tournament:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate tournament',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to generate British Parliamentary matches (4 teams per match)
function generateBPMatches(teams: any[], roundNumber: number) {
  const matches = []
  const shuffledTeams = [...teams]
  
  // For round 1, shuffle randomly
  if (roundNumber === 1) {
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]]
    }
  }
  // For later rounds, would normally sort by team points/speaker points, but for initial setup just use order

  // Group teams into matches of 4 (BP format)
  for (let i = 0; i < shuffledTeams.length; i += 4) {
    if (i + 3 < shuffledTeams.length) {
      matches.push({
        og: shuffledTeams[i],       // Opening Government
        oo: shuffledTeams[i + 1],   // Opening Opposition  
        cg: shuffledTeams[i + 2],   // Closing Government
        co: shuffledTeams[i + 3]    // Closing Opposition
      })
    }
  }

  return matches
}

// GET method to check current tournament status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competitionType')

    if (!competitionType || !['KDBI', 'EDC'].includes(competitionType)) {
      return NextResponse.json(
        { error: 'Invalid competition type. Must be KDBI or EDC' },
        { status: 400 }
      )
    }

    const competition = await prisma.competition.findUnique({
      where: { type: competitionType as any },
      include: {
        rounds: {
          include: {
            matches: {
              include: {
                team1: {
                  select: {
                    id: true,
                    teamName: true,
                    participant: {
                      select: { fullName: true }
                    }
                  }
                },
                team2: {
                  select: {
                    id: true,
                    teamName: true,
                    participant: {
                      select: { fullName: true }
                    }
                  }
                },
                _count: {
                  select: { scores: true }
                }
              }
            }
          }
        },
        registrations: {
          where: { status: 'VERIFIED' },
          select: {
            id: true,
            teamName: true,
            participant: {
              select: { fullName: true }
            }
          }
        }
      }
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    const stats = {
      totalTeams: competition.registrations.length,
      totalRounds: competition.rounds.length,
      totalMatches: competition.rounds.reduce((sum, round) => sum + round.matches.length, 0),
      completedMatches: competition.rounds.reduce((sum, round) => 
        sum + round.matches.filter(match => match._count.scores > 0).length, 0
      ),
      byStage: competition.rounds.reduce((acc, round) => {
        if (!acc[round.stage]) acc[round.stage] = 0
        acc[round.stage] += round.matches.length
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      data: {
        competition,
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching tournament status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch tournament status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}