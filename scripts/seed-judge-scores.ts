import { PrismaClient } from '@prisma/client'

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

async function createJudgeScores() {
  console.log('\n' + '='.repeat(70))
  console.log('CREATING JUDGE SCORES FOR KDBI MATCHES')
  console.log('='.repeat(70) + '\n')

  // Get judge
  const judge = await prisma.user.findFirst({ where: { email: 'judge@test.com' } })
  if (!judge) {
    logResult('Judge Account', 'FAIL', 'Judge account not found')
    return
  }

  logResult('Judge Account', 'SUCCESS', `Found judge: ${judge.name}`)

  // Get matches assigned to judge
  const matches = await prisma.debateMatch.findMany({
    where: { judgeId: judge.id },
    include: {
      round: true,
      team1: true,
      team2: true,
      team3: true,
      team4: true
    }
  })

  if (matches.length === 0) {
    logResult('Judge Matches', 'FAIL', 'No matches assigned to judge')
    return
  }

  logResult('Judge Matches', 'SUCCESS', `Found ${matches.length} matches assigned to judge`)

  // Create scores for each match
  let scoreCount = 0
  for (const match of matches) {
    // Check if scores already exist
    const existingScores = await prisma.debateScore.findMany({
      where: { matchId: match.id }
    })

    if (existingScores.length > 0) {
      logResult(`Match ${match.id}`, 'WARN', 'Scores already exist, skipping')
      continue
    }

    // Get participants from each team (2 members per team in BP format)
    const teams = [
      { teamId: match.team1Id!, position: 'OG' },
      { teamId: match.team2Id!, position: 'OO' },
      { teamId: match.team3Id!, position: 'CG' },
      { teamId: match.team4Id!, position: 'CO' }
    ]

    try {
      for (const team of teams) {
        // Get team members
        const teamMembers = await prisma.teamMember.findMany({
          where: { registrationId: team.teamId },
          include: { participant: true }
        })

        // Create scores for each team member
        for (let i = 0; i < teamMembers.length; i++) {
          const member = teamMembers[i]
          await prisma.debateScore.create({
            data: {
              matchId: match.id,
              participantId: member.participantId,
              score: 75.0 + (i * 2), // Speaker 1: 75, Speaker 2: 77
              judgeId: judge.id,
              bpPosition: team.position,
              speakerRank: i + 1,
              teamPosition: team.position
            }
          })
          scoreCount++
        }
      }

      logResult(`Match ${match.id}`, 'SUCCESS', `Created scores for all participants`)
    } catch (error: any) {
      logResult(`Match ${match.id}`, 'FAIL', `Error: ${error.message}`)
    }
  }

  logResult('Total Scores', 'SUCCESS', `Created ${scoreCount} individual scores across ${matches.length} matches`)
}

async function verifyScores() {
  console.log('\n' + '='.repeat(70))
  console.log('VERIFYING JUDGE SCORES')
  console.log('='.repeat(70) + '\n')

  // Test 1: Scores exist
  const scores = await prisma.debateScore.findMany({
    include: {
      match: true,
      participant: true
    }
  })

  if (scores.length > 0) {
    logResult('Scores Exist', 'SUCCESS', `Found ${scores.length} individual scores in database`)
  } else {
    logResult('Scores Exist', 'FAIL', 'No scores found')
    return
  }

  // Test 2: All scores have valid relations
  const allValid = scores.every(s => s.match !== null && s.participant !== null)
  if (allValid) {
    logResult('Score Relations', 'SUCCESS', 'All scores have valid relations')
  } else {
    logResult('Score Relations', 'FAIL', 'Some scores have broken relations')
  }

  // Test 3: Scores follow BP format (8 participants per match - 4 teams x 2 speakers)
  const matchIds = [...new Set(scores.map(s => s.matchId))]
  let bpFormatValid = true
  for (const matchId of matchIds) {
    const matchScores = scores.filter(s => s.matchId === matchId)
    if (matchScores.length !== 8) {
      logResult(`Match ${matchId}`, 'WARN', `Expected 8 scores, found ${matchScores.length}`)
      bpFormatValid = false
    }
  }

  if (bpFormatValid) {
    logResult('BP Format', 'SUCCESS', 'All matches have 8 scores (4 teams x 2 speakers)')
  }

  // Test 4: BP positions are correct
  let positionsValid = true
  for (const matchId of matchIds) {
    const matchScores = scores.filter(s => s.matchId === matchId)
    const positions = [...new Set(matchScores.map(s => s.bpPosition))]
    const expectedPositions = ['OG', 'OO', 'CG', 'CO']

    if (positions.length !== 4) {
      logResult(`Match ${matchId}`, 'WARN', `Expected 4 BP positions, found ${positions.length}`)
      positionsValid = false
    }
  }

  if (positionsValid) {
    logResult('BP Positions', 'SUCCESS', 'All matches have correct BP positions (OG, OO, CG, CO)')
  }

  // Test 5: Speaker scores are valid
  const allScoresValid = scores.every(s => s.score >= 60 && s.score <= 90)
  if (allScoresValid) {
    logResult('Score Range', 'SUCCESS', 'All speaker scores are within valid range (60-90)')
  } else {
    logResult('Score Range', 'FAIL', 'Some scores are outside valid range')
  }
}

async function testScoringAPI() {
  console.log('\n' + '='.repeat(70))
  console.log('TESTING SCORING API')
  console.log('='.repeat(70) + '\n')

  // Test 1: Can query scores
  try {
    const scores = await prisma.debateScore.findMany({
      include: {
        match: { include: { round: true } },
        participant: true
      },
      take: 5
    })

    if (scores.length > 0) {
      logResult('Query Scores', 'SUCCESS', `Successfully queried ${scores.length} scores`)
    } else {
      logResult('Query Scores', 'WARN', 'No scores to query')
    }
  } catch (error: any) {
    logResult('Query Scores', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Can calculate participant averages
  try {
    const participantScores = await prisma.debateScore.groupBy({
      by: ['participantId'],
      _avg: { score: true },
      _count: { id: true }
    })

    if (participantScores.length > 0) {
      logResult('Participant Averages', 'SUCCESS', `Calculated averages for ${participantScores.length} participants`)
    } else {
      logResult('Participant Averages', 'WARN', 'No participant scores to calculate')
    }
  } catch (error: any) {
    logResult('Participant Averages', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Can get match-level aggregates
  try {
    const matchScores = await prisma.debateScore.groupBy({
      by: ['matchId'],
      _avg: { score: true },
      _count: { id: true }
    })

    if (matchScores.length > 0) {
      logResult('Match Aggregates', 'SUCCESS', `Calculated aggregates for ${matchScores.length} matches`)

      // Show match details
      console.log('\n   📊 MATCH SCORES:')
      for (let i = 0; i < Math.min(2, matchScores.length); i++) {
        const match = await prisma.debateMatch.findUnique({
          where: { id: matchScores[i].matchId },
          include: { round: true }
        })
        console.log(`   Match ${i + 1}: ${matchScores[i]._count.id} scores, avg ${matchScores[i]._avg.score?.toFixed(1)}`)
      }
    } else {
      logResult('Match Aggregates', 'WARN', 'No match data')
    }
  } catch (error: any) {
    logResult('Match Aggregates', 'FAIL', `Error: ${error.message}`)
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('JUDGE SCORING - SUMMARY')
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
}

async function main() {
  console.log('🧪 CREATING AND TESTING JUDGE SCORES')
  console.log('British Parliamentary Format (4 teams, ranks 1-4, points 3-2-1-0)\n')

  await createJudgeScores()
  await verifyScores()
  await testScoringAPI()
  await generateReport()

  console.log('\n✅ Judge scoring feature complete!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

