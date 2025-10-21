const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetSPCSemifinalRanking() {
  try {
    console.log('🔄 Starting SPC Semifinal ranking reset...\n')

    // 1. Reset all ranking and qualification status
    const resetRanking = await prisma.sPCSubmission.updateMany({
      where: {
        status: {
          in: ['REVIEWED', 'QUALIFIED', 'NOT_QUALIFIED']
        }
      },
      data: {
        semifinalRank: null,
        qualifiedToFinal: false,
        status: 'REVIEWED'
      }
    })
    console.log(`✅ Reset ranking for ${resetRanking.count} submissions`)

    // 2. Show all reviewed submissions
    const submissions = await prisma.sPCSubmission.findMany({
      where: {
        status: 'REVIEWED',
        totalSemifinalScore: {
          not: null
        }
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true
              }
            }
          }
        }
      },
      orderBy: {
        totalSemifinalScore: 'desc'
      }
    })

    console.log(`\n📊 Reviewed Submissions (${submissions.length}):`)
    submissions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.registration.participant?.fullName || 'Unknown'} - Score: ${sub.totalSemifinalScore}`)
    })

    console.log('\n✨ SPC Semifinal ranking reset completed!')
    console.log('\nAll submissions are now in REVIEWED status.')
    console.log('Admin can recalculate ranking using: POST /api/admin/spc/calculate-ranking')

  } catch (error) {
    console.error('❌ Error resetting SPC Semifinal ranking:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetSPCSemifinalRanking()
