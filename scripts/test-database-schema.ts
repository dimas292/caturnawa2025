import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

const results: TestResult[] = []

function addResult(name: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
  results.push({ name, status, message, details })
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} ${name}: ${message}`)
  if (details) {
    console.log(`   Details:`, details)
  }
}

async function testSchemaValidation() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 1.1: SCHEMA VALIDATION')
  console.log('='.repeat(70) + '\n')

  try {
    // Test 1: Check DebateRound has session column
    console.log('Test 1: DebateRound.session column exists')
    const debateRounds = await prisma.debateRound.findMany({ take: 1 })
    if (debateRounds.length > 0 && 'session' in debateRounds[0]) {
      addResult('DebateRound.session', 'PASS', 'Session column exists and is queryable')
    } else {
      addResult('DebateRound.session', 'WARN', 'No rounds found to verify session column')
    }

    // Test 2: Check DebateRound has frozen fields
    console.log('\nTest 2: DebateRound frozen fields exist')
    if (debateRounds.length > 0) {
      const hasIsFrozen = 'isFrozen' in debateRounds[0]
      const hasFrozenAt = 'frozenAt' in debateRounds[0]
      const hasFrozenBy = 'frozenBy' in debateRounds[0]
      
      if (hasIsFrozen && hasFrozenAt && hasFrozenBy) {
        addResult('DebateRound.frozen fields', 'PASS', 'All frozen fields exist (isFrozen, frozenAt, frozenBy)')
      } else {
        addResult('DebateRound.frozen fields', 'FAIL', 'Missing frozen fields', {
          isFrozen: hasIsFrozen,
          frozenAt: hasFrozenAt,
          frozenBy: hasFrozenBy
        })
      }
    }

    // Test 3: Check DebateMatch has judgeId
    console.log('\nTest 3: DebateMatch.judgeId column exists')
    const debateMatches = await prisma.debateMatch.findMany({ take: 1 })
    if (debateMatches.length > 0 && 'judgeId' in debateMatches[0]) {
      addResult('DebateMatch.judgeId', 'PASS', 'JudgeId column exists and is queryable')
    } else {
      addResult('DebateMatch.judgeId', 'WARN', 'No matches found to verify judgeId column')
    }

    // Test 4: Check unique constraint on DebateRound
    console.log('\nTest 4: DebateRound unique constraint with session')
    try {
      // Try to create duplicate round (should fail)
      const existingRound = await prisma.debateRound.findFirst()
      if (existingRound) {
        try {
          await prisma.debateRound.create({
            data: {
              competitionId: existingRound.competitionId,
              stage: existingRound.stage,
              roundNumber: existingRound.roundNumber,
              session: existingRound.session,
              roundName: 'Duplicate Test',
              updatedAt: new Date()
            }
          })
          addResult('Unique constraint', 'FAIL', 'Duplicate round was created (constraint not working)')
        } catch (error: any) {
          if (error.code === 'P2002') {
            addResult('Unique constraint', 'PASS', 'Unique constraint prevents duplicate rounds')
          } else {
            addResult('Unique constraint', 'WARN', 'Different error occurred', { error: error.message })
          }
        }
      } else {
        addResult('Unique constraint', 'WARN', 'No existing rounds to test constraint')
      }
    } catch (error: any) {
      addResult('Unique constraint', 'FAIL', 'Error testing constraint', { error: error.message })
    }

    // Test 5: Check default values
    console.log('\nTest 5: Default values for new columns')
    const roundWithDefaults = await prisma.debateRound.findFirst({
      where: { session: 1, isFrozen: false }
    })
    if (roundWithDefaults) {
      addResult('Default values', 'PASS', 'Default values work (session=1, isFrozen=false)')
    } else {
      addResult('Default values', 'WARN', 'Could not verify default values')
    }

  } catch (error: any) {
    addResult('Schema validation', 'FAIL', 'Critical error during schema validation', { error: error.message })
  }
}

async function testDataIntegrity() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 1.2: DATA INTEGRITY')
  console.log('='.repeat(70) + '\n')

  try {
    // Test 6: Verify test user accounts
    console.log('Test 6: Test user accounts exist')
    const testEmails = ['admin@test.com', 'judge@test.com', 'participant@test.com']
    const users = await prisma.user.findMany({
      where: { email: { in: testEmails } },
      select: { email: true, role: true, name: true }
    })

    if (users.length === 3) {
      addResult('Test users', 'PASS', `All 3 test accounts exist`, { users })
    } else {
      addResult('Test users', 'FAIL', `Only ${users.length}/3 test accounts found`, { found: users })
    }

    // Test 7: Check KDBI competition
    console.log('\nTest 7: KDBI competition exists')
    const kdbiComp = await prisma.competition.findFirst({
      where: { type: 'KDBI' }
    })
    if (kdbiComp) {
      addResult('KDBI competition', 'PASS', `KDBI competition found: ${kdbiComp.name}`)
    } else {
      addResult('KDBI competition', 'FAIL', 'KDBI competition not found')
    }

    // Test 8: Check KDBI rounds
    console.log('\nTest 8: KDBI debate rounds exist')
    const kdbiRounds = await prisma.debateRound.findMany({
      where: { competition: { type: 'KDBI' } },
      include: { competition: true }
    })
    if (kdbiRounds.length > 0) {
      addResult('KDBI rounds', 'PASS', `${kdbiRounds.length} KDBI rounds found`, {
        stages: [...new Set(kdbiRounds.map(r => r.stage))],
        sessions: [...new Set(kdbiRounds.map(r => r.session))]
      })
    } else {
      addResult('KDBI rounds', 'FAIL', 'No KDBI rounds found')
    }

    // Test 9: Check foreign key relationships
    console.log('\nTest 9: Foreign key relationships')
    const roundWithRelations = await prisma.debateRound.findFirst({
      include: {
        competition: true,
        matches: {
          include: {
            team1: true,
            team2: true,
            judge: true
          }
        }
      }
    })
    if (roundWithRelations) {
      addResult('Foreign keys', 'PASS', 'Foreign key relationships work correctly')
    } else {
      addResult('Foreign keys', 'WARN', 'No rounds with relations to test')
    }

    // Test 10: Check migrations table
    console.log('\nTest 10: Migrations table status')
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM "_prisma_migrations"
      ORDER BY finished_at DESC
      LIMIT 5
    ` as any[]
    
    if (migrations.length > 0) {
      addResult('Migrations', 'PASS', `${migrations.length} recent migrations found`, {
        latest: migrations[0].migration_name
      })
    } else {
      addResult('Migrations', 'FAIL', 'No migrations found in _prisma_migrations table')
    }

  } catch (error: any) {
    addResult('Data integrity', 'FAIL', 'Critical error during data integrity tests', { error: error.message })
  }
}

async function testQueryPerformance() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 1.3: QUERY PERFORMANCE')
  console.log('='.repeat(70) + '\n')

  try {
    // Test 11: Complex query performance (round-teams)
    console.log('Test 11: Complex query performance (round-teams with includes)')
    const startTime = Date.now()
    
    const complexQuery = await prisma.debateRound.findFirst({
      where: {
        competition: { type: 'KDBI' },
        stage: 'PRELIMINARY',
        roundNumber: 1,
        session: 1
      },
      include: {
        competition: true,
        matches: {
          include: {
            team1: { include: { teamMembers: { include: { participant: true } } } },
            team2: { include: { teamMembers: { include: { participant: true } } } },
            team3: { include: { teamMembers: { include: { participant: true } } } },
            team4: { include: { teamMembers: { include: { participant: true } } } },
            judge: { select: { id: true, name: true, email: true } }
          },
          orderBy: { matchNumber: 'asc' }
        }
      }
    })
    
    const queryTime = Date.now() - startTime
    
    if (queryTime < 1000) {
      addResult('Query performance', 'PASS', `Complex query completed in ${queryTime}ms (< 1s)`)
    } else if (queryTime < 3000) {
      addResult('Query performance', 'WARN', `Complex query took ${queryTime}ms (1-3s)`)
    } else {
      addResult('Query performance', 'FAIL', `Complex query too slow: ${queryTime}ms (> 3s)`)
    }

    // Test 12: Simple query performance
    console.log('\nTest 12: Simple query performance')
    const simpleStart = Date.now()
    await prisma.user.findMany({ take: 10 })
    const simpleTime = Date.now() - simpleStart
    
    if (simpleTime < 100) {
      addResult('Simple query', 'PASS', `Simple query completed in ${simpleTime}ms (< 100ms)`)
    } else {
      addResult('Simple query', 'WARN', `Simple query took ${simpleTime}ms`)
    }

    // Test 13: Count query performance
    console.log('\nTest 13: Count query performance')
    const countStart = Date.now()
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.competition.count(),
      prisma.debateRound.count(),
      prisma.registration.count()
    ])
    const countTime = Date.now() - countStart
    
    addResult('Count queries', 'PASS', `4 count queries in ${countTime}ms`, {
      users: counts[0],
      competitions: counts[1],
      rounds: counts[2],
      registrations: counts[3]
    })

  } catch (error: any) {
    addResult('Query performance', 'FAIL', 'Error during performance tests', { error: error.message })
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 1: DATABASE TESTING - SUMMARY REPORT')
  console.log('='.repeat(70) + '\n')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warned = results.filter(r => r.status === 'WARN').length
  const total = results.length

  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warned}`)
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`)
    })
  }

  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`)
    })
  }

  console.log('\n' + '='.repeat(70))
  
  return { passed, failed, warned, total, results }
}

async function main() {
  console.log('🧪 COMPREHENSIVE DATABASE TESTING')
  console.log('Starting Phase 1: Database Testing...\n')

  await testSchemaValidation()
  await testDataIntegrity()
  await testQueryPerformance()
  
  const report = await generateReport()
  
  // Exit with error code if tests failed
  if (report.failed > 0) {
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

