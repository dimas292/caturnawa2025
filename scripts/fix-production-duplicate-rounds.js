/**
 * Script untuk memperbaiki duplikat rounds di production
 * 
 * Cara menjalankan di production:
 * 1. Upload script ini ke server production
 * 2. Pastikan DATABASE_URL sudah di-set ke production database
 * 3. Jalankan: node scripts/fix-production-duplicate-rounds.js
 * 
 * Atau jalankan langsung dengan DATABASE_URL:
 * DATABASE_URL="postgresql://..." node scripts/fix-production-duplicate-rounds.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixProductionDuplicateRounds() {
  try {
    console.log('🔍 Scanning for duplicate rounds in PRODUCTION database...\n')
    console.log(`📍 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ No DATABASE_URL'}\n`)

    // Find all competitions
    const competitions = await prisma.competition.findMany({
      where: {
        type: {
          in: ['KDBI', 'EDC']
        }
      }
    })

    console.log(`📊 Found ${competitions.length} debate competitions\n`)

    let totalDeleted = 0

    for (const comp of competitions) {
      console.log(`\n${'='.repeat(50)}`)
      console.log(`🏆 ${comp.type} - ${comp.name}`)
      console.log('='.repeat(50))

      // Get all rounds for this competition
      const rounds = await prisma.debateRound.findMany({
        where: {
          competitionId: comp.id
        },
        orderBy: [
          { stage: 'asc' },
          { roundNumber: 'asc' },
          { session: 'asc' }
        ],
        include: {
          matches: {
            include: {
              scores: true
            }
          }
        }
      })

      console.log(`📋 Total rounds: ${rounds.length}\n`)

      // Group by stage, roundNumber to find duplicates
      const groupedRounds = {}
      rounds.forEach(round => {
        const key = `${round.stage}-${round.roundNumber}`
        if (!groupedRounds[key]) {
          groupedRounds[key] = []
        }
        groupedRounds[key].push(round)
      })

      // Process duplicates
      for (const [key, roundList] of Object.entries(groupedRounds)) {
        if (roundList.length > 1) {
          console.log(`⚠️  DUPLICATE FOUND for ${key}:`)
          
          roundList.forEach(r => {
            const hasScores = r.matches.some(m => m.scores.length > 0)
            console.log(`   - "${r.roundName}" (Session: ${r.session})`)
            console.log(`     ID: ${r.id}`)
            console.log(`     Matches: ${r.matches.length}`)
            console.log(`     Has Scores: ${hasScores ? '⚠️  YES' : 'No'}`)
          })

          // Determine which to delete
          // Priority: Keep rounds with "Sesi" in name, or with matches/scores
          const roundsToDelete = []
          const roundsToKeep = []

          roundList.forEach(r => {
            const hasScores = r.matches.some(m => m.scores.length > 0)
            const hasSesi = r.roundName.includes('Sesi')
            const hasMatches = r.matches.length > 0

            if (hasScores) {
              // Never delete rounds with scores
              roundsToKeep.push(r)
            } else if (!hasSesi && roundList.some(other => other.roundName.includes('Sesi'))) {
              // Delete rounds without "Sesi" if there's one with "Sesi"
              roundsToDelete.push(r)
            } else if (!hasMatches && roundList.some(other => other.matches.length > 0)) {
              // Delete empty rounds if there's one with matches
              roundsToDelete.push(r)
            } else {
              roundsToKeep.push(r)
            }
          })

          // Delete identified duplicates
          for (const round of roundsToDelete) {
            console.log(`\n   🗑️  DELETING: "${round.roundName}" (ID: ${round.id})`)
            
            // Delete matches first (cascade should handle this, but being explicit)
            if (round.matches.length > 0) {
              console.log(`      Deleting ${round.matches.length} matches...`)
              await prisma.debateMatch.deleteMany({
                where: { roundId: round.id }
              })
            }
            
            // Delete the round
            await prisma.debateRound.delete({
              where: { id: round.id }
            })
            
            totalDeleted++
            console.log(`      ✅ Deleted successfully`)
          }

          if (roundsToDelete.length === 0) {
            console.log(`\n   ℹ️  No safe duplicates to delete (all have scores or are needed)`)
          }

          console.log('')
        }
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total rounds deleted: ${totalDeleted}`)

    // Show final state
    console.log('\n📋 Final state of all rounds:\n')
    for (const comp of competitions) {
      const finalRounds = await prisma.debateRound.findMany({
        where: { competitionId: comp.id },
        orderBy: [
          { stage: 'asc' },
          { roundNumber: 'asc' },
          { session: 'asc' }
        ]
      })

      console.log(`\n${comp.type}:`)
      if (finalRounds.length === 0) {
        console.log('  (no rounds)')
      } else {
        finalRounds.forEach(r => {
          console.log(`  - Round ${r.roundNumber} Session ${r.session} (${r.stage}): "${r.roundName}"`)
        })
      }
    }

    console.log('\n✅ Production database cleanup completed!')

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error('Stack:', error.stack)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixProductionDuplicateRounds()
  .then(() => {
    console.log('\n✅ Script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message)
    process.exit(1)
  })
