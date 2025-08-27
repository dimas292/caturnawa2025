import { PrismaClient, CompetitionType, PaymentPhase } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
          where: { email: 'admin@caturnawa.com' },
    update: {},
    create: {
              email: 'admin@caturnawa.com',
      name: 'Caturnawa Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  // Create Judge Users
  const judges = [
            { email: 'judge.kdbi@caturnawa.com', name: 'Judge KDBI' },
        { email: 'judge.edc@caturnawa.com', name: 'Judge EDC' },
        { email: 'judge.spc@caturnawa.com', name: 'Judge SPC' },
        { email: 'judge.infografis@caturnawa.com', name: 'Judge Infografis' },
        { email: 'judge.shortvideo@caturnawa.com', name: 'Judge Short Video' },
  ]

  for (const judge of judges) {
    await prisma.user.upsert({
      where: { email: judge.email },
      update: {},
      create: {
        email: judge.email,
        name: judge.name,
        password: hashedPassword,
        role: 'judge',
      },
    })
  }

  // Create Competitions with pricing and timeline
  const competitions = [
    {
      name: 'Kompetisi Debat Bahasa Indonesia',
      type: CompetitionType.KDBI,
      description: 'Kompetisi debat dalam Bahasa Indonesia untuk mahasiswa',
      earlyBirdPrice: 150000, // Rp 150,000
      phase1Price: 250000,    // Rp 250,000
      phase2Price: 300000,    // Rp 300,000
      earlyBirdStart: new Date('2025-08-25'),
      earlyBirdEnd: new Date('2025-08-31'),
      phase1Start: new Date('2025-09-01'),
      phase1End: new Date('2025-09-13'),
      phase2Start: new Date('2025-09-14'),
      phase2End: new Date('2025-09-26'),
      workUploadDeadline: null, // No work upload for debate
      competitionDate: new Date('2025-10-15'), // Example date
      maxTeamSize: 2,
      minTeamSize: 2,
    },
    {
      name: 'English Debate Competition',
      type: CompetitionType.EDC,
      description: 'English debate competition for university students',
      earlyBirdPrice: 150000,
      phase1Price: 250000,
      phase2Price: 300000,
      earlyBirdStart: new Date('2025-08-25'),
      earlyBirdEnd: new Date('2025-08-31'),
      phase1Start: new Date('2025-09-01'),
      phase1End: new Date('2025-09-13'),
      phase2Start: new Date('2025-09-14'),
      phase2End: new Date('2025-09-26'),
      workUploadDeadline: null,
      competitionDate: new Date('2025-10-16'),
      maxTeamSize: 2,
      minTeamSize: 2,
    },
    {
      name: 'Scientific Paper Competition',
      type: CompetitionType.SPC,
      description: 'Scientific paper writing competition',
      earlyBirdPrice: 115000,
      phase1Price: 135000,
      phase2Price: 150000,
      earlyBirdStart: new Date('2025-08-25'),
      earlyBirdEnd: new Date('2025-08-31'),
      phase1Start: new Date('2025-09-01'),
      phase1End: new Date('2025-09-13'),
      phase2Start: new Date('2025-09-14'),
      phase2End: new Date('2025-09-26'),
      workUploadDeadline: new Date('2025-10-10'),
      competitionDate: new Date('2025-10-20'),
      maxTeamSize: 1,
      minTeamSize: 1,
    },
    {
      name: 'Digital Content Competition - Infografis',
      type: CompetitionType.DCC_INFOGRAFIS,
      description: 'Infographic design competition',
      earlyBirdPrice: 50000,
      phase1Price: 65000,
      phase2Price: 75000,
      earlyBirdStart: new Date('2025-08-25'),
      earlyBirdEnd: new Date('2025-08-31'),
      phase1Start: new Date('2025-09-01'),
      phase1End: new Date('2025-09-13'),
      phase2Start: new Date('2025-09-14'),
      phase2End: new Date('2025-09-26'),
      workUploadDeadline: new Date('2025-10-05'),
      competitionDate: new Date('2025-10-18'),
      maxTeamSize: 3,
      minTeamSize: 1,
    },
    {
      name: 'Digital Content Competition - Short Video',
      type: CompetitionType.DCC_SHORT_VIDEO,
      description: 'Short video creation competition',
      earlyBirdPrice: 50000,
      phase1Price: 65000,
      phase2Price: 75000,
      earlyBirdStart: new Date('2025-08-25'),
      earlyBirdEnd: new Date('2025-08-31'),
      phase1Start: new Date('2025-09-01'),
      phase1End: new Date('2025-09-13'),
      phase2Start: new Date('2025-09-14'),
      phase2End: new Date('2025-09-26'),
      workUploadDeadline: new Date('2025-10-08'),
      competitionDate: new Date('2025-10-19'),
      maxTeamSize: 3,
      minTeamSize: 1,
    },
  ]

  for (const comp of competitions) {
    const competition = await prisma.competition.upsert({
      where: { type: comp.type },
      update: {},
      create: comp,
    })

    // Create debate rounds for KDBI and EDC
    if (comp.type === CompetitionType.KDBI || comp.type === CompetitionType.EDC) {
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
    }

    console.log(`✅ Created competition: ${comp.name}`)
  }

  // Create sample participant for testing
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test Participant',
      password: await bcrypt.hash('test123', 12),
      role: 'participant',
      participant: {
        create: {
          fullName: 'John Doe Test',
          gender: 'MALE',
          fullAddress: 'Jl. Test No. 123, Jakarta',
          whatsappNumber: '+628123456789',
          institution: 'Universitas Nasional',
          faculty: 'Fakultas Teknik',
          studyProgram: 'Informatika',
          studentId: '2023001',
        },
      },
    },
    include: {
      participant: true,
    },
  })

  console.log('🎯 Seed completed successfully!')
      console.log('📧 Admin: admin@caturnawa.com / admin123')
  console.log('🧪 Test Participant: test@example.com / test123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })