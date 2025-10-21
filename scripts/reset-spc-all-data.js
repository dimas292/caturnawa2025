const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetAllSPCData() {
  try {
    console.log('🔄 Starting COMPLETE SPC data cleanup...\n')

    // 1. Delete all SPC Final Scores
    const deletedScores = await prisma.sPCFinalScore.deleteMany({})
    console.log(`✅ Deleted ${deletedScores.count} SPC Final Scores`)

    // 2. Reset ALL SPC Submission data (keep the submission itself)
    const resetSubmissions = await prisma.sPCSubmission.updateMany({
      data: {
        // Reset semifinal scoring
        penilaianKaryaTulisIlmiah: null,
        substansiKaryaTulisIlmiah: null,
        kualitasKaryaTulisIlmiah: null,
        catatanPenilaian: null,
        catatanSubstansi: null,
        catatanKualitas: null,
        totalSemifinalScore: null,
        semifinalRank: null,
        // Reset old scoring fields
        strukturOrganisasi: null,
        kualitasArgumen: null,
        gayaBahasaTulis: null,
        feedback: null,
        // Reset status
        status: 'PENDING',
        qualifiedToFinal: false,
        evaluatedAt: null,
        evaluatedBy: null,
        // Reset final presentation data
        presentationOrder: null,
        presentationTitle: null,
        scheduledTime: null
      }
    })
    console.log(`✅ Reset ${resetSubmissions.count} SPC Submissions to PENDING status`)

    // 3. Show remaining submissions
    const submissions = await prisma.sPCSubmission.findMany({
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
      }
    })

    console.log(`\n📊 Total SPC Submissions: ${submissions.length}`)
    submissions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.registration.participant?.fullName || 'Unknown'} - ${sub.judulKarya}`)
    })

    console.log('\n✨ COMPLETE SPC data cleanup finished!')
    console.log('\nAll submissions are reset to PENDING status.')
    console.log('Judges can start evaluating from scratch.')

  } catch (error) {
    console.error('❌ Error resetting SPC data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAllSPCData()
