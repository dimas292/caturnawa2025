// scripts/judge-assignment.js
// Judge assignment system for KDBI tournament

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Judge requirements per stage
const JUDGE_REQUIREMENTS = {
  PRELIMINARY: 1, // 1 judge per room
  SEMIFINAL: 1,   // 1 judge per room
  FINAL: 3        // 3 judges per room (panel)
}

/**
 * Assign judges to matches based on tournament stage
 */
async function assignJudgesToMatches(stage, roundNumber) {
  console.log(`👨‍⚖️ Assigning judges to ${stage} Round ${roundNumber}`)
  
  try {
    // Get available judges
    const judges = await prisma.user.findMany({
      where: { role: 'judge' },
      include: { participant: true }
    })

    if (judges.length === 0) {
      throw new Error('No judges found. Please create judge accounts first.')
    }

    // Get matches for this round
    const round = await prisma.debateRound.findFirst({
      where: {
        competition: { type: 'KDBI' },
        stage: stage,
        roundNumber: roundNumber
      },
      include: { matches: true }
    })

    if (!round) {
      throw new Error(`Round not found: ${stage} Round ${roundNumber}`)
    }

    const judgesRequired = JUDGE_REQUIREMENTS[stage]
    const totalJudgesNeeded = round.matches.length * judgesRequired

    console.log(`📊 Judges needed: ${totalJudgesNeeded} (${round.matches.length} rooms × ${judgesRequired} judges)`)
    console.log(`📊 Judges available: ${judges.length}`)

    if (judges.length < totalJudgesNeeded) {
      console.warn(`⚠️  Warning: Not enough judges! Need ${totalJudgesNeeded}, have ${judges.length}`)
    }

    // Assign judges to matches
    let judgeIndex = 0
    const assignments = []

    for (const match of round.matches) {
      const matchJudges = []
      
      for (let j = 0; j < judgesRequired; j++) {
        if (judgeIndex < judges.length) {
          const judge = judges[judgeIndex]
          matchJudges.push(judge)
          
          // Create judge assignment record (you might want to add this to your schema)
          assignments.push({
            matchId: match.id,
            judgeId: judge.id,
            judgeName: judge.name,
            judgeRole: judgesRequired === 3 ? (j === 0 ? 'Chief Judge' : `Panelist ${j}`) : 'Judge'
          })
          
          judgeIndex = (judgeIndex + 1) % judges.length // Rotate judges
        }
      }
      
      console.log(`🏠 Room ${match.matchNumber}: ${matchJudges.map(j => j.name).join(', ')}`)
    }

    return assignments

  } catch (error) {
    console.error('❌ Error assigning judges:', error)
    throw error
  }
}

/**
 * Create judge accounts for testing
 */
async function createJudgeAccounts(count = 10) {
  console.log(`👨‍⚖️ Creating ${count} judge accounts...`)
  
  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash('judge123', 12)
  
  const judgeNames = [
    'Prof. Dr. Ahmad Wijaya',
    'Dr. Siti Nurhaliza',
    'Prof. Budi Santoso',
    'Dr. Maya Sari',
    'Prof. Dr. Indra Gunawan',
    'Dr. Rina Kusuma',
    'Prof. Joko Widodo',
    'Dr. Fitri Handayani',
    'Prof. Dr. Eko Prasetyo',
    'Dr. Lina Marlina',
    'Prof. Agus Salim',
    'Dr. Dewi Sartika',
    'Prof. Dr. Hendra Wijaya',
    'Dr. Kartika Sari',
    'Prof. Yudi Pratama'
  ]

  try {
    for (let i = 0; i < Math.min(count, judgeNames.length); i++) {
      const judgeName = judgeNames[i]
      const email = `judge${i + 1}@caturnawa.com`
      
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim()
      
      // Check if judge already exists
      const existingJudge = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      })
      
      if (existingJudge) {
        console.log(`⏭️  Judge ${judgeName} already exists`)
        continue
      }
      
      const judge = await prisma.user.create({
        data: {
          name: judgeName,
          email: normalizedEmail,
          password: hashedPassword,
          role: 'judge',
          emailVerified: new Date()
        }
      })
      
      console.log(`✅ Created judge: ${judgeName} (${email})`)
    }
    
    console.log(`\n🔑 Judge login credentials:`)
    console.log(`Email: judge[1-${count}]@caturnawa.com`)
    console.log(`Password: judge123`)
    
  } catch (error) {
    console.error('❌ Error creating judges:', error)
    throw error
  }
}

/**
 * Get judge workload distribution
 */
async function getJudgeWorkload() {
  console.log('📊 Judge Workload Distribution')
  console.log('=' .repeat(40))
  
  try {
    const judges = await prisma.user.findMany({
      where: { role: 'judge' }
    })
    
    // Count scores submitted by each judge
    const workload = []
    
    for (const judge of judges) {
      const scoresCount = await prisma.debateScore.count({
        where: { judgeId: judge.id }
      })
      
      workload.push({
        name: judge.name,
        email: judge.email,
        matchesJudged: Math.floor(scoresCount / 8), // 8 speakers per match
        scoresSubmitted: scoresCount
      })
    }
    
    // Sort by workload
    workload.sort((a, b) => b.matchesJudged - a.matchesJudged)
    
    workload.forEach((judge, index) => {
      console.log(`${index + 1}. ${judge.name}: ${judge.matchesJudged} matches, ${judge.scoresSubmitted} scores`)
    })
    
    return workload
    
  } catch (error) {
    console.error('❌ Error getting workload:', error)
    throw error
  }
}

/**
 * Validate judge assignments for a round
 */
async function validateJudgeAssignments(stage, roundNumber) {
  console.log(`🔍 Validating judge assignments for ${stage} Round ${roundNumber}`)
  
  try {
    const round = await prisma.debateRound.findFirst({
      where: {
        competition: { type: 'KDBI' },
        stage: stage,
        roundNumber: roundNumber
      },
      include: { 
        matches: {
          include: {
            scores: {
              include: { participant: true }
            }
          }
        }
      }
    })
    
    if (!round) {
      throw new Error('Round not found')
    }
    
    const requiredJudges = JUDGE_REQUIREMENTS[stage]
    let validationResults = []
    
    for (const match of round.matches) {
      const uniqueJudges = new Set(match.scores.map(s => s.judgeId).filter(Boolean))
      const hasScores = match.scores.length > 0
      
      validationResults.push({
        room: match.matchNumber,
        requiredJudges,
        assignedJudges: uniqueJudges.size,
        hasScores,
        isValid: uniqueJudges.size === requiredJudges || (requiredJudges === 1 && hasScores)
      })
    }
    
    console.log('\n📋 Validation Results:')
    validationResults.forEach(result => {
      const status = result.isValid ? '✅' : '❌'
      console.log(`${status} Room ${result.room}: ${result.assignedJudges}/${result.requiredJudges} judges${result.hasScores ? ' (scored)' : ''}`)
    })
    
    return validationResults
    
  } catch (error) {
    console.error('❌ Error validating assignments:', error)
    throw error
  }
}

// Run functions
if (require.main === module) {
  const action = process.argv[2]
  const stage = process.argv[3]
  const roundNumber = parseInt(process.argv[4])
  
  switch (action) {
    case 'create-judges':
      const count = parseInt(process.argv[3]) || 10
      createJudgeAccounts(count).catch(console.error)
      break
    case 'assign':
      if (!stage || !roundNumber) {
        console.log('Usage: node judge-assignment.js assign [PRELIMINARY|SEMIFINAL|FINAL] [roundNumber]')
        break
      }
      assignJudgesToMatches(stage, roundNumber).catch(console.error)
      break
    case 'workload':
      getJudgeWorkload().catch(console.error)
      break
    case 'validate':
      if (!stage || !roundNumber) {
        console.log('Usage: node judge-assignment.js validate [PRELIMINARY|SEMIFINAL|FINAL] [roundNumber]')
        break
      }
      validateJudgeAssignments(stage, roundNumber).catch(console.error)
      break
    default:
      console.log('Usage: node judge-assignment.js [create-judges|assign|workload|validate] [options]')
      console.log('\nExamples:')
      console.log('  node judge-assignment.js create-judges 15')
      console.log('  node judge-assignment.js assign PRELIMINARY 1')
      console.log('  node judge-assignment.js assign FINAL 1')
      console.log('  node judge-assignment.js workload')
      console.log('  node judge-assignment.js validate FINAL 1')
  }
}

module.exports = {
  assignJudgesToMatches,
  createJudgeAccounts,
  getJudgeWorkload,
  validateJudgeAssignments,
  JUDGE_REQUIREMENTS
}
