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
            motion: true,
            stage: true,
            roundNumber: true
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
    })

    // Group matches by room (matchNumber)
    const roomResults = completedMatches.map((match) => {
      const teams = [
        { id: match.team1Id, data: match.team1, participantIds: match.team1?.teamMembers.map(tm => tm.participantId) || [], position: 'Opening Government (OG)' },
        { id: match.team2Id, data: match.team2, participantIds: match.team2?.teamMembers.map(tm => tm.participantId) || [], position: 'Opening Opposition (OO)' },
        { id: match.team3Id, data: match.team3, participantIds: match.team3?.teamMembers.map(tm => tm.participantId) || [], position: 'Closing Government (CG)' },
        { id: match.team4Id, data: match.team4, participantIds: match.team4?.teamMembers.map(tm => tm.participantId) || [], position: 'Closing Opposition (CO)' }
      ].filter(t => t.id && t.data)

      // Get unique judges from all scores in this match
      const judgeIds = Array.from(new Set(match.scores.map(s => s.judgeId).filter(Boolean)))
      
      // Calculate team scores and get individual scores
      const teamsWithScores = teams.map(team => {
        const participants = team.data!.teamMembers.map(member => {
          // Get scores from all judges for this participant
          const scoresFromJudges = judgeIds.map(judgeId => {
            const score = match.scores.find(s => 
              s.participantId === member.participantId && s.judgeId === judgeId
            )
            return score ? score.score : null
          })
          
          // Calculate total score (sum of all judges' scores)
          const totalScore = scoresFromJudges.reduce((sum: number, s) => sum + (s || 0), 0)
          
          return {
            id: member.participantId,
            name: member.fullName,
            role: member.role,
            score: totalScore,
            judgeScores: scoresFromJudges, // Array of scores from each judge
            judgeIds: judgeIds // Array of judge IDs for reference
          }
        })

        const teamScore = participants.reduce((sum, p) => sum + (p.score || 0), 0)
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
      competitionName: 'EDC - English Debate Competition'
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
    console.error('Error fetching EDC final scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
