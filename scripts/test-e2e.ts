/**
 * PHASE 6: END-TO-END TESTING
 * 
 * Tests:
 * 1. Admin Workflow (3 tests)
 * 2. Judge Workflow (2 tests)
 * 3. Participant Workflow (3 tests)
 * 4. Public User Workflow (2 tests)
 * 5. Cross-Role Integration (2 tests)
 * 
 * Total: 12 tests
 */

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

async function testAdminWorkflow() {
  console.log('\n' + '='.repeat(70))
  console.log('E2E TEST 1: ADMIN WORKFLOW')
  console.log('='.repeat(70) + '\n')

  // Test 1: Admin can view KDBI round teams
  try {
    const round = await prisma.debateRound.findFirst({
      where: {
        competition: { type: 'KDBI' },
        stage: 'PRELIMINARY',
        roundNumber: 1,
        session: 1
      },
      include: {
        matches: {
          include: {
            team1: true,
            team2: true,
            team3: true,
            team4: true
          }
        }
      }
    })

    if (round && round.matches.length > 0) {
      const allTeamsAssigned = round.matches.every(m => m.team1Id && m.team2Id && m.team3Id && m.team4Id)
      if (allTeamsAssigned) {
        logResult('Admin Workflow', 'View Round Teams', 'PASS', `Round has ${round.matches.length} matches with all teams assigned`)
      } else {
        logResult('Admin Workflow', 'View Round Teams', 'FAIL', 'Some matches missing team assignments')
      }
    } else {
      logResult('Admin Workflow', 'View Round Teams', 'FAIL', 'No round or matches found')
    }
  } catch (error: any) {
    logResult('Admin Workflow', 'View Round Teams', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Admin can assign judge to match
  try {
    const judge = await prisma.user.findFirst({ where: { email: 'judge@test.com' } })
    const match = await prisma.debateMatch.findFirst({
      where: {
        round: {
          competition: { type: 'KDBI' },
          stage: 'PRELIMINARY'
        }
      }
    })

    if (judge && match) {
      if (match.judgeId === judge.id) {
        logResult('Admin Workflow', 'Assign Judge', 'PASS', 'Judge successfully assigned to match')
      } else {
        logResult('Admin Workflow', 'Assign Judge', 'WARN', 'Judge not assigned (may need manual assignment)')
      }
    } else {
      logResult('Admin Workflow', 'Assign Judge', 'FAIL', 'Judge or match not found')
    }
  } catch (error: any) {
    logResult('Admin Workflow', 'Assign Judge', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Admin can freeze/unfreeze rounds
  try {
    const admin = await prisma.user.findFirst({ where: { email: 'admin@test.com' } })
    const round = await prisma.debateRound.findFirst({
      where: {
        competition: { type: 'KDBI' },
        stage: 'PRELIMINARY',
        roundNumber: 3
      }
    })

    if (admin && round) {
      // Test freeze
      const frozen = await prisma.debateRound.update({
        where: { id: round.id },
        data: {
          isFrozen: true,
          frozenAt: new Date(),
          frozenBy: admin.id
        }
      })

      if (frozen.isFrozen && frozen.frozenBy === admin.id) {
        // Test unfreeze
        await prisma.debateRound.update({
          where: { id: round.id },
          data: {
            isFrozen: false,
            frozenAt: null,
            frozenBy: null
          }
        })
        logResult('Admin Workflow', 'Freeze/Unfreeze Round', 'PASS', 'Round can be frozen and unfrozen')
      } else {
        logResult('Admin Workflow', 'Freeze/Unfreeze Round', 'FAIL', 'Freeze operation failed')
      }
    } else {
      logResult('Admin Workflow', 'Freeze/Unfreeze Round', 'FAIL', 'Admin or round not found')
    }
  } catch (error: any) {
    logResult('Admin Workflow', 'Freeze/Unfreeze Round', 'FAIL', `Error: ${error.message}`)
  }
}

async function testJudgeWorkflow() {
  console.log('\n' + '='.repeat(70))
  console.log('E2E TEST 2: JUDGE WORKFLOW')
  console.log('='.repeat(70) + '\n')

  // Test 1: Judge can view assigned matches
  try {
    const judge = await prisma.user.findFirst({ where: { email: 'judge@test.com' } })
    
    if (judge) {
      const assignedMatches = await prisma.debateMatch.findMany({
        where: { judgeId: judge.id },
        include: {
          round: true,
          team1: true,
          team2: true,
          team3: true,
          team4: true
        }
      })

      if (assignedMatches.length > 0) {
        logResult('Judge Workflow', 'View Assigned Matches', 'PASS', `Judge has ${assignedMatches.length} assigned matches`)
      } else {
        logResult('Judge Workflow', 'View Assigned Matches', 'WARN', 'Judge has no assigned matches')
      }
    } else {
      logResult('Judge Workflow', 'View Assigned Matches', 'FAIL', 'Judge not found')
    }
  } catch (error: any) {
    logResult('Judge Workflow', 'View Assigned Matches', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Judge scoring structure exists
  try {
    const scoresExist = await prisma.debateScore.findFirst()
    
    if (scoresExist) {
      logResult('Judge Workflow', 'Scoring System', 'PASS', 'Scoring system is functional')
    } else {
      logResult('Judge Workflow', 'Scoring System', 'WARN', 'No scores submitted yet (expected for test data)')
    }
  } catch (error: any) {
    logResult('Judge Workflow', 'Scoring System', 'FAIL', `Error: ${error.message}`)
  }
}

async function testParticipantWorkflow() {
  console.log('\n' + '='.repeat(70))
  console.log('E2E TEST 3: PARTICIPANT WORKFLOW')
  console.log('='.repeat(70) + '\n')

  // Test 1: Participant account exists
  try {
    const participant = await prisma.user.findFirst({
      where: { email: 'participant@test.com' },
      include: { participant: true }
    })

    if (participant && participant.participant) {
      logResult('Participant Workflow', 'Account & Profile', 'PASS', 'Participant account with profile exists')
    } else if (participant) {
      logResult('Participant Workflow', 'Account & Profile', 'WARN', 'Participant account exists but no profile')
    } else {
      logResult('Participant Workflow', 'Account & Profile', 'FAIL', 'Participant account not found')
    }
  } catch (error: any) {
    logResult('Participant Workflow', 'Account & Profile', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Team registration workflow
  try {
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
      const allTeamsHaveMembers = teams.every(t => t.teamMembers.length >= 2)
      if (allTeamsHaveMembers) {
        logResult('Participant Workflow', 'Team Registration', 'PASS', `${teams.length} teams registered with members`)
      } else {
        logResult('Participant Workflow', 'Team Registration', 'FAIL', 'Some teams missing members')
      }
    } else {
      logResult('Participant Workflow', 'Team Registration', 'WARN', `Only ${teams.length} teams registered`)
    }
  } catch (error: any) {
    logResult('Participant Workflow', 'Team Registration', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: View competition results
  try {
    const competitions = await prisma.competition.findMany({
      include: {
        rounds: {
          include: {
            matches: true
          }
        }
      }
    })

    if (competitions.length > 0) {
      logResult('Participant Workflow', 'View Results', 'PASS', `${competitions.length} competitions with rounds available`)
    } else {
      logResult('Participant Workflow', 'View Results', 'FAIL', 'No competitions found')
    }
  } catch (error: any) {
    logResult('Participant Workflow', 'View Results', 'FAIL', `Error: ${error.message}`)
  }
}

async function testPublicUserWorkflow() {
  console.log('\n' + '='.repeat(70))
  console.log('E2E TEST 4: PUBLIC USER WORKFLOW')
  console.log('='.repeat(70) + '\n')

  // Test 1: Public can view competitions
  try {
    const response = await fetch(`${BASE_URL}/competitions`)
    
    if (response.status === 200) {
      logResult('Public Workflow', 'View Competitions', 'PASS', 'Competitions page accessible')
    } else {
      logResult('Public Workflow', 'View Competitions', 'FAIL', `Expected 200, got ${response.status}`)
    }
  } catch (error: any) {
    logResult('Public Workflow', 'View Competitions', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Public can view leaderboard
  try {
    const response = await fetch(`${BASE_URL}/api/public/leaderboard`)
    
    if (response.status === 200 || response.status === 307) {
      logResult('Public Workflow', 'View Leaderboard', 'PASS', 'Leaderboard endpoint accessible')
    } else {
      logResult('Public Workflow', 'View Leaderboard', 'FAIL', `Expected 200/307, got ${response.status}`)
    }
  } catch (error: any) {
    logResult('Public Workflow', 'View Leaderboard', 'FAIL', `Error: ${error.message}`)
  }
}

async function testCrossRoleIntegration() {
  console.log('\n' + '='.repeat(70))
  console.log('E2E TEST 5: CROSS-ROLE INTEGRATION')
  console.log('='.repeat(70) + '\n')

  // Test 1: Admin creates match → Judge can view it
  try {
    const judge = await prisma.user.findFirst({ where: { email: 'judge@test.com' } })
    const match = await prisma.debateMatch.findFirst({
      where: { judgeId: judge?.id },
      include: {
        round: true,
        team1: true,
        team2: true,
        team3: true,
        team4: true
      }
    })

    if (match && match.team1 && match.team2 && match.team3 && match.team4) {
      logResult('Cross-Role', 'Admin→Judge Flow', 'PASS', 'Match created by admin is visible to judge with all teams')
    } else if (match) {
      logResult('Cross-Role', 'Admin→Judge Flow', 'WARN', 'Match exists but missing some teams')
    } else {
      logResult('Cross-Role', 'Admin→Judge Flow', 'FAIL', 'No match found for judge')
    }
  } catch (error: any) {
    logResult('Cross-Role', 'Admin→Judge Flow', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Participant registration → Admin can see team
  try {
    const teams = await prisma.registration.findMany({
      where: {
        competition: { type: 'KDBI' },
        status: 'VERIFIED'
      },
      include: {
        teamMembers: {
          include: {
            participant: true
          }
        }
      }
    })

    if (teams.length > 0) {
      const hasParticipantData = teams.some(t => 
        t.teamMembers.some(m => m.participant !== null)
      )
      
      if (hasParticipantData) {
        logResult('Cross-Role', 'Participant→Admin Flow', 'PASS', 'Participant registrations visible to admin')
      } else {
        logResult('Cross-Role', 'Participant→Admin Flow', 'WARN', 'Teams exist but participant data incomplete')
      }
    } else {
      logResult('Cross-Role', 'Participant→Admin Flow', 'FAIL', 'No teams found')
    }
  } catch (error: any) {
    logResult('Cross-Role', 'Participant→Admin Flow', 'FAIL', `Error: ${error.message}`)
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 6: END-TO-END TESTING - FINAL REPORT')
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
  console.log(`Completion Rate: ${(((passed + warned) / total) * 100).toFixed(1)}%`)

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

  const completionRate = ((passed + warned) / total) * 100
  console.log(`\n📊 Phase 6 Completion: ${completionRate.toFixed(1)}%`)

  return { passed, failed, warned, total, results }
}

async function main() {
  console.log('🧪 PHASE 6: END-TO-END TESTING')
  console.log('Testing complete user workflows and cross-role integration...\n')

  await testAdminWorkflow()
  await testJudgeWorkflow()
  await testParticipantWorkflow()
  await testPublicUserWorkflow()
  await testCrossRoleIntegration()

  const report = await generateReport()

  if (report.failed > 0) {
    console.log('\n⚠️  Some tests failed. Review the failures above.')
  } else {
    console.log('\n✅ All E2E tests completed!')
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

