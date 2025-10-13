const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCreateRound() {
  try {
    console.log('🧪 Testing create Round 1 Sesi 2 untuk KDBI...\n')

    // Get KDBI competition
    const kdbi = await prisma.competition.findFirst({ 
      where: { type: 'KDBI' } 
    })

    if (!kdbi) {
      console.log('❌ KDBI competition tidak ditemukan')
      return
    }

    console.log(`✅ KDBI Competition ID: ${kdbi.id}\n`)

    // Check if round already exists
    const existingRound = await prisma.debateRound.findFirst({
      where: {
        competitionId: kdbi.id,
        stage: 'PRELIMINARY',
        roundNumber: 1,
        session: 2
      }
    })

    if (existingRound) {
      console.log('⚠️  Round 1 Sesi 2 sudah ada:')
      console.log(`   ID: ${existingRound.id}`)
      console.log(`   Name: "${existingRound.roundName}"`)
      console.log(`   Motion: ${existingRound.motion || '(none)'}`)
      
      const matches = await prisma.debateMatch.count({
        where: { roundId: existingRound.id }
      })
      console.log(`   Matches: ${matches}\n`)
      return
    }

    console.log('📝 Round 1 Sesi 2 belum ada, mencoba membuat...\n')

    // Try to create the round
    const newRound = await prisma.debateRound.create({
      data: {
        competitionId: kdbi.id,
        stage: 'PRELIMINARY',
        roundNumber: 1,
        session: 2,
        roundName: 'PRELIMINARY - Round 1 Sesi 2',
        motion: 'Test motion untuk Round 1 Sesi 2'
      }
    })

    console.log('✅ Berhasil membuat round:')
    console.log(`   ID: ${newRound.id}`)
    console.log(`   Name: "${newRound.roundName}"`)
    console.log(`   Motion: ${newRound.motion}\n`)

    // Create 2 matches
    console.log('📝 Membuat 2 matches...\n')
    
    await prisma.debateMatch.createMany({
      data: [
        { roundId: newRound.id, matchNumber: 1, matchFormat: 'BP' },
        { roundId: newRound.id, matchNumber: 2, matchFormat: 'BP' }
      ]
    })

    console.log('✅ Berhasil membuat 2 matches\n')

    // Verify
    const allRounds = await prisma.debateRound.findMany({
      where: {
        competitionId: kdbi.id,
        stage: 'PRELIMINARY'
      },
      orderBy: [
        { roundNumber: 'asc' },
        { session: 'asc' }
      ]
    })

    console.log('📋 Semua PRELIMINARY rounds sekarang:')
    allRounds.forEach(r => {
      console.log(`   Round ${r.roundNumber} Sesi ${r.session}: "${r.roundName}"`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testCreateRound()
  .then(() => {
    console.log('\n✅ Test selesai!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test gagal!')
    process.exit(1)
  })
