// scripts/reset-debate-matches-scores.js
// Script to reset all debate matches and scores (KDBI & EDC)
// WARNING: This will delete ALL match and score data!

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetDebateData() {
  console.log('🗑️  RESET DEBATE MATCHES & SCORES')
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    // Get counts before deletion
    const matchCount = await prisma.debateMatch.count()
    const scoreCount = await prisma.debateScore.count()
    const standingCount = await prisma.teamStanding.count()
    
    console.log('📊 Current Data:')
    console.log(`  - Debate Matches: ${matchCount}`)
    console.log(`  - Debate Scores: ${scoreCount}`)
    console.log(`  - Team Standings: ${standingCount}`)
    console.log('')
    
    if (matchCount === 0 && scoreCount === 0) {
      console.log('✅ Already clean - no data to delete')
      return
    }
    
    // Check if --confirm flag is provided
    const isConfirmed = process.argv.includes('--confirm')
    
    if (!isConfirmed) {
      console.log('⚠️  DRY RUN MODE')
      console.log('This script will delete:')
      console.log(`  ❌ ${scoreCount} debate scores`)
      console.log(`  ❌ ${matchCount} debate matches`)
      console.log(`  ❌ ${standingCount} team standings`)
      console.log('')
      console.log('To actually delete, run with: --confirm')
      console.log('Example: node scripts/reset-debate-matches-scores.js --confirm')
      return
    }
    
    console.log('⚠️  CONFIRMED - Starting deletion...')
    console.log('')
    
    // Delete in correct order (child tables first)
    console.log('1️⃣  Deleting debate scores...')
    const deletedScores = await prisma.debateScore.deleteMany({})
    console.log(`   ✅ Deleted ${deletedScores.count} scores`)
    
    console.log('2️⃣  Deleting team standings...')
    const deletedStandings = await prisma.teamStanding.deleteMany({})
    console.log(`   ✅ Deleted ${deletedStandings.count} standings`)
    
    console.log('3️⃣  Deleting debate matches...')
    const deletedMatches = await prisma.debateMatch.deleteMany({})
    console.log(`   ✅ Deleted ${deletedMatches.count} matches`)
    
    console.log('')
    console.log('✅ Reset completed successfully!')
    console.log('')
    console.log('📝 Note: Debate rounds are NOT deleted (they can be reused)')
    
  } catch (error) {
    console.error('❌ Error during reset:', error)
    throw error
  }
}

async function resetByCompetition(competitionType) {
  console.log(`🗑️  RESET ${competitionType} MATCHES & SCORES`)
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    // Get competition
    const competition = await prisma.competition.findFirst({
      where: { type: competitionType }
    })
    
    if (!competition) {
      console.log(`❌ Competition ${competitionType} not found`)
      return
    }
    
    // Get rounds for this competition
    const rounds = await prisma.debateRound.findMany({
      where: { competitionId: competition.id },
      select: { id: true }
    })
    
    const roundIds = rounds.map(r => r.id)
    
    // Count data
    const matchCount = await prisma.debateMatch.count({
      where: { roundId: { in: roundIds } }
    })
    
    const scoreCount = await prisma.debateScore.count({
      where: { 
        match: {
          roundId: { in: roundIds }
        }
      }
    })
    
    console.log(`📊 Current Data for ${competitionType}:`)
    console.log(`  - Debate Matches: ${matchCount}`)
    console.log(`  - Debate Scores: ${scoreCount}`)
    console.log('')
    
    if (matchCount === 0 && scoreCount === 0) {
      console.log('✅ Already clean - no data to delete')
      return
    }
    
    // Check confirmation
    const isConfirmed = process.argv.includes('--confirm')
    
    if (!isConfirmed) {
      console.log('⚠️  DRY RUN MODE')
      console.log(`This will delete all ${competitionType} data:`)
      console.log(`  ❌ ${scoreCount} debate scores`)
      console.log(`  ❌ ${matchCount} debate matches`)
      console.log('')
      console.log('To actually delete, run with: --confirm')
      return
    }
    
    console.log('⚠️  CONFIRMED - Starting deletion...')
    console.log('')
    
    // Delete scores first
    console.log('1️⃣  Deleting debate scores...')
    const deletedScores = await prisma.debateScore.deleteMany({
      where: {
        match: {
          roundId: { in: roundIds }
        }
      }
    })
    console.log(`   ✅ Deleted ${deletedScores.count} scores`)
    
    // Delete matches
    console.log('2️⃣  Deleting debate matches...')
    const deletedMatches = await prisma.debateMatch.deleteMany({
      where: { roundId: { in: roundIds } }
    })
    console.log(`   ✅ Deleted ${deletedMatches.count} matches`)
    
    console.log('')
    console.log(`✅ ${competitionType} reset completed!`)
    
  } catch (error) {
    console.error('❌ Error during reset:', error)
    throw error
  }
}

// Main execution
async function main() {
  const competitionArg = process.argv.find(arg => arg.startsWith('--competition='))
  
  if (competitionArg) {
    const competitionType = competitionArg.split('=')[1]
    await resetByCompetition(competitionType)
  } else {
    await resetDebateData()
  }
}

main()
  .catch((e) => {
    console.error('💥 Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Database disconnected')
  })
