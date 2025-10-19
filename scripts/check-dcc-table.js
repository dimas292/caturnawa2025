const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDCCTable() {
  try {
    console.log('=== Checking DCCSubmission Table ===\n')

    // Try to query DCCSubmission table
    try {
      const count = await prisma.dCCSubmission.count()
      console.log('✓ DCCSubmission table exists')
      console.log(`  Total submissions: ${count}`)

      const submissions = await prisma.dCCSubmission.findMany({
        include: {
          registration: {
            include: {
              participant: {
                include: {
                  user: true
                }
              },
              competition: true
            }
          }
        }
      })

      console.log('\nSubmissions:')
      submissions.forEach(sub => {
        console.log(`- ${sub.judulKarya}`)
        console.log(`  User: ${sub.registration.participant.user.email}`)
        console.log(`  Competition: ${sub.registration.competition.type}`)
        console.log(`  Status: ${sub.status}`)
      })

    } catch (error) {
      console.log('❌ DCCSubmission table does NOT exist or has issues')
      console.log('Error:', error.message)
      
      // Check if we need to create migration
      console.log('\n=== Solution ===')
      console.log('Run one of these commands:')
      console.log('1. npx prisma migrate dev --name add_dcc_submission')
      console.log('2. npx prisma db push (for development)')
    }

    // Also check SPCSubmission for comparison
    try {
      const spcCount = await prisma.sPCSubmission.count()
      console.log('\n✓ SPCSubmission table exists')
      console.log(`  Total submissions: ${spcCount}`)
    } catch (error) {
      console.log('\n❌ SPCSubmission table also does NOT exist')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDCCTable()
