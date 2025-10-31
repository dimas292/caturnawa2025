// scripts/reset-kdbi-final-scores.js
// Script to reset KDBI FINAL stage scores only
// WARNING: This will delete KDBI final match and score data!

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetKDBIFinalScores() {
  console.log('🗑️  RESET KDBI FINAL SCORES')
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    // Get KDBI competition
    const kdbiCompetition = await prisma.competition.findFirst({
      where: { type: 'KDBI' }
    })
    
    if (!kdbiCompetition) {
      console.log('❌ KDBI competition not found')
      return
    }
    
    console.log(`✅ Found KDBI competition: ${kdbiCompetition.name}`)
    console.log('')
    
    // Get FINAL stage rounds for KDBI
    const finalRounds = await prisma.debateRound.findMany({
      where: { 
        competitionId: kdbiCompetition.id,
        stage: 'FINAL'
      },
      select: { id: true, name: true }
    })
    
    if (finalRounds.length === 0) {
      console.log('❌ No KDBI FINAL rounds found')
      return
    }
    
    const roundIds = finalRounds.map(r => r.id)
    console.log(`📋 Found ${finalRounds.length} FINAL round(s):`)
    finalRounds.forEach(round => {
      console.log(`   - ${round.name}`)
    })
    console.log('')
    
    // Count data before deletion
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
    
    console.log('📊 Current FINAL Stage Data:')
    console.log(`  - Debate Matches: ${matchCount}`)
    console.log(`  - Debate Scores: ${scoreCount}`)
    console.log('')
    
    if (matchCount === 0 && scoreCount === 0) {
      console.log('✅ Already clean - no FINAL data to delete')
      return
    }
    
    // Check if --confirm flag is provided
    const isConfirmed = process.argv.includes('--confirm')
    
    if (!isConfirmed) {
      console.log('⚠️  DRY RUN MODE')
      console.log('This script will delete:')
      console.log(`  ❌ ${scoreCount} KDBI FINAL debate scores`)
      console.log(`  ❌ ${matchCount} KDBI FINAL debate matches`)
      console.log('')
      console.log('📝 Note: Only FINAL stage data will be deleted')
      console.log('         Semifinal and other stages remain untouched')
      console.log('')
      console.log('To actually delete, run with: --confirm')
      console.log('Example: node scripts/reset-kdbi-final-scores.js --confirm')
      return
    }
    
    console.log('⚠️  CONFIRMED - Starting deletion...')
    console.log('')
    
    // Delete in correct order (scores first, then matches)
    console.log('1️⃣  Deleting KDBI FINAL debate scores...')
    const deletedScores = await prisma.debateScore.deleteMany({
      where: { 
        match: {
          roundId: { in: roundIds }
        }
      }
    })
    console.log(`   ✅ Deleted ${deletedScores.count} scores`)
    
    console.log('2️⃣  Deleting KDBI FINAL debate matches...')
    const deletedMatches = await prisma.debateMatch.deleteMany({
      where: { roundId: { in: roundIds } }
    })
    console.log(`   ✅ Deleted ${deletedMatches.count} matches`)
    
    console.log('')
    console.log('✅ Reset KDBI FINAL scores completed successfully!')
    console.log('')
    console.log('📝 Note: KDBI FINAL rounds are NOT deleted (they can be reused)')
    console.log('         Semifinal data remains intact')
    
  } catch (error) {
    console.error('❌ Error during reset:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
resetKDBIFinalScores()
  .then(() => {
    console.log('')
    console.log('🏁 Script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
