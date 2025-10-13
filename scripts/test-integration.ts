import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:8008'

interface TestResult {
  category: string
  test: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

const results: TestResult[] = []

function logResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
  results.push({ category, test, status, message, details })
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} [${category}] ${test}: ${message}`)
  if (details && status !== 'PASS') {
    console.log(`   Details:`, JSON.stringify(details, null, 2).substring(0, 200))
  }
}

async function testDatabaseIntegrity() {
  console.log('\n' + '='.repeat(70))
  console.log('INTEGRATION TEST 1: DATABASE INTEGRITY')
  console.log('='.repeat(70) + '\n')

  // Test 1: Verify teams are registered
  const teams = await prisma.registration.findMany({
    where: {
      competition: { type: 'KDBI' },
      status: 'VERIFIED'
    },
    include: {
      teamMembers: true
    }
  })

  if (teams.length >= 8) {
    logResult('Database', 'KDBI Teams', 'PASS', `Found ${teams.length} verified teams`)
  } else {
    logResult('Database', 'KDBI Teams', 'FAIL', `Expected >= 8 teams, found ${teams.length}`)
  }

  // Test 2: Verify team members
  const totalMembers = teams.reduce((sum, team) => sum + team.teamMembers.length, 0)
  if (totalMembers >= 16) {
    logResult('Database', 'Team Members', 'PASS', `Found ${totalMembers} team members`)
  } else {
    logResult('Database', 'Team Members', 'FAIL', `Expected >= 16 members, found ${totalMembers}`)
  }

  // Test 3: Verify matches exist
  const matches = await prisma.debateMatch.findMany({
    where: {
      round: {
        competition: { type: 'KDBI' },
        stage: 'PRELIMINARY',
        roundNumber: 1,
        session: 1
      }
    },
    include: {
      team1: true,
      team2: true,
      team3: true,
      team4: true,
      judge: true
    }
  })

  if (matches.length >= 2) {
    logResult('Database', 'Matches', 'PASS', `Found ${matches.length} matches`)
  } else {
    logResult('Database', 'Matches', 'FAIL', `Expected >= 2 matches, found ${matches.length}`)
  }

  // Test 4: Verify judge assignments
  const matchesWithJudge = matches.filter(m => m.judgeId !== null)
  if (matchesWithJudge.length === matches.length) {
    logResult('Database', 'Judge Assignments', 'PASS', `All ${matches.length} matches have judges`)
  } else {
    logResult('Database', 'Judge Assignments', 'FAIL', `${matchesWithJudge.length}/${matches.length} matches have judges`)
  }

  // Test 5: Verify all teams in matches have 4 teams (BP format)
  const matchesWithAllTeams = matches.filter(m => m.team1Id && m.team2Id && m.team3Id && m.team4Id)
  if (matchesWithAllTeams.length === matches.length) {
    logResult('Database', 'Match Teams', 'PASS', `All matches have 4 teams (BP format)`)
  } else {
    logResult('Database', 'Match Teams', 'FAIL', `${matchesWithAllTeams.length}/${matches.length} matches have all 4 teams`)
  }

  return { teams, matches }
}

async function testAPIEndpoints() {
  console.log('\n' + '='.repeat(70))
  console.log('INTEGRATION TEST 2: API ENDPOINTS WITH DATA')
  console.log('='.repeat(70) + '\n')

  // Test 1: Round-teams endpoint
  try {
    const response = await fetch(`${BASE_URL}/api/admin/kdbi/round-teams?stage=PRELIMINARY&round=1&session=1`)
    
    if (response.status === 200 || response.status === 307) {
      logResult('API', 'Round Teams Endpoint', 'PASS', `Returned ${response.status}`)
    } else {
      const text = await response.text()
      logResult('API', 'Round Teams Endpoint', 'FAIL', `Expected 200/307, got ${response.status}`, { response: text.substring(0, 200) })
    }
  } catch (error: any) {
    logResult('API', 'Round Teams Endpoint', 'FAIL', `Request failed: ${error.message}`)
  }

  // Test 2: Leaderboard endpoint
  try {
    const response = await fetch(`${BASE_URL}/api/public/leaderboard`)
    
    if (response.status === 200 || response.status === 307) {
      logResult('API', 'Leaderboard Endpoint', 'PASS', `Returned ${response.status}`)
    } else {
      logResult('API', 'Leaderboard Endpoint', 'FAIL', `Expected 200/307, got ${response.status}`)
    }
  } catch (error: any) {
    logResult('API', 'Leaderboard Endpoint', 'FAIL', `Request failed: ${error.message}`)
  }

  // Test 3: Comprehensive results endpoint
  try {
    const response = await fetch(`${BASE_URL}/api/public/comprehensive-results`)
    
    if (response.status === 200 || response.status === 307) {
      logResult('API', 'Results Endpoint', 'PASS', `Returned ${response.status}`)
    } else {
      logResult('API', 'Results Endpoint', 'FAIL', `Expected 200/307, got ${response.status}`)
    }
  } catch (error: any) {
    logResult('API', 'Results Endpoint', 'FAIL', `Request failed: ${error.message}`)
  }
}

async function testFrozenRoundsFeature() {
  console.log('\n' + '='.repeat(70))
  console.log('INTEGRATION TEST 3: FROZEN ROUNDS FEATURE')
  console.log('='.repeat(70) + '\n')

  const admin = await prisma.user.findFirst({ where: { email: 'admin@test.com' } })
  if (!admin) {
    logResult('Frozen Rounds', 'Admin User', 'FAIL', 'Admin user not found')
    return
  }

  const round = await prisma.debateRound.findFirst({
    where: {
      competition: { type: 'KDBI' },
      stage: 'PRELIMINARY',
      roundNumber: 2,
      session: 1
    }
  })

  if (!round) {
    logResult('Frozen Rounds', 'Test Round', 'FAIL', 'Round 2 not found')
    return
  }

  // Test 1: Freeze round
  try {
    const frozen = await prisma.debateRound.update({
      where: { id: round.id },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
        frozenBy: admin.id
      }
    })

    if (frozen.isFrozen && frozen.frozenAt && frozen.frozenBy === admin.id) {
      logResult('Frozen Rounds', 'Freeze Round', 'PASS', 'Round frozen successfully')
    } else {
      logResult('Frozen Rounds', 'Freeze Round', 'FAIL', 'Round freeze incomplete', { frozen })
    }

    // Test 2: Verify frozen state persists
    const refetched = await prisma.debateRound.findUnique({ where: { id: round.id } })
    if (refetched?.isFrozen) {
      logResult('Frozen Rounds', 'Frozen State Persists', 'PASS', 'Frozen state saved correctly')
    } else {
      logResult('Frozen Rounds', 'Frozen State Persists', 'FAIL', 'Frozen state not persisted')
    }

    // Test 3: Unfreeze round
    const unfrozen = await prisma.debateRound.update({
      where: { id: round.id },
      data: {
        isFrozen: false,
        frozenAt: null,
        frozenBy: null
      }
    })

    if (!unfrozen.isFrozen && !unfrozen.frozenAt && !unfrozen.frozenBy) {
      logResult('Frozen Rounds', 'Unfreeze Round', 'PASS', 'Round unfrozen successfully')
    } else {
      logResult('Frozen Rounds', 'Unfreeze Round', 'FAIL', 'Round unfreeze incomplete', { unfrozen })
    }
  } catch (error: any) {
    logResult('Frozen Rounds', 'Feature Test', 'FAIL', `Error: ${error.message}`)
  }
}

async function testJudgeAssignment() {
  console.log('\n' + '='.repeat(70))
  console.log('INTEGRATION TEST 4: JUDGE ASSIGNMENT FEATURE')
  console.log('='.repeat(70) + '\n')

  const judge = await prisma.user.findFirst({ where: { email: 'judge@test.com' } })
  if (!judge) {
    logResult('Judge Assignment', 'Judge User', 'FAIL', 'Judge user not found')
    return
  }

  // Test 1: Verify judge can be assigned to matches
  const matches = await prisma.debateMatch.findMany({
    where: {
      round: {
        competition: { type: 'KDBI' },
        stage: 'PRELIMINARY',
        roundNumber: 1,
        session: 1
      }
    }
  })

  if (matches.length === 0) {
    logResult('Judge Assignment', 'Matches Found', 'FAIL', 'No matches found')
    return
  }

  const assignedMatches = matches.filter(m => m.judgeId === judge.id)
  if (assignedMatches.length > 0) {
    logResult('Judge Assignment', 'Judge Assigned', 'PASS', `Judge assigned to ${assignedMatches.length} matches`)
  } else {
    logResult('Judge Assignment', 'Judge Assigned', 'WARN', 'Judge not assigned to any matches')
  }

  // Test 2: Verify judge relation works
  try {
    const matchWithJudge = await prisma.debateMatch.findFirst({
      where: { judgeId: judge.id },
      include: { judge: true }
    })

    if (matchWithJudge && matchWithJudge.judge) {
      logResult('Judge Assignment', 'Judge Relation', 'PASS', `Judge relation loaded: ${matchWithJudge.judge.name}`)
    } else {
      logResult('Judge Assignment', 'Judge Relation', 'WARN', 'No match with judge found')
    }
  } catch (error: any) {
    logResult('Judge Assignment', 'Judge Relation', 'FAIL', `Error: ${error.message}`)
  }
}

async function testSessionManagement() {
  console.log('\n' + '='.repeat(70))
  console.log('INTEGRATION TEST 5: SESSION MANAGEMENT')
  console.log('='.repeat(70) + '\n')

  // Test 1: Verify session column exists and works
  try {
    const rounds = await prisma.debateRound.findMany({
      where: {
        competition: { type: 'KDBI' },
        stage: 'PRELIMINARY',
        roundNumber: 1
      },
      orderBy: { session: 'asc' }
    })

    if (rounds.length > 0) {
      logResult('Session Management', 'Session Column', 'PASS', `Found ${rounds.length} rounds with session data`)
    } else {
      logResult('Session Management', 'Session Column', 'FAIL', 'No rounds found')
    }

    // Test 2: Verify unique constraint with session
    const session1Rounds = rounds.filter(r => r.session === 1)
    if (session1Rounds.length > 0) {
      logResult('Session Management', 'Session Filtering', 'PASS', `Found ${session1Rounds.length} session 1 rounds`)
    } else {
      logResult('Session Management', 'Session Filtering', 'FAIL', 'No session 1 rounds found')
    }
  } catch (error: any) {
    logResult('Session Management', 'Session Feature', 'FAIL', `Error: ${error.message}`)
  }
}

async function testDataConsistency() {
  console.log('\n' + '='.repeat(70))
  console.log('INTEGRATION TEST 6: DATA CONSISTENCY')
  console.log('='.repeat(70) + '\n')

  // Test 1: All team members can be loaded with their registrations
  try {
    const membersWithReg = await prisma.teamMember.findMany({
      include: { registration: true },
      take: 5
    })

    if (membersWithReg.every(m => m.registration !== null)) {
      logResult('Data Consistency', 'Team Member Relations', 'PASS', 'All team members have valid registrations')
    } else {
      logResult('Data Consistency', 'Team Member Relations', 'FAIL', 'Some team members missing registrations')
    }
  } catch (error: any) {
    logResult('Data Consistency', 'Team Member Relations', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: All matches can be loaded with their rounds
  try {
    const matchesWithRound = await prisma.debateMatch.findMany({
      include: { round: true },
      take: 5
    })

    if (matchesWithRound.every(m => m.round !== null)) {
      logResult('Data Consistency', 'Match Relations', 'PASS', 'All matches have valid rounds')
    } else {
      logResult('Data Consistency', 'Match Relations', 'FAIL', 'Some matches missing rounds')
    }
  } catch (error: any) {
    logResult('Data Consistency', 'Match Relations', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: All verified teams have team members
  const teamsWithoutMembers = await prisma.registration.findMany({
    where: {
      status: 'VERIFIED',
      teamMembers: {
        none: {}
      }
    }
  })

  if (teamsWithoutMembers.length === 0) {
    logResult('Data Consistency', 'Teams Have Members', 'PASS', 'All verified teams have members')
  } else {
    logResult('Data Consistency', 'Teams Have Members', 'FAIL', `Found ${teamsWithoutMembers.length} teams without members`)
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('INTEGRATION TESTING - FINAL REPORT')
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

  // Group by category
  const categories = [...new Set(results.map(r => r.category))]
  console.log('\n📊 RESULTS BY CATEGORY:')
  categories.forEach(cat => {
    const catResults = results.filter(r => r.category === cat)
    const catPassed = catResults.filter(r => r.status === 'PASS').length
    const catTotal = catResults.length
    console.log(`   ${cat}: ${catPassed}/${catTotal} passed`)
  })

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - [${r.category}] ${r.test}: ${r.message}`)
    })
  }

  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   - [${r.category}] ${r.test}: ${r.message}`)
    })
  }

  console.log('\n' + '='.repeat(70))

  return { passed, failed, warned, total, results }
}

async function main() {
  console.log('🧪 COMPREHENSIVE INTEGRATION TESTING')
  console.log('Testing complete workflow with real data...\n')

  await testDatabaseIntegrity()
  await testAPIEndpoints()
  await testFrozenRoundsFeature()
  await testJudgeAssignment()
  await testSessionManagement()
  await testDataConsistency()

  const report = await generateReport()

  if (report.failed > 0) {
    console.log('\n⚠️  Some tests failed. Review the failures above.')
    process.exit(1)
  } else {
    console.log('\n✅ All integration tests passed!')
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

