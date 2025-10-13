import { PrismaClient, CompetitionType, UserRole, Gender } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // ========================================
    // STEP 1: CREATE TEST USER ACCOUNTS
    // ========================================
    console.log('\n👥 Creating test user accounts...')

    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Admin Test',
        role: UserRole.admin,
      },
      {
        email: 'judge@test.com',
        password: 'judge123',
        name: 'Judge Test',
        role: UserRole.judge,
      },
      {
        email: 'participant@test.com',
        password: 'participant123',
        name: 'Participant Test',
        role: UserRole.participant,
      },
    ]

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        })

        if (existingUser) {
          console.log(`  ⏭️  ${userData.role}: ${userData.email} (already exists)`)
          continue
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        // Create user
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            emailVerified: new Date(), // Mark as verified for testing
          },
        })

        // Create participant profile for participant user
        if (userData.role === UserRole.participant) {
          await prisma.participant.create({
            data: {
              userId: user.id,
              fullName: userData.name,
              email: userData.email,
              gender: Gender.MALE,
              whatsappNumber: '081234567890',
              institution: 'Test University',
              faculty: 'Test Faculty',
              studyProgram: 'Test Program',
              studentId: 'TEST123456',
            },
          })
          console.log(`  ✅ ${userData.role}: ${userData.email} (with participant profile)`)
        } else {
          console.log(`  ✅ ${userData.role}: ${userData.email}`)
        }
      } catch (error) {
        console.error(`  ❌ Error creating ${userData.email}:`, error)
      }
    }

    console.log('\n📋 Test Account Credentials:')
    console.log('  ┌─────────────────────────────────────────┐')
    console.log('  │ ADMIN ACCOUNT                           │')
    console.log('  │ Email:    admin@test.com                │')
    console.log('  │ Password: admin123                      │')
    console.log('  ├─────────────────────────────────────────┤')
    console.log('  │ JUDGE ACCOUNT                           │')
    console.log('  │ Email:    judge@test.com                │')
    console.log('  │ Password: judge123                      │')
    console.log('  ├─────────────────────────────────────────┤')
    console.log('  │ PARTICIPANT ACCOUNT                     │')
    console.log('  │ Email:    participant@test.com          │')
    console.log('  │ Password: participant123                │')
    console.log('  └─────────────────────────────────────────┘')

    // ========================================
    // STEP 2: CREATE COMPETITIONS
    // ========================================
    console.log('\n🏆 Creating competitions...')
    // Create Competitions with pricing and timeline
    const competitions = [
      {
        name: 'Kompetisi Debat Bahasa Indonesia',
        shortName: 'KDBI',
        type: CompetitionType.KDBI,
        category: 'debate',
        description: 'Kompetisi debat dalam Bahasa Indonesia untuk mahasiswa',
        earlyBirdPrice: 150000, // Rp 150,000
        phase1Price: 250000,    // Rp 250,000
        phase2Price: 300000,    // Rp 300,000
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-07'),
        phase1Start: new Date('2025-09-08'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-09-28'),
        workUploadDeadline: null, // No work upload for debate
        competitionDate: new Date('2025-10-15'),
        maxTeamSize: 2,
        minTeamSize: 2,
        isActive: true,
      },
      {
        name: 'English Debate Competition',
        shortName: 'EDC',
        type: CompetitionType.EDC,
        category: 'debate',
        description: 'English debate competition for university students',
        earlyBirdPrice: 150000,
        phase1Price: 250000,
        phase2Price: 300000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-07'),
        phase1Start: new Date('2025-09-08'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-09-28'),
        workUploadDeadline: null,
        competitionDate: new Date('2025-10-16'),
        maxTeamSize: 2,
        minTeamSize: 2,
        isActive: true,
      },
      {
        name: 'Scientific Paper Competition',
        shortName: 'SPC',
        type: CompetitionType.SPC,
        category: 'academic',
        description: 'Scientific paper writing competition',
        earlyBirdPrice: 115000,
        phase1Price: 135000,
        phase2Price: 150000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-07'),
        phase1Start: new Date('2025-09-08'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-09-28'),
        workUploadDeadline: new Date('2025-10-10'),
        competitionDate: new Date('2025-10-20'),
        maxTeamSize: 1,
        minTeamSize: 1,
        isActive: true,
      },
      {
        name: 'Digital Content Competition - Infografis',
        shortName: 'DCC Infografis',
        type: CompetitionType.DCC_INFOGRAFIS,
        category: 'creative',
        description: 'Infographic design competition',
        earlyBirdPrice: 50000,
        phase1Price: 65000,
        phase2Price: 75000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-07'),
        phase1Start: new Date('2025-09-08'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-09-28'),
        workUploadDeadline: new Date('2025-10-05'),
        competitionDate: new Date('2025-10-18'),
        maxTeamSize: 3,
        minTeamSize: 1,
        isActive: true,
      },
      {
        name: 'Digital Content Competition - Short Video',
        shortName: 'DCC Video',
        type: CompetitionType.DCC_SHORT_VIDEO,
        category: 'creative',
        description: 'Short video creation competition',
        earlyBirdPrice: 50000,
        phase1Price: 65000,
        phase2Price: 75000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-07'),
        phase1Start: new Date('2025-09-08'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-09-28'),
        workUploadDeadline: new Date('2025-10-08'),
        competitionDate: new Date('2025-10-19'),
        maxTeamSize: 3,
        minTeamSize: 1,
        isActive: true,
      },
    ]

    console.log(`📋 Creating ${competitions.length} competitions...`)

    for (const comp of competitions) {
      try {
        const competition = await prisma.competition.upsert({
          where: { type: comp.type },
          update: {
            // Update existing competition with new data
            name: comp.name,
            shortName: comp.shortName,
            category: comp.category,
            description: comp.description,
            earlyBirdPrice: comp.earlyBirdPrice,
            phase1Price: comp.phase1Price,
            phase2Price: comp.phase2Price,
            earlyBirdStart: comp.earlyBirdStart,
            earlyBirdEnd: comp.earlyBirdEnd,
            phase1Start: comp.phase1Start,
            phase1End: comp.phase1End,
            phase2Start: comp.phase2Start,
            phase2End: comp.phase2End,
            workUploadDeadline: comp.workUploadDeadline,
            competitionDate: comp.competitionDate,
            maxTeamSize: comp.maxTeamSize,
            minTeamSize: comp.minTeamSize,
            isActive: comp.isActive,
          },
          create: comp,
        })

        console.log(`✅ ${comp.shortName}: ${comp.name}`)

        // Create debate rounds for KDBI and EDC
        if (comp.type === CompetitionType.KDBI || comp.type === CompetitionType.EDC) {
          console.log(`  🎯 Creating debate rounds for ${comp.shortName}...`)
          
          // Preliminary rounds (4 rounds)
          for (let i = 1; i <= 4; i++) {
            await prisma.debateRound.upsert({
              where: {
                competitionId_stage_roundNumber: {
                  competitionId: competition.id,
                  stage: 'PRELIMINARY',
                  roundNumber: i,
                },
              },
              update: {},
              create: {
                competitionId: competition.id,
                stage: 'PRELIMINARY',
                roundNumber: i,
                roundName: `Preliminary Round ${i}`,
              },
            })
          }

          // Semifinal rounds (2 rounds)
          for (let i = 1; i <= 2; i++) {
            await prisma.debateRound.upsert({
              where: {
                competitionId_stage_roundNumber: {
                  competitionId: competition.id,
                  stage: 'SEMIFINAL',
                  roundNumber: i,
                },
              },
              update: {},
              create: {
                competitionId: competition.id,
                stage: 'SEMIFINAL',
                roundNumber: i,
                roundName: `Semifinal Round ${i}`,
              },
            })
          }

          // Final rounds (3 rounds)
          for (let i = 1; i <= 3; i++) {
            await prisma.debateRound.upsert({
              where: {
                competitionId_stage_roundNumber: {
                  competitionId: competition.id,
                  stage: 'FINAL',
                  roundNumber: i,
                },
              },
              update: {},
              create: {
                competitionId: competition.id,
                stage: 'FINAL',
                roundNumber: i,
                roundName: `Final Round ${i}`,
              },
            })
          }
          
          console.log(`  🎯 Debate rounds created for ${comp.shortName}`)
        }

      } catch (error) {
        console.error(`❌ Error creating ${comp.shortName}:`, error)
        throw error
      }
    }

    console.log('\n🎉 Database seed completed successfully!')
    console.log('\n📅 Timeline Summary:')
    console.log('  Early Bird: 1-7 September 2025')
    console.log('  Phase 1: 8-19 September 2025')
    console.log('  Phase 2: 20-28 September 2025')
    console.log('\n🔐 You can now login with the test accounts above!')
    console.log('   Visit: https://tes.caturnawa.tams.my.id/auth/signin')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('💥 Fatal error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  })