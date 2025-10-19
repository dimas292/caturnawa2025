const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDCCScores() {
  try {
    console.log('=== Checking DCC Scores in Database ===\n')

    // Check DCCSemifinalScore
    console.log('1. DCC Semifinal Scores (Infografis):')
    const semifinalScores = await prisma.dCCSemifinalScore.findMany({
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

    if (semifinalScores.length === 0) {
      console.log('   ❌ No semifinal scores found\n')
    } else {
      console.log(`   ✓ Found ${semifinalScores.length} semifinal score(s):\n`)
      semifinalScores.forEach(score => {
        console.log(`   - Participant: ${score.submission.registration.participant.fullName}`)
        console.log(`     Karya: ${score.submission.judulKarya}`)
        console.log(`     Judge: ${score.judgeName}`)
        console.log(`     Total: ${score.total}/300`)
        console.log(`     Breakdown: Desain Visual=${score.desainVisual}, Isi Pesan=${score.isiPesan}, Orisinalitas=${score.orisinalitas}`)
        if (score.feedback) {
          console.log(`     Feedback: ${score.feedback.substring(0, 50)}...`)
        }
        console.log('')
      })
    }

    // Check DCCShortVideoScore
    console.log('2. DCC Short Video Scores:')
    const videoScores = await prisma.dCCShortVideoScore.findMany({
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

    if (videoScores.length === 0) {
      console.log('   ❌ No short video scores found\n')
    } else {
      console.log(`   ✓ Found ${videoScores.length} short video score(s):\n`)
      videoScores.forEach(score => {
        console.log(`   - Participant: ${score.submission.registration.participant.fullName}`)
        console.log(`     Karya: ${score.submission.judulKarya}`)
        console.log(`     Judge: ${score.judgeName}`)
        console.log(`     Total: ${score.total}/1400`)
        console.log('')
      })
    }

    // Check DCCFinalScore
    console.log('3. DCC Final Scores:')
    const finalScores = await prisma.dCCFinalScore.findMany({
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

    if (finalScores.length === 0) {
      console.log('   ❌ No final scores found\n')
    } else {
      console.log(`   ✓ Found ${finalScores.length} final score(s):\n`)
      finalScores.forEach(score => {
        console.log(`   - Participant: ${score.submission.registration.participant.fullName}`)
        console.log(`     Karya: ${score.submission.judulKarya}`)
        console.log(`     Judge: ${score.judgeName}`)
        console.log(`     Total: ${score.total}/400`)
        console.log('')
      })
    }

    // Check submissions
    console.log('4. DCC Submissions:')
    const submissions = await prisma.dCCSubmission.findMany({
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true
              }
            },
            competition: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    console.log(`   ✓ Found ${submissions.length} submission(s):\n`)
    submissions.forEach(sub => {
      console.log(`   - ${sub.registration.participant.fullName}`)
      console.log(`     Competition: ${sub.registration.competition.name}`)
      console.log(`     Karya: ${sub.judulKarya}`)
      console.log(`     Status: ${sub.status}`)
      console.log(`     Qualified to Final: ${sub.qualifiedToFinal}`)
      console.log('')
    })

    console.log('=== Summary ===')
    console.log(`Total Submissions: ${submissions.length}`)
    console.log(`Total Semifinal Scores: ${semifinalScores.length}`)
    console.log(`Total Short Video Scores: ${videoScores.length}`)
    console.log(`Total Final Scores: ${finalScores.length}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDCCScores()
