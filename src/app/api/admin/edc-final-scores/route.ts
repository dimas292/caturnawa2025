// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DebateStage } from '@prisma/client'

// Type definitions
interface TeamMember {
  id: string
  registrationId: string
  participantId: string
  fullName: string
  role: string
  position: number
  participant: {
    id: string
    fullName: string
  }
}

interface Registration {
  id: string
  teamName: string
  teamMembers: TeamMember[]
  participant?: {
    id: string
    fullName: string
    institution: string
  }
}

interface DebateScore {
  id: string
  matchId: string
  participantId: string
  judgeId: string
  score: number
  bpPosition: string | null
  participant: {
    id: string
    fullName: string
  }
}

interface DebateMatch {
  id: string
  matchNumber: number
  team1Id: string | null
  team2Id: string | null
  team3Id: string | null
  team4Id: string | null
  team1: Registration | null
  team2: Registration | null
  team3: Registration | null
  team4: Registration | null
  scores: DebateScore[]
  round: {
    roundName: string
    motion: string | null
    stage: DebateStage
    roundNumber: number
  }
  judge: {
    name: string
    email: string
  } | null
  completedAt: Date | null
}

// Type definitions
interface TeamMember {
  id: string
  registrationId: string
  participantId: string
  fullName: string
  role: string
  position: number
  participant: {
    id: string
    fullName: string
  }
}

interface Registration {
  id: string
  teamName: string
  teamMembers: TeamMember[]
  participant?: {
    id: string
    fullName: string
    institution: string
  }
}

interface DebateScore {
  id: string
  matchId: string
  participantId: string
  judgeId: string
  score: number
  bpPosition: string | null
  participant: {
    id: string
    fullName: string
  }
}

interface DebateMatch {
  id: string
  matchNumber: number
  team1Id: string | null
  team2Id: string | null
  team3Id: string | null
  team4Id: string | null
  team1: Registration | null
  team2: Registration | null
  team3: Registration | null
  team4: Registration | null
  scores: DebateScore[]
  round: {
    roundName: string
    motion: string | null
    stage: DebateStage
    roundNumber: number
  }
  judge: {
    name: string
    email: string
  } | null
  completedAt: Date | null
}

// Helper functions
function getTeamNumber(match: DebateMatch, teamId: string | null): number {
  if (!teamId) return 1
  if (match.team1Id === teamId) return 1
  if (match.team2Id === teamId) return 2
  if (match.team3Id === teamId) return 3
  if (match.team4Id === teamId) return 4
  return 1 // Default fallback
}

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

    // Get all completed matches in FINAL stage with room grouping
    const matches = await prisma.debateMatch.findMany({
      where: {
        round: {
          competitionId: competition.id,
          stage: 'FINAL'
        },
        completedAt: { not: null }
      },
      select: {
        id: true,
        matchNumber: true,
        team1Id: true,
        team2Id: true,
        team3Id: true,
        team4Id: true,
        completedAt: true,
        round: {
          select: {
            roundName: true,
            stage: true,
            roundNumber: true,
            motion: true
          }
        },
        scores: {
          select: {
            id: true,
            matchId: true,
            participantId: true,
            judgeId: true,
            score: true,
            bpPosition: true,
            participant: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        },
        judge: {
          select: {
            name: true,
            email: true
          }
        },
        team1: {
          select: {
            id: true,
            teamName: true,
            participant: {
              select: {
                id: true,
                fullName: true,
                institution: true
              }
            },
            teamMembers: {
              select: {
                id: true,
                registrationId: true,
                participantId: true,
                fullName: true,
                role: true,
                position: true,
                participant: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        team2: {
          select: {
            id: true,
            teamName: true,
            participant: {
              select: {
                id: true,
                fullName: true,
                institution: true
              }
            },
            teamMembers: {
              select: {
                id: true,
                registrationId: true,
                participantId: true,
                fullName: true,
                role: true,
                position: true,
                participant: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        team3: {
          select: {
            id: true,
            teamName: true,
            participant: {
              select: {
                id: true,
                fullName: true,
                institution: true
              }
            },
            teamMembers: {
              select: {
                id: true,
                registrationId: true,
                participantId: true,
                fullName: true,
                role: true,
                position: true,
                participant: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        team4: {
          select: {
            id: true,
            teamName: true,
            participant: {
              select: {
                id: true,
                fullName: true,
                institution: true
              }
            },
            teamMembers: {
              select: {
                id: true,
                registrationId: true,
                participantId: true,
                fullName: true,
                role: true,
                position: true,
                participant: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        matchNumber: 'asc'
      }
    }) as unknown as DebateMatch[]

    // Group matches by room (matchNumber)
    const roomResults = matches.map((match: DebateMatch) => {
      // Process teams in this match
      const teams = [
        { id: match.team1Id, data: match.team1, position: 'Opening Government (OG)' },
        { id: match.team2Id, data: match.team2, position: 'Opening Opposition (OO)' },
        { id: match.team3Id, data: match.team3, position: 'Closing Government (CG)' },
        { id: match.team4Id, data: match.team4, position: 'Closing Opposition (CO)' }
      ].filter(t => t.id && t.data)

      // Get unique judges from all scores in this match
      const judgeIds = Array.from(new Set(match.scores.map(s => s.judgeId).filter(Boolean)))

      // Calculate team scores and get individual scores
      const teamsWithScores = teams.map(team => {
        const participants = team.data!.teamMembers
          .slice(0, 2) // Only take first 2 members (speakers)
          .map((member: TeamMember, memberIndex: number) => {
            // For teams with duplicate participantId, match by bpPosition
            const expectedBpPosition = `Team${getTeamNumber(match, team.id)}_Speaker${memberIndex + 1}`

            // Get scores for this participant from each judge
            const scoresFromJudges = judgeIds.map(judgeId => {
              // Try to find score by participantId, judgeId AND bpPosition first
              let judgeScore = match.scores.find(s =>
                s.participantId === member.participantId &&
                s.judgeId === judgeId &&
                s.bpPosition === expectedBpPosition
              )

              // Fallback: if no bpPosition match, find by participantId and judge
              if (!judgeScore) {
                const memberJudgeScores = match.scores.filter(s =>
                  s.participantId === member.participantId &&
                  s.judgeId === judgeId
                )
                if (memberJudgeScores.length > 1) {
                  // Multiple scores from same judge - use array index
                  judgeScore = memberJudgeScores[memberIndex]
                } else {
                  // Single score from this judge
                  judgeScore = memberJudgeScores[0]
                }
              }

              return judgeScore ? judgeScore.score : null
            })

            // Calculate total score (sum of all judges' scores)
            const totalScore = scoresFromJudges.reduce((sum: number, s) => sum + (s || 0), 0)

            return {
              id: member.participantId,
              name: member.fullName,
              role: member.role,
              position: member.position,
              bpPosition: expectedBpPosition,
              score: totalScore,
              judgeScores: scoresFromJudges, // Array of scores from each judge
              judgeIds: judgeIds // Array of judge IDs for reference
            }
          })

        const teamScore = participants.reduce((sum: number, p) => sum + (p.score || 0), 0)
        const averageScore = participants.length > 0 ? teamScore / participants.length : 0

        return {
          id: team.id!,
          name: team.data!.teamName || 'Unknown Team',
          institution: team.data!.participant?.institution || 'Unknown',
          position: team.position,
          participants,
          teamScore,
          averageScore,
          participantCount: participants.length,
          judgeCount: judgeIds.length
        }
      })

      // Sort teams by teamScore to assign ranks
      const sortedTeams = [...teamsWithScores].sort((a, b) => b.teamScore - a.teamScore)

      // Assign ranks and victory points
      const victoryPoints = [3, 2, 1, 0]
      const teamsWithRanks = teamsWithScores.map(team => {
        const rank = sortedTeams.findIndex(t => t.id === team.id) + 1
        return {
          ...team,
          rank,
          victoryPoints: victoryPoints[rank - 1]
        }
      })

      return {
        roomNumber: match.matchNumber,
        matchId: match.id,
        judge: match.judge,
        motion: match.round.motion,
        teams: teamsWithRanks,
        isCompleted: true,
        completedAt: match.completedAt?.toISOString() || null
      }
    })

    // Get round info from first match
    const roundInfo = matches.length > 0 ? {
      roundName: matches[0].round.roundName,
      motion: matches[0].round.motion,
      stage: matches[0].round.stage,
      roundNumber: matches[0].round.roundNumber,
      competitionName: 'EDC - English Debate Competition'
    } : null

    return NextResponse.json({
      success: true,
      round: roundInfo,
      roomResults,
      statistics: {
        totalRooms: roomResults.length,
        totalTeams: roomResults.reduce((sum: number, room) => sum + room.teams.length, 0),
        completedRooms: roomResults.length
      },
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching EDC final scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}