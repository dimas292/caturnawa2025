/**
 * Fix SPC Unknown Judge Issue
 * 
 * This script identifies and removes SPC scores with:
 * - Unknown judge name
 * - Score = 0
 * - Invalid judgeId
 * 
 * Usage:
 * 1. Run to see problematic scores: node scripts/fix-spc-unknown-judge.js
 * 2. Uncomment deletion code and run again to delete
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixSPCUnknownJudge() {
  try {
    console.log('🔍 Checking for SPC scores with unknown judge...\n')

    // Check SPCSemifinalScore
    console.log('📊 Checking SPCSemifinalScore...')
    const semifinalScores = await prisma.sPCSemifinalScore.findMany({
      where: {
        judgeName: { contains: 'unknown', mode: 'insensitive' }
      },
      include: {
        submission: {
          select: {
            judulKarya: true,
            registration: {
              select: {
                participant: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log(`Found ${semifinalScores.length} problematic semifinal scores\n`)

    if (semifinalScores.length > 0) {
      console.log('Problematic Semifinal Scores:')
      semifinalScores.forEach(score => {
        console.log(`  - ID: ${score.id}`)
        console.log(`    Karya: ${score.submission.judulKarya}`)
        console.log(`    Participant: ${score.submission.registration.participant.fullName}`)
        console.log(`    Judge: "${score.judgeName}" (ID: ${score.judgeId})`)
        console.log(`    Total: ${score.total}`)
        console.log()
      })
    }

    // Check SPCFinalScore
    console.log('📊 Checking SPCFinalScore...')
    const finalScores = await prisma.sPCFinalScore.findMany({
      where: {
        OR: [
          { judgeName: { contains: 'unknown', mode: 'insensitive' } },
          { judgeName: '' },
          { judgeName: null },
          { AND: [{ total: 0 }, { judgeName: { contains: 'unknown', mode: 'insensitive' } }] }
        ]
      },
      include: {
        submission: {
          select: {
            judulKarya: true,
            registration: {
              select: {
                participant: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log(`Found ${finalScores.length} problematic final scores\n`)

    if (finalScores.length > 0) {
      console.log('Problematic Final Scores:')
      finalScores.forEach(score => {
        console.log(`  - ID: ${score.id}`)
        console.log(`    Karya: ${score.submission.judulKarya}`)
        console.log(`    Participant: ${score.submission.registration.participant.fullName}`)
        console.log(`    Judge: "${score.judgeName}" (ID: ${score.judgeId})`)
        console.log(`    Total: ${score.total}`)
        console.log()
      })
    }

    // Ask for confirmation to delete
    const totalProblematic = semifinalScores.length + finalScores.length

    if (totalProblematic === 0) {
      console.log('✅ No problematic scores found!')
      return
    }

    console.log(`\n⚠️  Found ${totalProblematic} problematic scores`)
    console.log('These scores will be DELETED:')
    console.log(`  - ${semifinalScores.length} semifinal scores`)
    console.log(`  - ${finalScores.length} final scores`)
    console.log('\nTo delete these scores, uncomment the deletion code below and run again.\n')

    // UNCOMMENT BELOW TO DELETE
    /*
    console.log('🗑️  Deleting problematic scores...\n')

    // Delete semifinal scores
    if (semifinalScores.length > 0) {
      const deletedSemifinal = await prisma.sPCSemifinalScore.deleteMany({
        where: {
          id: {
            in: semifinalScores.map(s => s.id)
          }
        }
      })
      console.log(`✓ Deleted ${deletedSemifinal.count} semifinal scores`)
    }

    // Delete final scores
    if (finalScores.length > 0) {
      const deletedFinal = await prisma.sPCFinalScore.deleteMany({
        where: {
          id: {
            in: finalScores.map(s => s.id)
          }
        }
      })
      console.log(`✓ Deleted ${deletedFinal.count} final scores`)
    }

    console.log('\n✅ Successfully cleaned up problematic scores!')
    */

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixSPCUnknownJudge()
  .then(() => {
    console.log('\n🎉 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
