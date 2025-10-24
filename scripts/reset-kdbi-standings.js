/**
 * Reset KDBI Team Standings
 * 
 * This script resets all KDBI team standings to zero because KDBI leaderboard
 * should only count from SEMIFINAL onwards, not from PRELIMINARY rounds.
 * 
 * After running this script, the standings will be recalculated automatically
 * when judges re-submit scores for SEMIFINAL and FINAL rounds.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetKDBIStandings() {
  try {
    console.log('🔄 Starting KDBI standings reset...\n')

    // Get all KDBI registrations
    const kdbiRegistrations = await prisma.registration.findMany({
      where: {
        competition: {
          type: 'KDBI'
        },
        status: 'VERIFIED'
      },
      select: {
        id: true,
        teamName: true,
        competition: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })

    console.log(`📊 Found ${kdbiRegistrations.length} KDBI teams\n`)

    // Reset standings for all KDBI teams
    let resetCount = 0
    for (const registration of kdbiRegistrations) {
      await prisma.teamStanding.upsert({
        where: {
          registrationId: registration.id
        },
        update: {
          matchesPlayed: 0,
          teamPoints: 0,
          speakerPoints: 0,
          averageSpeakerPoints: 0,
          firstPlaces: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
          fourthPlaces: 0,
          avgPosition: 0
        },
        create: {
          registrationId: registration.id,
          matchesPlayed: 0,
          teamPoints: 0,
          speakerPoints: 0,
          averageSpeakerPoints: 0,
          firstPlaces: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
          fourthPlaces: 0,
          avgPosition: 0
        }
      })
      
      resetCount++
      console.log(`✓ Reset standings for: ${registration.teamName}`)
    }

    console.log(`\n✅ Successfully reset ${resetCount} KDBI team standings`)
    console.log('\n📝 Note: Standings will be recalculated when judges submit scores for SEMIFINAL/FINAL rounds')

  } catch (error) {
    console.error('❌ Error resetting KDBI standings:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
resetKDBIStandings()
  .then(() => {
    console.log('\n🎉 Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
