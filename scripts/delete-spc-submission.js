const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Email peserta yang ingin dihapus submission SPC-nya
const participantEmail = process.argv[2]

async function deleteSPCSubmission() {
  try {
    if (!participantEmail) {
      console.log('Usage: node scripts/delete-spc-submission.js <email>')
      console.log('Example: node scripts/delete-spc-submission.js user@test.com')
      console.log('\nOr delete all SPC submissions:')
      console.log('node scripts/delete-spc-submission.js ALL')
      process.exit(1)
    }

    if (participantEmail === 'ALL') {
      console.log('⚠️  WARNING: This will delete ALL SPC submissions!')
      console.log('Are you sure? Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
      
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const result = await prisma.sPCSubmission.deleteMany({})
      console.log(`✓ Deleted ${result.count} SPC submission(s)`)
      return
    }

    console.log(`Looking for SPC submissions for: ${participantEmail}`)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: participantEmail },
      include: {
        participant: {
          include: {
            registrations: {
              include: {
                competition: true,
                spcSubmission: true
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

    // Find SPC registrations
    const spcRegistrations = user.participant.registrations.filter(reg => 
      reg.competition.type === 'SPC'
    )

    if (spcRegistrations.length === 0) {
      console.log('❌ No SPC registrations found')
      process.exit(1)
    }

    console.log(`\nFound ${spcRegistrations.length} SPC registration(s):`)
    
    let deletedCount = 0

    for (const reg of spcRegistrations) {
      console.log(`\n  Competition: ${reg.competition.name}`)
      console.log(`  Registration ID: ${reg.id}`)
      
      if (reg.spcSubmission) {
        console.log(`  Submission: "${reg.spcSubmission.judulNaskah}"`)
        console.log(`  File: ${reg.spcSubmission.fileNaskah}`)
        console.log(`  Status: ${reg.spcSubmission.status}`)
        
        // Delete submission (will cascade delete scores)
        await prisma.sPCSubmission.delete({
          where: { id: reg.spcSubmission.id }
        })
        
        console.log('  ✓ Submission deleted')
        deletedCount++
      } else {
        console.log('  ℹ No submission found')
      }
    }

    console.log(`\n✅ Deleted ${deletedCount} SPC submission(s)`)
    console.log('Peserta sekarang bisa upload ulang naskah SPC')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteSPCSubmission()
