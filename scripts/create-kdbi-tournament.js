// scripts/create-kdbi-tournament.js
// Script to create British Parliamentary tournament structure for KDBI

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Tournament configuration
const TOURNAMENT_CONFIG = {
  PRELIMINARY: {
    stage: 'PRELIMINARY',
    rounds: 4,
    roomsPerRound: 4,
    teamsPerRoom: 4,
    judgesPerRoom: 1
  },
  SEMIFINAL: {
    stage: 'SEMIFINAL', 
    rounds: 2,
    roomsPerRound: 2,
    teamsPerRoom: 4,
    judgesPerRoom: 1
  },
  FINAL: {
    stage: 'FINAL',
    rounds: 3,
    roomsPerRound: 4,
    teamsPerRoom: 4,
    judgesPerRoom: 3
  }
}

// BP Victory Points: 1st=3pts, 2nd=2pts, 3rd=1pt, 4th=0pts
const VICTORY_POINTS = {
  1: 3, // 1st place
  2: 2, // 2nd place
  3: 1, // 3rd place
  4: 0  // 4th place
}

// BP Positions in each room
const BP_POSITIONS = {
  1: { teamPosition: 'OG', speakers: ['PM', 'DPM'] },    // Opening Government
  2: { teamPosition: 'OO', speakers: ['LO', 'DLO'] },   // Opening Opposition
  3: { teamPosition: 'CG', speakers: ['MG', 'GW'] },    // Closing Government
  4: { teamPosition: 'CO', speakers: ['MO', 'OW'] }     // Closing Opposition
}

async function createKDBITournament() {
  console.log('🏆 Creating KDBI British Parliamentary Tournament Structure')
  console.log('=' .repeat(60))

  try {
    // Get KDBI competition
    const kdbiCompetition = await prisma.competition.findUnique({
      where: { type: 'KDBI' }
    })

    if (!kdbiCompetition) {
      throw new Error('KDBI competition not found. Please create it first.')
    }

    console.log(`📋 Competition: ${kdbiCompetition.name}`)

    // Create tournament stages
    for (const [stageName, config] of Object.entries(TOURNAMENT_CONFIG)) {
      console.log(`\n🎯 Creating ${stageName} stage (${config.rounds} rounds)`)
      
      for (let roundNum = 1; roundNum <= config.rounds; roundNum++) {
        const roundName = `${stageName.charAt(0) + stageName.slice(1).toLowerCase()} Round ${roundNum}`
        
        // Check if round already exists
        let debateRound = await prisma.debateRound.findFirst({
          where: {
            competitionId: kdbiCompetition.id,
            stage: config.stage,
            roundNumber: roundNum
          }
        })

        if (!debateRound) {
          // Create debate round
          debateRound = await prisma.debateRound.create({
            data: {
              competitionId: kdbiCompetition.id,
              stage: config.stage,
              roundNumber: roundNum,
              roundName: roundName
            }
          })
          console.log(`  📍 Created: ${roundName}`)
        } else {
          console.log(`  ⏭️  ${roundName} already exists`)
        }

        // Check existing matches
        const existingMatches = await prisma.debateMatch.findMany({
          where: { roundId: debateRound.id }
        })

        // Create matches (breakout rooms) for this round
        for (let roomNum = 1; roomNum <= config.roomsPerRound; roomNum++) {
          const existingMatch = existingMatches.find(m => m.matchNumber === roomNum)
          
          if (!existingMatch) {
            await prisma.debateMatch.create({
              data: {
                roundId: debateRound.id,
                matchNumber: roomNum,
                matchFormat: 'BP'
              }
            })
            console.log(`    🏠 Room ${roomNum} created`)
          } else {
            console.log(`    ⏭️  Room ${roomNum} already exists`)
          }
        }
      }
    }

    console.log('\n✅ Tournament structure created successfully!')
    
    // Display tournament summary
    const rounds = await prisma.debateRound.findMany({
      where: { competitionId: kdbiCompetition.id },
      include: { matches: true },
      orderBy: [
        { stage: 'asc' },
        { roundNumber: 'asc' }
      ]
    })

    console.log('\n📊 Tournament Summary:')
    console.log('=' .repeat(40))
    
    let totalMatches = 0
    for (const round of rounds) {
      console.log(`${round.roundName}: ${round.matches.length} rooms`)
      totalMatches += round.matches.length
    }
    
    console.log(`\nTotal Rounds: ${rounds.length}`)
    console.log(`Total Rooms: ${totalMatches}`)
    console.log(`Max Teams: ${totalMatches * 4} (4 teams per room)`)

  } catch (error) {
    console.error('❌ Error creating tournament:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function assignTeamsToMatches() {
  console.log('\n🎲 Assigning teams to preliminary matches...')
  
  try {
    // Get all verified KDBI registrations
    const teams = await prisma.registration.findMany({
      where: {
        competition: { type: 'KDBI' },
        status: 'VERIFIED'
      },
      include: {
        participant: true,
        teamMembers: true
      }
    })

    console.log(`📊 Found ${teams.length} verified teams`)

    if (teams.length === 0) {
      console.log('⚠️  No verified teams found. Please generate participants first.')
      return
    }

    // Get preliminary round 1 matches
    const prelimRound1 = await prisma.debateRound.findFirst({
      where: {
        competition: { type: 'KDBI' },
        stage: 'PRELIMINARY',
        roundNumber: 1
      },
      include: { matches: true }
    })

    if (!prelimRound1) {
      throw new Error('Preliminary Round 1 not found')
    }

    // Shuffle teams randomly
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)
    
    // Assign teams to matches (4 teams per match)
    let teamIndex = 0
    for (const match of prelimRound1.matches) {
      if (teamIndex + 3 < shuffledTeams.length) {
        await prisma.debateMatch.update({
          where: { id: match.id },
          data: {
            team1Id: shuffledTeams[teamIndex].id,     // OG
            team2Id: shuffledTeams[teamIndex + 1].id, // OO
            team3Id: shuffledTeams[teamIndex + 2].id, // CG
            team4Id: shuffledTeams[teamIndex + 3].id  // CO
          }
        })

        console.log(`  🏠 Room ${match.matchNumber}: ${shuffledTeams.slice(teamIndex, teamIndex + 4).map(t => t.teamName).join(' vs ')}`)
        teamIndex += 4
      }
    }

    console.log(`✅ Assigned ${Math.floor(teamIndex)} teams to ${prelimRound1.matches.length} rooms`)

  } catch (error) {
    console.error('❌ Error assigning teams:', error)
    throw error
  }
}

// Run the script
if (require.main === module) {
  createKDBITournament()
    .then(() => assignTeamsToMatches())
    .catch(console.error)
}

module.exports = { 
  createKDBITournament, 
  assignTeamsToMatches,
  TOURNAMENT_CONFIG,
  VICTORY_POINTS,
  BP_POSITIONS
}
