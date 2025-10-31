// scripts/tournament-progression.js
// Handle tournament progression and team advancement

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Get top 8 teams from preliminary stage to advance to semifinals
 */
async function advanceToSemifinals() {
  console.log('🏆 Advancing top 8 teams to semifinals...')

  try {
    // Get all team standings after preliminaries
    const standings = await prisma.teamStanding.findMany({
      where: {
        registration: {
          competition: { type: 'KDBI' }
        }
      },
      include: {
        registration: {
          include: {
            participant: true,
            teamMembers: { include: { participant: true } }
          }
        }
      },
      orderBy: [
        { teamPoints: 'desc' },
        { averageSpeakerPoints: 'desc' },
        { avgPosition: 'asc' }
      ]
    })

    // Get top 8 teams
    const top8Teams = standings.slice(0, 8)

    console.log('📊 Top 8 teams advancing to semifinals:')
    top8Teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.registration.teamName} - ${team.teamPoints} VP, ${team.averageSpeakerPoints.toFixed(1)} SP`)
    })

    // Get semifinal round 1 matches
    const semifinalRound1 = await prisma.debateRound.findFirst({
      where: {
        competition: { type: 'KDBI' },
        stage: 'SEMIFINAL',
        roundNumber: 1
      },
      include: { matches: true }
    })

    if (!semifinalRound1) {
      throw new Error('Semifinal Round 1 not found')
    }

    // Assign teams to semifinal matches (2 rooms, 4 teams each)
    const room1Teams = top8Teams.slice(0, 4) // Teams 1,2,3,4
    const room2Teams = top8Teams.slice(4, 8) // Teams 5,6,7,8

    // Room 1
    await prisma.debateMatch.update({
      where: { id: semifinalRound1.matches[0].id },
      data: {
        team1Id: room1Teams[0].registration.id, // 1st place team
        team2Id: room1Teams[1].registration.id, // 2nd place team
        team3Id: room1Teams[2].registration.id, // 3rd place team
        team4Id: room1Teams[3].registration.id  // 4th place team
      }
    })

    // Room 2
    await prisma.debateMatch.update({
      where: { id: semifinalRound1.matches[1].id },
      data: {
        team1Id: room2Teams[0].registration.id, // 5th place team
        team2Id: room2Teams[1].registration.id, // 6th place team
        team3Id: room2Teams[2].registration.id, // 7th place team
        team4Id: room2Teams[3].registration.id  // 8th place team
      }
    })

    console.log('\n🏠 Semifinal Room Assignments:')
    console.log(`Room 1: ${room1Teams.map(t => t.registration.teamName).join(' vs ')}`)
    console.log(`Room 2: ${room2Teams.map(t => t.registration.teamName).join(' vs ')}`)

    return top8Teams

  } catch (error) {
    console.error('❌ Error advancing to semifinals:', error)
    throw error
  }
}

/**
 * Advance teams to final stage
 */
async function advanceToFinals() {
  console.log('🏆 Advancing teams to finals...')

  try {
    // Get updated standings after semifinals
    const standings = await prisma.teamStanding.findMany({
      where: {
        registration: {
          competition: { type: 'KDBI' }
        }
      },
      include: {
        registration: {
          include: {
            participant: true,
            teamMembers: { include: { participant: true } }
          }
        }
      },
      orderBy: [
        { teamPoints: 'desc' },
        { averageSpeakerPoints: 'desc' },
        { avgPosition: 'asc' }
      ]
    })

    // Determine how many teams advance to finals (could be top 4, 8, or 16)
    const finalistCount = Math.min(16, standings.length) // Max 16 teams for 4 rooms
    const finalists = standings.slice(0, finalistCount)

    console.log(`📊 Top ${finalistCount} teams advancing to finals:`)
    finalists.forEach((team, index) => {
      console.log(`${index + 1}. ${team.registration.teamName} - ${team.teamPoints} VP, ${team.averageSpeakerPoints.toFixed(1)} SP`)
    })

    return finalists

  } catch (error) {
    console.error('❌ Error advancing to finals:', error)
    throw error
  }
}

/**
 * Get current tournament stage based on completed rounds
 */
async function getCurrentTournamentStage() {
  const completedRounds = await prisma.debateRound.findMany({
    where: {
      competition: { type: 'KDBI' },
      matches: {
        some: {
          completedAt: { not: null }
        }
      }
    },
    include: {
      matches: true
    }
  })

  const preliminaryRounds = completedRounds.filter(r => r.stage === 'PRELIMINARY').length
  const semifinalRounds = completedRounds.filter(r => r.stage === 'SEMIFINAL').length
  const finalRounds = completedRounds.filter(r => r.stage === 'FINAL').length

  if (finalRounds > 0) {
    return 'FINAL'
  } else if (semifinalRounds > 0 || preliminaryRounds >= 4) {
    return 'SEMIFINAL'
  } else {
    return 'PRELIMINARY'
  }
}

/**
 * Check if stage is complete and ready for advancement
 */
async function isStageComplete(stage) {
  const requiredRounds = {
    'PRELIMINARY': 4,
    'SEMIFINAL': 2,
    'FINAL': 1 // Changed from 3 to 1 round for finals
  }

  const completedRounds = await prisma.debateRound.count({
    where: {
      competition: { type: 'KDBI' },
      stage: stage,
      matches: {
        every: {
          completedAt: { not: null }
        }
      }
    }
  })

  return completedRounds >= requiredRounds[stage]
}

/**
 * Auto-advance teams when stage is complete
 */
async function autoAdvanceTeams() {
  console.log('🔄 Checking for automatic team advancement...')

  try {
    const currentStage = await getCurrentTournamentStage()

    if (currentStage === 'PRELIMINARY' && await isStageComplete('PRELIMINARY')) {
      console.log('✅ Preliminary stage complete - advancing to semifinals')
      return await advanceToSemifinals()
    }

    if (currentStage === 'SEMIFINAL' && await isStageComplete('SEMIFINAL')) {
      console.log('✅ Semifinal stage complete - advancing to finals')
      return await advanceToFinals()
    }

    if (currentStage === 'FINAL' && await isStageComplete('FINAL')) {
      console.log('🏆 Tournament complete!')
      return await getTournamentWinners()
    }

    console.log(`📍 Currently in ${currentStage} stage - not ready for advancement`)
    return null

  } catch (error) {
    console.error('❌ Error in auto-advancement:', error)
    throw error
  }
}

/**
 * Get tournament winners
 */
async function getTournamentWinners() {
  const finalStandings = await prisma.teamStanding.findMany({
    where: {
      registration: {
        competition: { type: 'KDBI' }
      }
    },
    include: {
      registration: {
        include: {
          participant: true,
          teamMembers: { include: { participant: true } }
        }
      }
    },
    orderBy: [
      { teamPoints: 'desc' },
      { averageSpeakerPoints: 'desc' },
      { avgPosition: 'asc' }
    ]
  })

  console.log('🏆 KDBI Tournament Final Results:')
  console.log('='.repeat(50))

  finalStandings.slice(0, 10).forEach((team, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
    console.log(`${medal} ${team.registration.teamName} - ${team.teamPoints} VP, ${team.averageSpeakerPoints.toFixed(1)} SP`)
  })

  return finalStandings
}

// Run functions
if (require.main === module) {
  const action = process.argv[2]

  switch (action) {
    case 'semifinals':
      advanceToSemifinals().catch(console.error)
      break
    case 'finals':
      advanceToFinals().catch(console.error)
      break
    case 'auto':
      autoAdvanceTeams().catch(console.error)
      break
    case 'winners':
      getTournamentWinners().catch(console.error)
      break
    default:
      console.log('Usage: node tournament-progression.js [semifinals|finals|auto|winners]')
  }
}

module.exports = {
  advanceToSemifinals,
  advanceToFinals,
  getCurrentTournamentStage,
  isStageComplete,
  autoAdvanceTeams,
  getTournamentWinners
}
