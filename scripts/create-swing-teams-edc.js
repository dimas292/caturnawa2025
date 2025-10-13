// scripts/create-swing-teams-edc.js
// Script to create swing teams for EDC tournament

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSwingTeamsEDC() {
  console.log('🔄 Creating Swing Teams for EDC Tournament')
  console.log('=' .repeat(60))

  try {
    // Get EDC competition
    const edcCompetition = await prisma.competition.findFirst({
      where: { type: 'EDC' }
    })

    if (!edcCompetition) {
      console.error('❌ EDC competition not found!')
      console.log('Please run create-edc-tournament.js first')
      return
    }

    console.log(`✅ Found EDC competition: ${edcCompetition.name}`)

    // Configuration
    const numberOfSwingTeams = 10 // Adjust as needed
    const hashedPassword = await bcrypt.hash('swing123', 10)

    console.log(`\n📋 Creating ${numberOfSwingTeams} swing teams...`)

    for (let i = 1; i <= numberOfSwingTeams; i++) {
      const teamName = `Swing Team ${i}`
      const email = `swingteam${i}@edc.test`
      
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
          studentId: `SWING-EDC-${i.toString().padStart(3, '0')}`,
          whatsappNumber: `+62813${i.toString().padStart(8, '0')}`
        }
      })

      // Create registration for EDC
      const registration = await prisma.registration.create({
        data: {
          participantId: participant.id,
          competitionId: edcCompetition.id,
          teamName: teamName,
          status: 'VERIFIED', // Swing teams are pre-verified
          paymentPhase: 'PHASE_1',
          paymentAmount: edcCompetition.phase1Price,
          paymentCode: `SWING-EDC-${i.toString().padStart(3, '0')}`,
          paymentProofUrl: 'SWING_TEAM_NO_PAYMENT_REQUIRED',
          agreementAccepted: true,
          verifiedAt: new Date(),
          verifiedBy: 'system'
        }
      })

      // Create team members (2 speakers per team for BP debate)
      const members = [
        {
          participantId: participant.id,
          role: 'LEADER',
          position: 1,
          fullName: `${teamName} - Speaker 1`,
          email: `${email.replace('@', '+s1@')}`,
          phone: `+62813${i.toString().padStart(7, '0')}1`,
          institution: 'Swing Team',
          faculty: 'N/A',
          studentId: `SWING-EDC-${i}-S1`
        },
        {
          participantId: participant.id,
          role: 'MEMBER',
          position: 2,
          fullName: `${teamName} - Speaker 2`,
          email: `${email.replace('@', '+s2@')}`,
          phone: `+62813${i.toString().padStart(7, '0')}2`,
          institution: 'Swing Team',
          faculty: 'N/A',
          studentId: `SWING-EDC-${i}-S2`
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
    console.log(`   Competition: ${edcCompetition.name}`)
    console.log(`   Default password: swing123`)
    console.log('\n💡 Usage:')
    console.log('   - Swing teams can be used as substitute teams')
    console.log('   - They are pre-verified and ready to compete')
    console.log('   - Login with: swingteam1@edc.test / swing123')
    console.log('   - Team names: Swing Team 1, Swing Team 2, etc.')

  } catch (error) {
    console.error('❌ Error creating swing teams:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createSwingTeamsEDC()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
