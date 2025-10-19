const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Email peserta yang ingin dihapus submission DCC-nya
const participantEmail = process.argv[2]
const category = process.argv[3] // 'DCC_INFOGRAFIS' or 'DCC_SHORT_VIDEO'

async function deleteDCCSubmission() {
  try {
    if (!participantEmail) {
      console.log('Usage: node scripts/delete-dcc-submission.js <email> [category]')
      console.log('Example: node scripts/delete-dcc-submission.js user@test.com DCC_INFOGRAFIS')
      console.log('\nOr delete all DCC submissions:')
      console.log('node scripts/delete-dcc-submission.js ALL')
      process.exit(1)
    }

    if (participantEmail === 'ALL') {
      console.log('⚠️  WARNING: This will delete ALL DCC submissions!')
      console.log('Are you sure? Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
      
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const result = await prisma.dCCSubmission.deleteMany({})
      console.log(`✓ Deleted ${result.count} DCC submission(s)`)
      return
    }

    console.log(`Looking for DCC submissions for: ${participantEmail}`)
    if (category) {
      console.log(`Category filter: ${category}`)
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: participantEmail },
      include: {
        participant: {
          include: {
            registrations: {
              include: {
                competition: true,
                dccSubmission: true
              }
            }
          }
        }
      }
    })

    if (!user || !user.participant) {
      console.log('❌ User or participant not found')
      process.exit(1)
    }

    console.log(`✓ Found participant: ${user.participant.fullName}`)

    // Find DCC registrations
    const dccRegistrations = user.participant.registrations.filter(reg => {
      const isDCC = reg.competition.type.startsWith('DCC_')
      if (category) {
        return isDCC && reg.competition.type === category
      }
      return isDCC
    })

    if (dccRegistrations.length === 0) {
      console.log('❌ No DCC registrations found')
      process.exit(1)
    }

    console.log(`\nFound ${dccRegistrations.length} DCC registration(s):`)
    
    let deletedCount = 0

    for (const reg of dccRegistrations) {
      console.log(`\n  Competition: ${reg.competition.name}`)
      console.log(`  Registration ID: ${reg.id}`)
      
      if (reg.dccSubmission) {
        console.log(`  Submission: "${reg.dccSubmission.judulKarya}"`)
        console.log(`  File: ${reg.dccSubmission.fileKarya}`)
        console.log(`  Status: ${reg.dccSubmission.status}`)
        
        // Delete submission (will cascade delete scores)
        await prisma.dCCSubmission.delete({
          where: { id: reg.dccSubmission.id }
        })
        
        console.log('  ✓ Submission deleted')
        deletedCount++
      } else {
        console.log('  ℹ No submission found')
      }
    }

    console.log(`\n✅ Deleted ${deletedCount} DCC submission(s)`)
    console.log('Peserta sekarang bisa upload ulang karya DCC')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteDCCSubmission()
