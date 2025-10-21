const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetSPCFinalData() {
  try {
    console.log('🔄 Starting SPC Final data cleanup...\n')

    // 1. Delete all SPC Final Scores
    const deletedScores = await prisma.sPCFinalScore.deleteMany({})
    console.log(`✅ Deleted ${deletedScores.count} SPC Final Scores`)

    // 2. Reset presentation order and schedule for finalists
    const resetFinalists = await prisma.sPCSubmission.updateMany({
      where: {
        qualifiedToFinal: true
      },
      data: {
        presentationOrder: null,
        presentationTitle: null,
        scheduledTime: null
      }
    })
    console.log(`✅ Reset presentation data for ${resetFinalists.count} finalists`)

    // 3. Show current finalists status
    const finalists = await prisma.sPCSubmission.findMany({
      where: {
        qualifiedToFinal: true
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        totalSemifinalScore: 'desc'
      }
    })

    console.log(`\n📊 Current Finalists (${finalists.length}):`)
    finalists.forEach((finalist, index) => {
      console.log(`${index + 1}. ${finalist.registration.participant?.fullName || 'Unknown'} - Score: ${finalist.totalSemifinalScore}`)
    })

    console.log('\n✨ SPC Final data cleanup completed!')
    console.log('\nNote: Finalists status (qualifiedToFinal) is preserved.')
    console.log('If you want to reset finalists selection too, run: reset-spc-semifinal-ranking.js')

  } catch (error) {
    console.error('❌ Error resetting SPC Final data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetSPCFinalData()
