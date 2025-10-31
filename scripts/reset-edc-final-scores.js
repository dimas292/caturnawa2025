// scripts/reset-edc-final-scores.js
// Script to reset EDC FINAL stage scores only
// WARNING: This will delete EDC final match and score data!

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetEDCFinalScores() {
  console.log('🗑️  RESET EDC FINAL SCORES')
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    // Get EDC competition
    const edcCompetition = await prisma.competition.findFirst({
      where: { type: 'EDC' }
    })
    
    if (!edcCompetition) {
      console.log('❌ EDC competition not found')
      return
    }
    
    console.log(`✅ Found EDC competition: ${edcCompetition.name}`)
    console.log('')
    
    // Get FINAL stage rounds for EDC
    const finalRounds = await prisma.debateRound.findMany({
      where: { 
        competitionId: edcCompetition.id,
        stage: 'FINAL'
      },
      select: { id: true, name: true }
    })
    
    if (finalRounds.length === 0) {
      console.log('❌ No EDC FINAL rounds found')
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
      console.log(`  ❌ ${scoreCount} EDC FINAL debate scores`)
      console.log(`  ❌ ${matchCount} EDC FINAL debate matches`)
      console.log('')
      console.log('📝 Note: Only FINAL stage data will be deleted')
      console.log('         Semifinal and other stages remain untouched')
      console.log('')
      console.log('To actually delete, run with: --confirm')
      console.log('Example: node scripts/reset-edc-final-scores.js --confirm')
      return
    }
    
    console.log('⚠️  CONFIRMED - Starting deletion...')
    console.log('')
    
    // Delete in correct order (scores first, then matches)
    console.log('1️⃣  Deleting EDC FINAL debate scores...')
    const deletedScores = await prisma.debateScore.deleteMany({
      where: { 
        match: {
          roundId: { in: roundIds }
        }
      }
    })
    console.log(`   ✅ Deleted ${deletedScores.count} scores`)
    
    console.log('2️⃣  Deleting EDC FINAL debate matches...')
    const deletedMatches = await prisma.debateMatch.deleteMany({
      where: { roundId: { in: roundIds } }
    })
    console.log(`   ✅ Deleted ${deletedMatches.count} matches`)
    
    console.log('')
    console.log('✅ Reset EDC FINAL scores completed successfully!')
    console.log('')
    console.log('📝 Note: EDC FINAL rounds are NOT deleted (they can be reused)')
    console.log('         Semifinal data remains intact')
    
  } catch (error) {
    console.error('❌ Error during reset:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
resetEDCFinalScores()
  .then(() => {
    console.log('')
    console.log('🏁 Script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
