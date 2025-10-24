/**
 * Recalculate KDBI Team Standings from SEMIFINAL
 * 
 * This script recalculates KDBI team standings by processing all completed
 * matches from SEMIFINAL and FINAL stages only (excluding PRELIMINARY).
 * 
 * Run this after resetting KDBI standings to rebuild the leaderboard correctly.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function recalculateKDBIStandings() {
  try {
    console.log('🔄 Starting KDBI standings recalculation from SEMIFINAL...\n')

    // First, reset all KDBI standings
    console.log('📊 Step 1: Resetting KDBI standings...')
    const kdbiRegistrations = await prisma.registration.findMany({
      where: {
        competition: { type: 'KDBI' },
        status: 'VERIFIED'
      },
      select: { id: true, teamName: true }
    })

    for (const reg of kdbiRegistrations) {
      await prisma.teamStanding.upsert({
        where: { registrationId: reg.id },
        update: {
          matchesPlayed: 0,
          teamPoints: 0,
          speakerPoints: 0,
          averageSpeakerPoints: 0,
          firstPlaces: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
          fourthPlaces: 0,
          avgPosition: 0
        },
        create: {
          registrationId: reg.id,
          matchesPlayed: 0,
          teamPoints: 0,
          speakerPoints: 0,
          averageSpeakerPoints: 0,
          firstPlaces: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
          fourthPlaces: 0,
          avgPosition: 0
        }
      })
    }
    console.log(`✓ Reset ${kdbiRegistrations.length} KDBI teams\n`)

    // Get all completed KDBI matches from SEMIFINAL and FINAL
    console.log('📊 Step 2: Finding completed KDBI SEMIFINAL/FINAL matches...')
    const completedMatches = await prisma.debateMatch.findMany({
      where: {
        round: {
          competition: { type: 'KDBI' },
          stage: { in: ['SEMIFINAL', 'FINAL'] }
        },
        completedAt: { not: null }
      },
      include: {
        round: {
          include: {
            competition: true
          }
        },
        scores: {
          include: {
            participant: true
          }
        },
        team1: {
          include: {
            teamMembers: {
              select: {
                participantId: true
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
            }
          }
        },
        team3: {
          include: {
            teamMembers: {
              select: {
                participantId: true
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
            }
          }
        }
      },
      orderBy: {
        completedAt: 'asc'
      }
    })

    console.log(`✓ Found ${completedMatches.length} completed matches\n`)

    if (completedMatches.length === 0) {
      console.log('⚠️  No completed SEMIFINAL/FINAL matches found for KDBI')
      console.log('   Standings remain at zero until matches are completed\n')
      return
    }

    // Process each match
    console.log('📊 Step 3: Recalculating standings from matches...\n')
    let processedCount = 0

    for (const match of completedMatches) {
      console.log(`Processing Match #${match.matchNumber} (${match.round.stage} - ${match.round.roundName})`)

      // Get participant IDs for each team
      const team1ParticipantIds = match.team1?.teamMembers.map(tm => tm.participantId) || []
      const team2ParticipantIds = match.team2?.teamMembers.map(tm => tm.participantId) || []
      const team3ParticipantIds = match.team3?.teamMembers.map(tm => tm.participantId) || []
      const team4ParticipantIds = match.team4?.teamMembers.map(tm => tm.participantId) || []

      // Calculate team scores
      const team1Scores = match.scores.filter(s => team1ParticipantIds.includes(s.participantId))
      const team2Scores = match.scores.filter(s => team2ParticipantIds.includes(s.participantId))
      const team3Scores = match.scores.filter(s => team3ParticipantIds.includes(s.participantId))
      const team4Scores = match.scores.filter(s => team4ParticipantIds.includes(s.participantId))

      const team1Total = team1Scores.reduce((sum, s) => sum + s.score, 0)
      const team2Total = team2Scores.reduce((sum, s) => sum + s.score, 0)
      const team3Total = team3Scores.reduce((sum, s) => sum + s.score, 0)
      const team4Total = team4Scores.reduce((sum, s) => sum + s.score, 0)

      // Create rankings
      const teamRankings = [
        { teamId: match.team1Id, total: team1Total, name: match.team1?.teamName },
        { teamId: match.team2Id, total: team2Total, name: match.team2?.teamName },
        { teamId: match.team3Id, total: team3Total, name: match.team3?.teamName },
        { teamId: match.team4Id, total: team4Total, name: match.team4?.teamName }
      ]
        .filter(t => t.teamId)
        .sort((a, b) => b.total - a.total)

      // Victory points: 1st=3, 2nd=2, 3rd=1, 4th=0
      const victoryPoints = [3, 2, 1, 0]

      // Update standings for each team
      for (let i = 0; i < teamRankings.length; i++) {
        const team = teamRankings[i]
        const placement = i + 1
        const vp = victoryPoints[i]

        await updateTeamStanding(team.teamId, team.total, vp, placement)
        console.log(`  ${placement}. ${team.name}: ${team.total} pts → +${vp} VP`)
      }

      processedCount++
      console.log()
    }

    console.log(`✅ Successfully recalculated standings from ${processedCount} matches\n`)

    // Display final standings
    console.log('📊 Final KDBI Leaderboard (from SEMIFINAL onwards):\n')
    const finalStandings = await prisma.teamStanding.findMany({
      where: {
        registration: {
          competition: { type: 'KDBI' },
          status: 'VERIFIED'
        }
      },
      include: {
        registration: {
          select: {
            teamName: true
          }
        }
      },
      orderBy: [
        { teamPoints: 'desc' },
        { speakerPoints: 'desc' },
        { averageSpeakerPoints: 'desc' },
        { avgPosition: 'asc' }
      ]
    })

    finalStandings.forEach((standing, index) => {
      console.log(
        `${index + 1}. ${standing.registration.teamName.padEnd(30)} | ` +
        `VP: ${standing.teamPoints.toString().padStart(2)} | ` +
        `SP: ${standing.speakerPoints.toFixed(1).padStart(6)} | ` +
        `Avg: ${standing.averageSpeakerPoints.toFixed(2).padStart(5)} | ` +
        `Matches: ${standing.matchesPlayed}`
      )
    })

  } catch (error) {
    console.error('❌ Error recalculating KDBI standings:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function updateTeamStanding(registrationId, teamTotalScore, victoryPointsEarned, placement) {
  const currentStanding = await prisma.teamStanding.findUnique({
    where: { registrationId }
  })

  const matchesPlayed = (currentStanding?.matchesPlayed || 0) + 1
  const firstPlaces = (currentStanding?.firstPlaces || 0) + (placement === 1 ? 1 : 0)
  const secondPlaces = (currentStanding?.secondPlaces || 0) + (placement === 2 ? 1 : 0)
  const thirdPlaces = (currentStanding?.thirdPlaces || 0) + (placement === 3 ? 1 : 0)
  const fourthPlaces = (currentStanding?.fourthPlaces || 0) + (placement === 4 ? 1 : 0)
  const speakerPoints = (currentStanding?.speakerPoints || 0) + teamTotalScore

  const updatedData = {
    matchesPlayed,
    teamPoints: (currentStanding?.teamPoints || 0) + victoryPointsEarned,
    speakerPoints,
    firstPlaces,
    secondPlaces,
    thirdPlaces,
    fourthPlaces,
    averageSpeakerPoints: speakerPoints / matchesPlayed,
    avgPosition: ((firstPlaces * 1) + (secondPlaces * 2) + (thirdPlaces * 3) + (fourthPlaces * 4)) / matchesPlayed
  }

  await prisma.teamStanding.upsert({
    where: { registrationId },
    update: updatedData,
    create: {
      registrationId,
      ...updatedData
    }
  })
}

// Run the script
recalculateKDBIStandings()
  .then(() => {
    console.log('\n🎉 KDBI standings recalculation completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
