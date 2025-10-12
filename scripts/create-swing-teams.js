// scripts/create-swing-teams.js
// Script to create swing teams for KDBI tournament

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSwingTeams() {
  console.log('🔄 Creating Swing Teams for KDBI Tournament')
  console.log('=' .repeat(60))

  try {
    // Get KDBI competition
    const kdbiCompetition = await prisma.competition.findFirst({
      where: { type: 'KDBI' }
    })

    if (!kdbiCompetition) {
      console.error('❌ KDBI competition not found!')
      console.log('Please run create-kdbi-tournament.js first')
      return
    }

    console.log(`✅ Found KDBI competition: ${kdbiCompetition.name}`)

    // Configuration
    const numberOfSwingTeams = 10 // Adjust as needed
    const hashedPassword = await bcrypt.hash('swing123', 10)

    console.log(`\n📋 Creating ${numberOfSwingTeams} swing teams...`)

    for (let i = 1; i <= numberOfSwingTeams; i++) {
      const teamName = `Swing Team ${i}`
      const email = `swingteam${i}@kdbi.test`
      
      console.log(`\n🔄 Creating ${teamName}...`)

      // Check if swing team already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        console.log(`⚠️  ${teamName} already exists (${email}), skipping...`)
        continue
      }

      // Create user account for swing team
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: teamName,
          role: 'participant'
        }
      })

      // Create participant profile
      const participant = await prisma.participant.create({
        data: {
          userId: user.id,
          fullName: teamName,
          email: email,
          gender: 'MALE',
          institution: 'Swing Team',
          faculty: 'N/A',
          studyProgram: 'N/A',
          studentId: `SWING-${i.toString().padStart(3, '0')}`,
          whatsappNumber: `+62812${i.toString().padStart(8, '0')}`,
          isLeader: true
        }
      })

      // Create registration for KDBI
      const registration = await prisma.registration.create({
        data: {
          participantId: participant.id,
          competitionId: kdbiCompetition.id,
          teamName: teamName,
          status: 'VERIFIED', // Swing teams are pre-verified
          paymentPhase: 'EARLY_BIRD',
          paymentProof: 'SWING_TEAM_NO_PAYMENT_REQUIRED',
          hasTeamMembers: true
        }
      })

      // Create team members (2 speakers per team for BP debate)
      const members = [
        {
          fullName: `${teamName} - Speaker 1`,
          institution: 'Swing Team Pool',
          faculty: 'N/A',
          studyProgram: 'N/A',
          studentId: `SWING-${i}-S1`,
          whatsappNumber: `+62812${i.toString().padStart(7, '0')}1`
        },
        {
          fullName: `${teamName} - Speaker 2`,
          institution: 'Swing Team Pool',
          faculty: 'N/A',
          studyProgram: 'N/A',
          studentId: `SWING-${i}-S2`,
          whatsappNumber: `+62812${i.toString().padStart(7, '0')}2`
        }
      ]

      for (const memberData of members) {
        await prisma.teamMember.create({
          data: {
            registrationId: registration.id,
            ...memberData
          }
        })
      }

      // Create team standing entry
      await prisma.teamStanding.create({
        data: {
          registrationId: registration.id,
          teamPoints: 0,
          speakerPoints: 0,
          averageSpeakerPoints: 0,
          matchesPlayed: 0,
          avgPosition: 0,
          firstPlaces: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
          fourthPlaces: 0,
          // Stage-specific fields
          prelimTeamPoints: 0,
          prelimSpeakerPoints: 0,
          prelimAvgPosition: 0,
          semifinalTeamPoints: 0,
          semifinalSpeakerPoints: 0,
          semifinalAvgPosition: 0,
          finalTeamPoints: 0,
          finalSpeakerPoints: 0,
          finalAvgPosition: 0
        }
      })

      console.log(`✅ Created ${teamName}`)
      console.log(`   📧 Email: ${email}`)
      console.log(`   🔑 Password: swing123`)
      console.log(`   👥 Members: 2 speakers`)
      console.log(`   ✓ Status: VERIFIED`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Swing teams creation completed!')
    console.log('\n📊 Summary:')
    console.log(`   Total swing teams created: ${numberOfSwingTeams}`)
    console.log(`   Competition: ${kdbiCompetition.name}`)
    console.log(`   Default password: swing123`)
    console.log('\n💡 Usage:')
    console.log('   - Swing teams can be used as substitute teams')
    console.log('   - They are pre-verified and ready to compete')
    console.log('   - Login with: swingteam1@kdbi.test / swing123')
    console.log('   - Team names: Swing Team 1, Swing Team 2, etc.')

  } catch (error) {
    console.error('❌ Error creating swing teams:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createSwingTeams()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
