// src/scripts/judge-scoring-system.ts
import { prisma } from '@/lib/prisma'

export interface BPScores {
  team1: {
    speaker1: number
    speaker2: number
    teamScore: number
  }
  team2: {
    speaker1: number
    speaker2: number
    teamScore: number
  }
  team3: {
    speaker1: number
    speaker2: number
    teamScore: number
  }
  team4: {
    speaker1: number
    speaker2: number
    teamScore: number
  }
  ranking: number[] // [1st place team index, 2nd place, 3rd place, 4th place]
}

export async function submitJudgeScores(matchId: string, judgeId: string, scores: BPScores) {
  try {
    // Get the match details
    const match = await prisma.debateMatch.findUnique({
      where: { id: matchId },
      include: {
        team1: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team2: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team3: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team4: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        round: true
      }
    })

    if (!match) {
      throw new Error('Match not found')
    }

    // Create individual DebateScore records for each speaker
    const teams = [match.team1, match.team2, match.team3, match.team4].filter(Boolean)
    const positions = ['OG', 'OO', 'CG', 'CO']
    const bpPositions = [
      ['PM', 'DPM'],
      ['LO', 'DLO'], 
      ['MG', 'GW'],
      ['MO', 'OW']
    ]

    // Use transaction to ensure atomic delete + create
    await prisma.$transaction(async (tx) => {
      // Delete all existing scores for this match
      // Safe because 1 match = 1 judge (judgeId in DebateMatch)
      await tx.debateScore.deleteMany({
        where: {
          matchId: matchId
        }
      })

      // Prepare all scores to create
      const scoresToCreate = []
      for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
        const team = teams[teamIndex]
        if (!team) continue

        const teamScore = scores[`team${teamIndex + 1}` as keyof typeof scores] as any
        const teamMembers = team.teamMembers || []

        for (let speakerIndex = 0; speakerIndex < Math.min(2, teamMembers.length); speakerIndex++) {
          const member = teamMembers[speakerIndex]
          const speakerScore = teamScore[`speaker${speakerIndex + 1}`]

          scoresToCreate.push({
            matchId: matchId,
            participantId: member.participantId,
            score: speakerScore,
            judgeId: judgeId,
            bpPosition: bpPositions[teamIndex][speakerIndex],
            teamPosition: positions[teamIndex],
            speakerRank: scores.ranking.indexOf(teamIndex) + 1
          })
        }
      }

      // Create all scores in one operation
      if (scoresToCreate.length > 0) {
        await tx.debateScore.createMany({
          data: scoresToCreate
        })
      }

      // Update match completion
      await tx.debateMatch.update({
        where: { id: matchId },
        data: {
          completedAt: new Date(),
          firstPlaceTeamId: teams[scores.ranking[0]]?.id,
          secondPlaceTeamId: teams[scores.ranking[1]]?.id,
          thirdPlaceTeamId: teams[scores.ranking[2]]?.id,
          fourthPlaceTeamId: teams[scores.ranking[3]]?.id
        }
      })
    })

    return { success: true, message: 'Scores submitted successfully' }

  } catch (error) {
    console.error('Error submitting judge scores:', error)
    throw error
  }
}

export async function getJudgeMatches(judgeId: string, stage?: string, roundNumber?: number) {
  try {
    const whereClause: any = {
      round: {
        competition: { type: 'KDBI' }
      }
    }

    if (stage) {
      whereClause.round.stage = stage
    }

    if (roundNumber) {
      whereClause.round.roundNumber = roundNumber
    }

    const matches = await prisma.debateMatch.findMany({
      where: whereClause,
      include: {
        round: {
          include: {
            competition: true
          }
        },
        team1: {
          include: {
            participant: true,
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team2: {
          include: {
            participant: true,
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team3: {
          include: {
            participant: true,
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team4: {
          include: {
            participant: true,
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
      },
      orderBy: {
        matchNumber: 'asc'
      }
    })

    return matches

  } catch (error) {
    console.error('Error fetching judge matches:', error)
    throw error
  }
}
