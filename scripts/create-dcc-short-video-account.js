const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Data akun yang akan dibuat
const email = process.argv[2]
const name = process.argv[3] || 'Test DCC User'
const password = process.argv[4] || 'password123'

async function createDCCShortVideoAccount() {
  try {
    if (!email) {
      console.log('Usage: node scripts/create-dcc-short-video-account.js <email> [name] [password]')
      console.log('Example: node scripts/create-dcc-short-video-account.js testdcc@example.com "John Doe" "password123"')
      console.log('\nDefault password: password123')
      process.exit(1)
    }

    console.log(`Creating DCC Short Video account for: ${email}`)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ User with this email already exists')
      console.log('Use a different email or delete the existing user first')
      process.exit(1)
    }

    // Find DCC Short Video competition
    const dccCompetition = await prisma.competition.findFirst({
      where: { type: 'DCC_SHORT_VIDEO' }
    })

    if (!dccCompetition) {
      console.log('❌ DCC Short Video competition not found in database')
      process.exit(1)
    }

    console.log(`✓ Found competition: ${dccCompetition.name}`)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with participant and registration in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'participant',
          emailVerified: new Date()
        }
      })

      // Create participant
      const participant = await tx.participant.create({
        data: {
          userId: user.id,
          email: email,
          fullName: name,
          whatsappNumber: '081234567890',
          gender: 'MALE',
          institution: 'Test Institution',
          fullAddress: 'Test Address, Test City, Test Province'
        }
      })

      // Create registration for DCC Short Video
      const registration = await tx.registration.create({
        data: {
          participantId: participant.id,
          competitionId: dccCompetition.id,
          status: 'VERIFIED',
          paymentPhase: 'EARLY_BIRD',
          paymentAmount: dccCompetition.earlyBirdPrice,
          paymentProofUrl: 'test-payment-proof.jpg',
          agreementAccepted: true,
          verifiedAt: new Date()
        }
      })

      return { user, participant, registration }
    })

    console.log('\n✅ DCC Short Video account created successfully!')
    console.log('\n📋 Account Details:')
    console.log(`  User ID: ${result.user.id}`)
    console.log(`  Email: ${result.user.email}`)
    console.log(`  Name: ${result.user.name}`)
    console.log(`  Password: ${password}`)
    console.log(`  Role: ${result.user.role}`)
    console.log('\n👤 Participant Details:')
    console.log(`  Participant ID: ${result.participant.id}`)
    console.log(`  Full Name: ${result.participant.fullName}`)
    console.log('\n📝 Registration Details:')
    console.log(`  Registration ID: ${result.registration.id}`)
    console.log(`  Competition: ${dccCompetition.name}`)
    console.log(`  Status: ${result.registration.status}`)
    console.log(`  Payment Status: ${result.registration.paymentStatus}`)
    console.log('\n🎬 Next Steps:')
    console.log(`  1. Login dengan email: ${email}`)
    console.log(`  2. Password: ${password}`)
    console.log(`  3. Buka menu "Upload DCC Work"`)
    console.log(`  4. Pilih tab "DCC Short Video"`)
    console.log(`  5. Upload karya video`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDCCShortVideoAccount()
