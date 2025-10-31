// scripts/auto-qualify-to-finals.js
// Script to automatically qualify participants to finals based on rankings
// - SPC: Top 6 participants
// - DCC Infografis: All 4 participants
// - DCC Short Video: Top 7 participants

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function autoQualifyToFinals() {
  console.log('🎯 AUTO-QUALIFY PARTICIPANTS TO FINALS')
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    // Check if --confirm flag is provided
    const isConfirmed = process.argv.includes('--confirm')
    
    if (!isConfirmed) {
      console.log('⚠️  DRY RUN MODE')
      console.log('This script will set qualifiedToFinal = true for:')
      console.log('  - SPC: Top 6 participants (based on totalSemifinalScore)')
      console.log('  - DCC Infografis: All participants (only 4)')
      console.log('  - DCC Short Video: Top 7 participants (based on average scores)')
      console.log('')
      console.log('To actually update, run with: --confirm')
      console.log('Example: node scripts/auto-qualify-to-finals.js --confirm')
      console.log('')
    }

    // ===== SPC =====
    console.log('📝 PROCESSING SPC...')
    console.log('-' .repeat(50))
    
    // First, reset all SPC qualifications
    const spcResetCount = await prisma.sPCSubmission.updateMany({
      data: {
        qualifiedToFinal: false
      }
    })
    console.log(`✅ Reset ${spcResetCount.count} SPC submissions`)
    
    // Get top 6 SPC participants by totalSemifinalScore
    const spcSubmissions = await prisma.sPCSubmission.findMany({
      where: {
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
      },
      take: 6
    })
    
    console.log(`\n📊 Top 6 SPC Participants:`)
    spcSubmissions.forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.registration.participant?.fullName || 'Unknown'} - Score: ${sub.totalSemifinalScore}`)
    })
    
    if (isConfirmed) {
      const spcIds = spcSubmissions.map(s => s.id)
      const spcQualified = await prisma.sPCSubmission.updateMany({
        where: {
          id: { in: spcIds }
        },
        data: {
          qualifiedToFinal: true
        }
      })
      console.log(`✅ Qualified ${spcQualified.count} SPC participants to finals`)
    } else {
      console.log(`📋 Would qualify ${spcSubmissions.length} SPC participants`)
    }
    
    console.log('')
    
    // ===== DCC INFOGRAFIS =====
    console.log('🎨 PROCESSING DCC INFOGRAFIS...')
    console.log('-' .repeat(50))
    
    // First, reset all DCC Infografis qualifications
    const dccInfografisResetCount = await prisma.dCCSubmission.updateMany({
      where: {
        registration: {
          competition: {
            type: 'DCC_INFOGRAFIS'
          }
        }
      },
      data: {
        qualifiedToFinal: false
      }
    })
    console.log(`✅ Reset ${dccInfografisResetCount.count} DCC Infografis submissions`)
    
    // Get all DCC Infografis submissions
    const infografisSubmissions = await prisma.dCCSubmission.findMany({
      where: {
        registration: {
          competition: {
            type: 'DCC_INFOGRAFIS'
          }
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
        },
        semifinalScores: true
      }
    })
    
    // Calculate total scores for display
    const infografisWithScores = infografisSubmissions.map(submission => {
      const scores = submission.semifinalScores
      const totalJudges = scores.length
      let totalScore = 0
      
      if (totalJudges > 0) {
        const avgDesainVisual = scores.reduce((sum, s) => sum + s.desainVisual, 0) / totalJudges
        const avgIsiPesan = scores.reduce((sum, s) => sum + s.isiPesan, 0) / totalJudges
        const avgOrisinalitas = scores.reduce((sum, s) => sum + s.orisinalitas, 0) / totalJudges
        totalScore = avgDesainVisual + avgIsiPesan + avgOrisinalitas
      }
      
      return {
        ...submission,
        totalScore: Math.round(totalScore * 100) / 100
      }
    })
    
    // Sort by total score
    infografisWithScores.sort((a, b) => b.totalScore - a.totalScore)
    
    console.log(`\n📊 All DCC Infografis Participants (${infografisWithScores.length}):`)
    infografisWithScores.forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.registration.participant?.fullName || 'Unknown'} - Score: ${sub.totalScore}`)
    })
    
    if (isConfirmed) {
      const infografisIds = infografisSubmissions.map(s => s.id)
      const infografisQualified = await prisma.dCCSubmission.updateMany({
        where: {
          id: { in: infografisIds }
        },
        data: {
          qualifiedToFinal: true
        }
      })
      console.log(`✅ Qualified ${infografisQualified.count} DCC Infografis participants to finals (ALL)`)
    } else {
      console.log(`📋 Would qualify ${infografisSubmissions.length} DCC Infografis participants (ALL)`)
    }
    
    console.log('')
    
    // ===== DCC SHORT VIDEO =====
    console.log('🎬 PROCESSING DCC SHORT VIDEO...')
    console.log('-' .repeat(50))
    
    // First, reset all DCC Short Video qualifications
    const dccVideoResetCount = await prisma.dCCSubmission.updateMany({
      where: {
        registration: {
          competition: {
            type: 'DCC_SHORT_VIDEO'
          }
        }
      },
      data: {
        qualifiedToFinal: false
      }
    })
    console.log(`✅ Reset ${dccVideoResetCount.count} DCC Short Video submissions`)
    
    // Get all DCC Short Video submissions with scores
    const videoSubmissions = await prisma.dCCSubmission.findMany({
      where: {
        registration: {
          competition: {
            type: 'DCC_SHORT_VIDEO'
          }
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
        },
        shortVideoScores: true
      }
    })
    
    // Calculate total scores
    const videoWithScores = videoSubmissions.map(submission => {
      const scores = submission.shortVideoScores
      const totalJudges = scores.length
      let totalScore = 0
      
      if (totalJudges > 0) {
        const avgSinematografi = scores.reduce((sum, s) => sum + s.sinematografi, 0) / totalJudges
        const avgVisualBentuk = scores.reduce((sum, s) => sum + s.visualBentuk, 0) / totalJudges
        const avgVisualEditing = scores.reduce((sum, s) => sum + s.visualEditing, 0) / totalJudges
        const avgIsiPesan = scores.reduce((sum, s) => sum + s.isiPesan, 0) / totalJudges
        totalScore = avgSinematografi + avgVisualBentuk + avgVisualEditing + avgIsiPesan
      }
      
      return {
        ...submission,
        totalScore: Math.round(totalScore * 100) / 100
      }
    })
    
    // Sort by total score and take top 7
    videoWithScores.sort((a, b) => b.totalScore - a.totalScore)
    const top7Videos = videoWithScores.slice(0, 7)
    
    console.log(`\n📊 Top 7 DCC Short Video Participants:`)
    top7Videos.forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.registration.participant?.fullName || 'Unknown'} - Score: ${sub.totalScore}`)
    })
    
    if (isConfirmed) {
      const videoIds = top7Videos.map(s => s.id)
      const videoQualified = await prisma.dCCSubmission.updateMany({
        where: {
          id: { in: videoIds }
        },
        data: {
          qualifiedToFinal: true
        }
      })
      console.log(`✅ Qualified ${videoQualified.count} DCC Short Video participants to finals`)
    } else {
      console.log(`📋 Would qualify ${top7Videos.length} DCC Short Video participants`)
    }
    
    console.log('')
    console.log('=' .repeat(50))
    
    if (isConfirmed) {
      console.log('✅ AUTO-QUALIFICATION COMPLETED!')
      console.log('')
      console.log('📊 Summary:')
      console.log(`  - SPC: ${spcSubmissions.length} qualified (Top 6)`)
      console.log(`  - DCC Infografis: ${infografisSubmissions.length} qualified (All)`)
      console.log(`  - DCC Short Video: ${top7Videos.length} qualified (Top 7)`)
    } else {
      console.log('📋 DRY RUN COMPLETED - No changes made')
      console.log('Run with --confirm to apply changes')
    }
    
  } catch (error) {
    console.error('❌ Error during auto-qualification:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
autoQualifyToFinals()
  .then(() => {
    console.log('')
    console.log('🏁 Script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
