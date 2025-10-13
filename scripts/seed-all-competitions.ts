import { PrismaClient, Gender, CompetitionType, PaymentPhase } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  step: string
  status: 'SUCCESS' | 'FAIL' | 'WARN'
  message: string
}

const results: TestResult[] = []

function logResult(step: string, status: 'SUCCESS' | 'FAIL' | 'WARN', message: string) {
  results.push({ step, status, message })
  const icon = status === 'SUCCESS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} ${step}: ${message}`)
}

async function createEDCTestData() {
  console.log('\n' + '='.repeat(70))
  console.log('CREATING EDC (English Debate Competition) TEST DATA')
  console.log('='.repeat(70) + '\n')

  const edcComp = await prisma.competition.findFirst({
    where: { type: CompetitionType.EDC }
  })

  if (!edcComp) {
    logResult('EDC Competition', 'FAIL', 'EDC competition not found in database')
    return
  }

  // Create EDC participants
  const edcParticipants = []
  for (let i = 0; i < 8; i++) {
    const email = `edc.participant${i + 1}@test.com`
    
    const existing = await prisma.participant.findFirst({ where: { email } })
    if (existing) {
      edcParticipants.push(existing)
      continue
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: `EDC Participant ${i + 1}`,
        role: 'participant',
        emailVerified: new Date()
      }
    })

    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        fullName: `EDC Participant ${i + 1}`,
        email,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        whatsappNumber: '08123456789',
        institution: `University ${i + 1}`,
        faculty: 'Faculty of Letters',
        studyProgram: 'English Literature',
        studentId: `EDC${1000 + i}`,
      }
    })

    edcParticipants.push(participant)
  }

  logResult('EDC Participants', 'SUCCESS', `Created ${edcParticipants.length} participants`)

  // Create EDC teams
  let teamCount = 0
  for (let i = 0; i < 4; i++) {
    const p1 = edcParticipants[i * 2]
    const p2 = edcParticipants[i * 2 + 1]

    const existing = await prisma.registration.findFirst({
      where: {
        competitionId: edcComp.id,
        teamName: `EDC Team ${i + 1}`
      }
    })

    if (existing) continue

    await prisma.registration.create({
      data: {
        competition: { connect: { id: edcComp.id } },
        participant: { connect: { id: p1.id } },
        teamName: `EDC Team ${i + 1}`,
        status: 'VERIFIED',
        paymentPhase: PaymentPhase.EARLY_BIRD,
        paymentAmount: 200000,
        paymentProofUrl: 'test-payment.jpg',
        agreementAccepted: true,
        teamMembers: {
          create: [
            {
              participantId: p1.id,
              role: 'LEADER',
              position: 1,
              fullName: p1.fullName,
              email: p1.email,
              phone: '08123456789',
              institution: p1.institution,
              faculty: p1.faculty,
              studentId: p1.studentId,
            },
            {
              participantId: p2.id,
              role: 'MEMBER',
              position: 2,
              fullName: p2.fullName,
              email: p2.email,
              phone: '08123456789',
              institution: p2.institution,
              faculty: p2.faculty,
              studentId: p2.studentId,
            }
          ]
        }
      }
    })
    teamCount++
  }

  logResult('EDC Teams', 'SUCCESS', `Created ${teamCount} teams`)
}

async function createSPCTestData() {
  console.log('\n' + '='.repeat(70))
  console.log('CREATING SPC (Speech Competition) TEST DATA')
  console.log('='.repeat(70) + '\n')

  const spcComp = await prisma.competition.findFirst({
    where: { type: CompetitionType.SPC }
  })

  if (!spcComp) {
    logResult('SPC Competition', 'FAIL', 'SPC competition not found in database')
    return
  }

  // Create SPC participants (individual competition)
  let participantCount = 0
  for (let i = 0; i < 6; i++) {
    const email = `spc.participant${i + 1}@test.com`
    
    const existing = await prisma.participant.findFirst({ where: { email } })
    if (existing) {
      const existingReg = await prisma.registration.findFirst({
        where: { competitionId: spcComp.id, participantId: existing.id }
      })
      if (existingReg) continue
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: `SPC Speaker ${i + 1}`,
        role: 'participant',
        emailVerified: new Date()
      }
    })

    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        fullName: `SPC Speaker ${i + 1}`,
        email,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        whatsappNumber: '08123456789',
        institution: `University ${i + 1}`,
        faculty: 'Faculty of Communication',
        studyProgram: 'Public Speaking',
        studentId: `SPC${2000 + i}`,
      }
    })

    await prisma.registration.create({
      data: {
        competition: { connect: { id: spcComp.id } },
        participant: { connect: { id: participant.id } },
        teamName: `Speaker ${i + 1}`,
        status: 'VERIFIED',
        paymentPhase: PaymentPhase.EARLY_BIRD,
        paymentAmount: 150000,
        paymentProofUrl: 'test-payment.jpg',
        agreementAccepted: true,
        teamMembers: {
          create: {
            participantId: participant.id,
            role: 'LEADER',
            position: 1,
            fullName: participant.fullName,
            email: participant.email,
            phone: '08123456789',
            institution: participant.institution,
            faculty: participant.faculty,
            studentId: participant.studentId,
          }
        }
      }
    })
    participantCount++
  }

  logResult('SPC Participants', 'SUCCESS', `Created ${participantCount} individual registrations`)
}

async function createDCCTestData() {
  console.log('\n' + '='.repeat(70))
  console.log('CREATING DCC (Design Competition) TEST DATA')
  console.log('='.repeat(70) + '\n')

  const dccInfografis = await prisma.competition.findFirst({
    where: { type: CompetitionType.DCC_INFOGRAFIS }
  })

  const dccVideo = await prisma.competition.findFirst({
    where: { type: CompetitionType.DCC_SHORT_VIDEO }
  })

  // Create DCC Infografis participants
  if (dccInfografis) {
    let count = 0
    for (let i = 0; i < 4; i++) {
      const email = `dcc.infografis${i + 1}@test.com`
      
      const existing = await prisma.participant.findFirst({ where: { email } })
      if (existing) {
        const existingReg = await prisma.registration.findFirst({
          where: { competitionId: dccInfografis.id, participantId: existing.id }
        })
        if (existingReg) continue
      }

      const user = await prisma.user.create({
        data: {
          email,
          name: `Infografis Designer ${i + 1}`,
          role: 'participant',
          emailVerified: new Date()
        }
      })

      const participant = await prisma.participant.create({
        data: {
          userId: user.id,
          fullName: `Infografis Designer ${i + 1}`,
          email,
          gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
          whatsappNumber: '08123456789',
          institution: `Design School ${i + 1}`,
          faculty: 'Faculty of Design',
          studyProgram: 'Visual Communication Design',
          studentId: `INF${3000 + i}`,
        }
      })

      await prisma.registration.create({
        data: {
          competition: { connect: { id: dccInfografis.id } },
          participant: { connect: { id: participant.id } },
          teamName: `Infografis ${i + 1}`,
          status: 'VERIFIED',
          paymentPhase: PaymentPhase.EARLY_BIRD,
          paymentAmount: 100000,
          paymentProofUrl: 'test-payment.jpg',
          agreementAccepted: true,
          teamMembers: {
            create: {
              participantId: participant.id,
              role: 'LEADER',
              position: 1,
              fullName: participant.fullName,
              email: participant.email,
              phone: '08123456789',
              institution: participant.institution,
              faculty: participant.faculty,
              studentId: participant.studentId,
            }
          }
        }
      })
      count++
    }
    logResult('DCC Infografis', 'SUCCESS', `Created ${count} registrations`)
  }

  // Create DCC Short Video participants
  if (dccVideo) {
    let count = 0
    for (let i = 0; i < 4; i++) {
      const email = `dcc.video${i + 1}@test.com`
      
      const existing = await prisma.participant.findFirst({ where: { email } })
      if (existing) {
        const existingReg = await prisma.registration.findFirst({
          where: { competitionId: dccVideo.id, participantId: existing.id }
        })
        if (existingReg) continue
      }

      const user = await prisma.user.create({
        data: {
          email,
          name: `Video Creator ${i + 1}`,
          role: 'participant',
          emailVerified: new Date()
        }
      })

      const participant = await prisma.participant.create({
        data: {
          userId: user.id,
          fullName: `Video Creator ${i + 1}`,
          email,
          gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
          whatsappNumber: '08123456789',
          institution: `Film School ${i + 1}`,
          faculty: 'Faculty of Film',
          studyProgram: 'Film Production',
          studentId: `VID${4000 + i}`,
        }
      })

      await prisma.registration.create({
        data: {
          competition: { connect: { id: dccVideo.id } },
          participant: { connect: { id: participant.id } },
          teamName: `Video ${i + 1}`,
          status: 'VERIFIED',
          paymentPhase: PaymentPhase.EARLY_BIRD,
          paymentAmount: 100000,
          paymentProofUrl: 'test-payment.jpg',
          agreementAccepted: true,
          teamMembers: {
            create: {
              participantId: participant.id,
              role: 'LEADER',
              position: 1,
              fullName: participant.fullName,
              email: participant.email,
              phone: '08123456789',
              institution: participant.institution,
              faculty: participant.faculty,
              studentId: participant.studentId,
            }
          }
        }
      })
      count++
    }
    logResult('DCC Short Video', 'SUCCESS', `Created ${count} registrations`)
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('ALL COMPETITIONS TEST DATA - SUMMARY')
  console.log('='.repeat(70) + '\n')

  const success = results.filter(r => r.status === 'SUCCESS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const total = results.length

  console.log(`Total Operations: ${total}`)
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`\nSuccess Rate: ${((success / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n❌ FAILED OPERATIONS:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.step}: ${r.message}`)
    })
  }
}

async function main() {
  console.log('🧪 CREATING TEST DATA FOR ALL COMPETITIONS')
  console.log('KDBI, EDC, SPC, DCC_INFOGRAFIS, DCC_SHORT_VIDEO\n')

  await createEDCTestData()
  await createSPCTestData()
  await createDCCTestData()
  await generateReport()

  console.log('\n✅ All competitions test data creation complete!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

