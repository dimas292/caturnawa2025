// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get KDBI competition
    const competition = await prisma.competition.findUnique({
      where: {
        type: 'KDBI'
      }
    })

    if (!competition) {
      return NextResponse.json({ error: 'KDBI competition not found' }, { status: 404 })
    }

    // Get all completed matches in FINAL stage with room grouping
    const completedMatches = await prisma.debateMatch.findMany({
      where: {
        round: {
          competitionId: competition.id,
          stage: 'FINAL'
        },
        completedAt: { not: null }
      },
      include: {
        round: {
          select: {
            roundName: true,
            stage: true,
            roundNumber: true,
            motion: true
          }
        },
        scores: {
          include: {
            participant: {
              select: {
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
          include: {
            teamMembers: {
              select: {
                participantId: true,
                fullName: true,
                role: true
              },
              orderBy: {
                position: 'asc'
              }
            },
            participant: {
              select: {
                fullName: true,
                institution: true
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
              },
              orderBy: {
                position: 'asc'
              }
            },
            participant: {
              select: {
                fullName: true,
                institution: true
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
              },
              orderBy: {
                position: 'asc'
              }
            },
            participant: {
              select: {
                fullName: true,
                institution: true
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
              },
              orderBy: {
                position: 'asc'
              }
            },
            participant: {
              select: {
                fullName: true,
                institution: true
              }
            }
          }
        }
      },
      orderBy: {
        matchNumber: 'asc'
      }
    }) as any[]

    // Group matches by room (matchNumber)
    const roomResults = completedMatches.map((match: any) => {
      const teams = [
        { id: match.team1Id, data: match.team1, participantIds: (match.team1?.teamMembers || []).map((tm: any) => tm.participantId) || [], position: 'Opening Government (OG)' },
        { id: match.team2Id, data: match.team2, participantIds: (match.team2?.teamMembers || []).map((tm: any) => tm.participantId) || [], position: 'Opening Opposition (OO)' },
        { id: match.team3Id, data: match.team3, participantIds: (match.team3?.teamMembers || []).map((tm: any) => tm.participantId) || [], position: 'Closing Government (CG)' },
        { id: match.team4Id, data: match.team4, participantIds: (match.team4?.teamMembers || []).map((tm: any) => tm.participantId) || [], position: 'Closing Opposition (CO)' }
      ].filter((t: any) => t.id && t.data)

      // Get unique judges from all scores in this match
      const judgeIds = Array.from(new Set(match.scores.map((s: any) => s.judgeId).filter(Boolean)))

      // Calculate team scores and get individual scores
      const teamsWithScores = teams.map((team: any) => {
        const participants = (team.data!.teamMembers || [])
          .slice(0, 2) // Only take first 2 members (speakers)
          .map((member: any, memberIndex: number) => {
            // For teams with duplicate participantId, match by bpPosition
            const expectedBpPosition = `Team${getTeamNumber(match, team.id)}_Speaker${memberIndex + 1}`

            // Get scores from all judges for this participant
            const scoresFromJudges = judgeIds.map((judgeId: any) => {
              // Try to find score by participantId, judgeId AND bpPosition first
              let judgeScore = match.scores.find((s: any) =>
                s.participantId === member.participantId && s.judgeId === judgeId && s.bpPosition === expectedBpPosition
              )

              // Fallback: if no bpPosition match, find by participantId and judge
              if (!judgeScore) {
                const memberJudgeScores = match.scores.filter((s: any) =>
                  s.participantId === member.participantId && s.judgeId === judgeId
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
            const totalScore = scoresFromJudges.reduce((sum: number, s: any) => sum + (s || 0), 0)

            return {
              id: member.participantId,
              name: member.fullName,
              role: member.role,
              position: member.position,
              score: totalScore,
              judgeScores: scoresFromJudges, // Array of scores from each judge
              judgeIds: judgeIds // Array of judge IDs for reference
            }
          })

        const teamScore = participants.reduce((sum: number, p: any) => sum + (p.score || 0), 0)
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
    const roundInfo = completedMatches.length > 0 ? {
      roundName: completedMatches[0].round.roundName,
      motion: completedMatches[0].round.motion,
      stage: completedMatches[0].round.stage,
      roundNumber: completedMatches[0].round.roundNumber,
      competitionName: 'KDBI - Kompetisi Debat Bahasa Indonesia'
    } : null

    return NextResponse.json({
      success: true,
      round: roundInfo,
      roomResults,
      statistics: {
        totalRooms: roomResults.length,
        totalTeams: roomResults.reduce((sum, room) => sum + room.teams.length, 0),
        completedRooms: roomResults.length
      },
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching KDBI final scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function getTeamNumber(match: any, teamId: string | null): number {
  if (!teamId) return 1
  if (match.team1Id === teamId) return 1
  if (match.team2Id === teamId) return 2
  if (match.team3Id === teamId) return 3
  if (match.team4Id === teamId) return 4
  return 1
}
