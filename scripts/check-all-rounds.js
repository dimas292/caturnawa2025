const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAllRounds() {
  try {
    // Check KDBI
    const kdbi = await prisma.competition.findFirst({ 
      where: { type: 'KDBI' },
      include: {
        rounds: {
          orderBy: [
            { stage: 'asc' },
            { roundNumber: 'asc' },
            { session: 'asc' }
          ],
          include: {
            matches: true
          }
        }
      }
    })

    // Check EDC
    const edc = await prisma.competition.findFirst({ 
      where: { type: 'EDC' },
      include: {
        rounds: {
          orderBy: [
            { stage: 'asc' },
            { roundNumber: 'asc' },
            { session: 'asc' }
          ],
          include: {
            matches: true
          }
        }
      }
    })

    console.log('═══════════════════════════════════════════════')
    console.log('📊 KDBI ROUNDS')
    console.log('═══════════════════════════════════════════════')
    if (kdbi && kdbi.rounds.length > 0) {
      kdbi.rounds.forEach(r => {
        console.log(`Round ${r.roundNumber} Sesi ${r.session} | ${r.stage}`)
        console.log(`  Name: "${r.roundName}"`)
        console.log(`  ID: ${r.id}`)
        console.log(`  Matches: ${r.matches.length}`)
        console.log(`  Motion: ${r.motion || '(none)'}`)
        console.log('')
      })
    } else {
      console.log('Tidak ada rounds\n')
    }

    console.log('═══════════════════════════════════════════════')
    console.log('📊 EDC ROUNDS')
    console.log('═══════════════════════════════════════════════')
    if (edc && edc.rounds.length > 0) {
      edc.rounds.forEach(r => {
        console.log(`Round ${r.roundNumber} Sesi ${r.session} | ${r.stage}`)
        console.log(`  Name: "${r.roundName}"`)
        console.log(`  ID: ${r.id}`)
        console.log(`  Matches: ${r.matches.length}`)
        console.log(`  Motion: ${r.motion || '(none)'}`)
        console.log('')
      })
    } else {
      console.log('Tidak ada rounds\n')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkAllRounds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
