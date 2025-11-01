// scripts/check-qualified-finalists.js
// Script to check which participants are qualified to finals

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkQualifiedFinalists() {
  console.log('🔍 CHECKING QUALIFIED FINALISTS')
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    // Check SPC
    console.log('📝 SPC FINALISTS:')
    console.log('-' .repeat(50))
    const spcFinalists = await prisma.sPCSubmission.findMany({
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
    
    console.log(`Total: ${spcFinalists.length} finalists`)
    spcFinalists.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.registration.participant?.fullName} - Status: ${f.status} - QualifiedToFinal: ${f.qualifiedToFinal}`)
    })
    console.log('')
    
    // Check DCC Infografis
    console.log('🎨 DCC INFOGRAFIS FINALISTS:')
    console.log('-' .repeat(50))
    const infografisFinalists = await prisma.dCCSubmission.findMany({
      where: {
        qualifiedToFinal: true,
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
                fullName: true
              }
            },
            competition: {
              select: {
                type: true
              }
            }
          }
        }
      }
    })
    
    console.log(`Total: ${infografisFinalists.length} finalists`)
    infografisFinalists.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.registration.participant?.fullName} - Status: ${f.status} - QualifiedToFinal: ${f.qualifiedToFinal}`)
    })
    console.log('')
    
    // Check DCC Short Video
    console.log('🎬 DCC SHORT VIDEO FINALISTS:')
    console.log('-' .repeat(50))
    const videoFinalists = await prisma.dCCSubmission.findMany({
      where: {
        qualifiedToFinal: true,
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
                fullName: true
              }
            },
            competition: {
              select: {
                type: true
              }
            }
          }
        }
      }
    })
    
    console.log(`Total: ${videoFinalists.length} finalists`)
    videoFinalists.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.registration.participant?.fullName} - Status: ${f.status} - QualifiedToFinal: ${f.qualifiedToFinal}`)
    })
    console.log('')
    
    console.log('=' .repeat(50))
    console.log('📊 SUMMARY:')
    console.log(`  - SPC: ${spcFinalists.length} finalists`)
    console.log(`  - DCC Infografis: ${infografisFinalists.length} finalists`)
    console.log(`  - DCC Short Video: ${videoFinalists.length} finalists`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
checkQualifiedFinalists()
  .then(() => {
    console.log('')
    console.log('🏁 Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Check failed:', error)
    process.exit(1)
  })
