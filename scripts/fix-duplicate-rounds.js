const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDuplicateRounds() {
  try {
    console.log('🔍 Mencari duplikat rounds...\n')

    // Find all rounds for KDBI
    const kdbi = await prisma.competition.findFirst({ 
      where: { type: 'KDBI' } 
    })

    if (!kdbi) {
      console.log('❌ KDBI competition tidak ditemukan')
      return
    }

    // Get all PRELIMINARY rounds
    const rounds = await prisma.debateRound.findMany({
      where: {
        competitionId: kdbi.id,
        stage: 'PRELIMINARY'
      },
      orderBy: [
        { roundNumber: 'asc' },
        { session: 'asc' }
      ],
      include: {
        matches: true
      }
    })

    console.log(`📊 Total rounds ditemukan: ${rounds.length}\n`)

    // Group by roundNumber to find duplicates
    const roundsByNumber = {}
    rounds.forEach(round => {
      if (!roundsByNumber[round.roundNumber]) {
        roundsByNumber[round.roundNumber] = []
      }
      roundsByNumber[round.roundNumber].push(round)
    })

    // Find and delete duplicates
    let deletedCount = 0
    for (const [roundNum, roundList] of Object.entries(roundsByNumber)) {
      if (roundList.length > 1) {
        console.log(`⚠️  Duplikat ditemukan untuk Round ${roundNum}:`)
        
        roundList.forEach(r => {
          console.log(`   - ID: ${r.id}, Name: "${r.roundName}", Session: ${r.session}, Matches: ${r.matches.length}`)
        })

        // Delete rounds that don't have "Sesi" in the name
        for (const round of roundList) {
          if (!round.roundName.includes('Sesi')) {
            console.log(`   ❌ Menghapus: "${round.roundName}" (ID: ${round.id})`)
            
            // Check if it has matches
            if (round.matches.length > 0) {
              console.log(`      ⚠️  Round ini memiliki ${round.matches.length} matches, menghapus matches terlebih dahulu...`)
              await prisma.debateMatch.deleteMany({
                where: { roundId: round.id }
              })
            }
            
            await prisma.debateRound.delete({
              where: { id: round.id }
            })
            deletedCount++
          }
        }
        console.log('')
      }
    }

    if (deletedCount === 0) {
      console.log('✅ Tidak ada duplikat yang perlu dihapus')
    } else {
      console.log(`✅ Berhasil menghapus ${deletedCount} duplikat round\n`)
    }

    // Show final state
    console.log('📋 Status akhir rounds:')
    const finalRounds = await prisma.debateRound.findMany({
      where: {
        competitionId: kdbi.id,
        stage: 'PRELIMINARY'
      },
      orderBy: [
        { roundNumber: 'asc' },
        { session: 'asc' }
      ]
    })

    finalRounds.forEach(r => {
      console.log(`   Round ${r.roundNumber} Sesi ${r.session}: "${r.roundName}"`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixDuplicateRounds()
  .then(() => {
    console.log('\n✅ Selesai!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
