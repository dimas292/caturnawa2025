import { PrismaClient, Gender, CompetitionType, PaymentPhase } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  step: string
  status: 'SUCCESS' | 'FAIL' | 'WARN'
  message: string
  data?: any
}

const results: TestResult[] = []

function logResult(step: string, status: 'SUCCESS' | 'FAIL' | 'WARN', message: string, data?: any) {
  results.push({ step, status, message, data })
  const icon = status === 'SUCCESS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} ${step}: ${message}`)
  if (data) {
    console.log(`   Data:`, JSON.stringify(data, null, 2))
  }
}

async function createTestParticipants() {
  console.log('\n' + '='.repeat(70))
  console.log('STEP 1: CREATE TEST PARTICIPANTS')
  console.log('='.repeat(70) + '\n')

  const testParticipants = [
    { fullName: 'Ahmad Rizki', email: 'ahmad.rizki@test.com', institution: 'Universitas Indonesia', gender: Gender.MALE },
    { fullName: 'Siti Nurhaliza', email: 'siti.nur@test.com', institution: 'Universitas Indonesia', gender: Gender.FEMALE },
    { fullName: 'Budi Santoso', email: 'budi.santoso@test.com', institution: 'Institut Teknologi Bandung', gender: Gender.MALE },
    { fullName: 'Dewi Lestari', email: 'dewi.lestari@test.com', institution: 'Institut Teknologi Bandung', gender: Gender.FEMALE },
    { fullName: 'Eko Prasetyo', email: 'eko.prasetyo@test.com', institution: 'Universitas Gadjah Mada', gender: Gender.MALE },
    { fullName: 'Fitri Handayani', email: 'fitri.handayani@test.com', institution: 'Universitas Gadjah Mada', gender: Gender.FEMALE },
    { fullName: 'Gilang Ramadhan', email: 'gilang.ramadhan@test.com', institution: 'Universitas Airlangga', gender: Gender.MALE },
    { fullName: 'Hani Kusuma', email: 'hani.kusuma@test.com', institution: 'Universitas Airlangga', gender: Gender.FEMALE },
    { fullName: 'Irfan Hakim', email: 'irfan.hakim@test.com', institution: 'Universitas Brawijaya', gender: Gender.MALE },
    { fullName: 'Jasmine Putri', email: 'jasmine.putri@test.com', institution: 'Universitas Brawijaya', gender: Gender.FEMALE },
    { fullName: 'Krisna Wijaya', email: 'krisna.wijaya@test.com', institution: 'Universitas Diponegoro', gender: Gender.MALE },
    { fullName: 'Laila Sari', email: 'laila.sari@test.com', institution: 'Universitas Diponegoro', gender: Gender.FEMALE },
    { fullName: 'Muhammad Fajar', email: 'muhammad.fajar@test.com', institution: 'Universitas Padjadjaran', gender: Gender.MALE },
    { fullName: 'Nadia Putri', email: 'nadia.putri@test.com', institution: 'Universitas Padjadjaran', gender: Gender.FEMALE },
    { fullName: 'Omar Abdullah', email: 'omar.abdullah@test.com', institution: 'Universitas Hasanuddin', gender: Gender.MALE },
    { fullName: 'Putri Ayu', email: 'putri.ayu@test.com', institution: 'Universitas Hasanuddin', gender: Gender.FEMALE },
  ]

  const createdParticipants = []

  for (const p of testParticipants) {
    try {
      // Check if participant already exists
      const existing = await prisma.participant.findFirst({
        where: { email: p.email }
      })

      if (existing) {
        logResult('Create participant', 'WARN', `Participant ${p.fullName} already exists`, { id: existing.id })
        createdParticipants.push(existing)
        continue
      }

      // Create user first
      const user = await prisma.user.create({
        data: {
          email: p.email,
          name: p.fullName,
          role: 'participant',
          emailVerified: new Date()
        }
      })

      // Create participant
      const participant = await prisma.participant.create({
        data: {
          userId: user.id,
          fullName: p.fullName,
          email: p.email,
          gender: p.gender,
          whatsappNumber: '08123456789',
          institution: p.institution,
          faculty: 'Fakultas Ilmu Sosial dan Ilmu Politik',
          studyProgram: 'Ilmu Komunikasi',
          studentId: `STU${Math.floor(Math.random() * 100000)}`,
        }
      })

      createdParticipants.push(participant)
      logResult('Create participant', 'SUCCESS', `Created ${p.fullName}`, { id: participant.id })
    } catch (error: any) {
      logResult('Create participant', 'FAIL', `Failed to create ${p.fullName}: ${error.message}`)
    }
  }

  return createdParticipants
}

async function createTestTeams(participants: any[]) {
  console.log('\n' + '='.repeat(70))
  console.log('STEP 2: CREATE TEST KDBI TEAMS')
  console.log('='.repeat(70) + '\n')

  // Get KDBI competition
  const kdbiComp = await prisma.competition.findFirst({
    where: { type: CompetitionType.KDBI }
  })

  if (!kdbiComp) {
    logResult('Get KDBI competition', 'FAIL', 'KDBI competition not found')
    return []
  }

  logResult('Get KDBI competition', 'SUCCESS', `Found: ${kdbiComp.name}`, { id: kdbiComp.id })

  // Create 8 teams (2 participants each)
  const teams = []
  for (let i = 0; i < 8; i++) {
    const p1 = participants[i * 2]
    const p2 = participants[i * 2 + 1]

    if (!p1 || !p2) {
      logResult('Create team', 'WARN', `Not enough participants for team ${i + 1}`)
      continue
    }

    try {
      // Check if registration already exists
      const existing = await prisma.registration.findFirst({
        where: {
          competitionId: kdbiComp.id,
          teamName: `Team ${p1.institution.split(' ')[1] || i + 1}`
        }
      })

      if (existing) {
        logResult('Create team', 'WARN', `Team already exists`, { teamName: existing.teamName })
        teams.push(existing)
        continue
      }

      const registration = await prisma.registration.create({
        data: {
          competition: {
            connect: { id: kdbiComp.id }
          },
          participant: {
            connect: { id: p1.id }
          },
          teamName: `Team ${p1.institution.split(' ')[1] || i + 1}`,
          status: 'VERIFIED',
          paymentPhase: PaymentPhase.EARLY_BIRD,
          paymentAmount: 200000,
          paymentProofUrl: 'test-payment-proof.jpg',
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
        },
        include: {
          teamMembers: true
        }
      })

      teams.push(registration)
      logResult('Create team', 'SUCCESS', `Created ${registration.teamName}`, { 
        id: registration.id,
        members: registration.teamMembers.length
      })
    } catch (error: any) {
      logResult('Create team', 'FAIL', `Failed to create team ${i + 1}: ${error.message}`)
    }
  }

  return teams
}

async function createTestMatches(teams: any[]) {
  console.log('\n' + '='.repeat(70))
  console.log('STEP 3: CREATE TEST MATCHES')
  console.log('='.repeat(70) + '\n')

  // Get KDBI Preliminary Round 1 Session 1
  const round = await prisma.debateRound.findFirst({
    where: {
      competition: { type: CompetitionType.KDBI },
      stage: 'PRELIMINARY',
      roundNumber: 1,
      session: 1
    }
  })

  if (!round) {
    logResult('Get round', 'FAIL', 'KDBI Preliminary Round 1 Session 1 not found')
    return []
  }

  logResult('Get round', 'SUCCESS', `Found: ${round.roundName}`, { id: round.id })

  // Create 2 matches (4 teams each)
  const matches = []
  for (let i = 0; i < 2; i++) {
    const team1 = teams[i * 4]
    const team2 = teams[i * 4 + 1]
    const team3 = teams[i * 4 + 2]
    const team4 = teams[i * 4 + 3]

    if (!team1 || !team2 || !team3 || !team4) {
      logResult('Create match', 'WARN', `Not enough teams for match ${i + 1}`)
      continue
    }

    try {
      // Check if match already exists
      const existing = await prisma.debateMatch.findFirst({
        where: {
          roundId: round.id,
          matchNumber: i + 1
        }
      })

      if (existing) {
        logResult('Create match', 'WARN', `Match ${i + 1} already exists`, { id: existing.id })
        matches.push(existing)
        continue
      }

      const match = await prisma.debateMatch.create({
        data: {
          roundId: round.id,
          matchNumber: i + 1,
          matchFormat: 'BP',
          team1Id: team1.id,
          team2Id: team2.id,
          team3Id: team3.id,
          team4Id: team4.id,
          scheduledAt: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Tomorrow, day after, etc.
          updatedAt: new Date()
        },
        include: {
          team1: true,
          team2: true,
          team3: true,
          team4: true
        }
      })

      matches.push(match)
      logResult('Create match', 'SUCCESS', `Created Match ${i + 1}`, {
        id: match.id,
        teams: [team1.teamName, team2.teamName, team3.teamName, team4.teamName]
      })
    } catch (error: any) {
      logResult('Create match', 'FAIL', `Failed to create match ${i + 1}: ${error.message}`)
    }
  }

  return matches
}

async function assignJudgeToMatches(matches: any[]) {
  console.log('\n' + '='.repeat(70))
  console.log('STEP 4: ASSIGN JUDGE TO MATCHES')
  console.log('='.repeat(70) + '\n')

  // Get test judge user
  const judge = await prisma.user.findFirst({
    where: { email: 'judge@test.com' }
  })

  if (!judge) {
    logResult('Get judge', 'FAIL', 'Test judge account not found')
    return
  }

  logResult('Get judge', 'SUCCESS', `Found: ${judge.name}`, { id: judge.id })

  for (const match of matches) {
    try {
      const updated = await prisma.debateMatch.update({
        where: { id: match.id },
        data: { judgeId: judge.id },
        include: { judge: true }
      })

      logResult('Assign judge', 'SUCCESS', `Assigned ${judge.name} to Match ${match.matchNumber}`, {
        matchId: match.id,
        judgeId: judge.id
      })
    } catch (error: any) {
      logResult('Assign judge', 'FAIL', `Failed to assign judge to match ${match.matchNumber}: ${error.message}`)
    }
  }
}

async function testFrozenRounds() {
  console.log('\n' + '='.repeat(70))
  console.log('STEP 5: TEST FROZEN ROUNDS FEATURE')
  console.log('='.repeat(70) + '\n')

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@test.com' }
  })

  if (!admin) {
    logResult('Get admin', 'FAIL', 'Test admin account not found')
    return
  }

  // Get a round to freeze
  const round = await prisma.debateRound.findFirst({
    where: {
      competition: { type: CompetitionType.KDBI },
      stage: 'PRELIMINARY',
      roundNumber: 1,
      session: 1
    }
  })

  if (!round) {
    logResult('Get round to freeze', 'FAIL', 'Round not found')
    return
  }

  try {
    // Freeze the round
    const frozen = await prisma.debateRound.update({
      where: { id: round.id },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
        frozenBy: admin.id
      }
    })

    logResult('Freeze round', 'SUCCESS', `Froze ${frozen.roundName}`, {
      isFrozen: frozen.isFrozen,
      frozenAt: frozen.frozenAt,
      frozenBy: frozen.frozenBy
    })

    // Try to modify frozen round (should fail or be prevented)
    try {
      await prisma.debateRound.update({
        where: { id: round.id },
        data: { motion: 'Test motion - should not update if frozen' }
      })
      logResult('Modify frozen round', 'WARN', 'Frozen round was modified (no protection in place)')
    } catch (error: any) {
      logResult('Modify frozen round', 'SUCCESS', 'Frozen round modification prevented (as expected)')
    }

    // Unfreeze the round
    const unfrozen = await prisma.debateRound.update({
      where: { id: round.id },
      data: {
        isFrozen: false,
        frozenAt: null,
        frozenBy: null
      }
    })

    logResult('Unfreeze round', 'SUCCESS', `Unfroze ${unfrozen.roundName}`, {
      isFrozen: unfrozen.isFrozen
    })
  } catch (error: any) {
    logResult('Frozen rounds test', 'FAIL', `Error: ${error.message}`)
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('TEST DATA CREATION - SUMMARY REPORT')
  console.log('='.repeat(70) + '\n')

  const success = results.filter(r => r.status === 'SUCCESS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warned = results.filter(r => r.status === 'WARN').length
  const total = results.length

  console.log(`Total Operations: ${total}`)
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warned}`)
  console.log(`\nSuccess Rate: ${((success / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n❌ FAILED OPERATIONS:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.step}: ${r.message}`)
    })
  }

  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   - ${r.step}: ${r.message}`)
    })
  }

  console.log('\n' + '='.repeat(70))
}

async function main() {
  console.log('🧪 KDBI TEST DATA CREATION')
  console.log('Creating participants, teams, matches, and testing features...\n')

  const participants = await createTestParticipants()
  const teams = await createTestTeams(participants)
  const matches = await createTestMatches(teams)
  await assignJudgeToMatches(matches)
  await testFrozenRounds()
  await generateReport()

  console.log('\n✅ Test data creation complete!')
  console.log(`Created: ${participants.length} participants, ${teams.length} teams, ${matches.length} matches`)
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

