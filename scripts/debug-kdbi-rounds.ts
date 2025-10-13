import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Debugging KDBI Round Teams Endpoint\n')

  // 1. Check if KDBI competition exists
  console.log('1. Checking KDBI competition...')
  const kdbiCompetition = await prisma.competition.findFirst({
    where: { type: 'KDBI' }
  })
  
  if (!kdbiCompetition) {
    console.log('❌ No KDBI competition found!')
    return
  }
  console.log(`✅ KDBI Competition found: ${kdbiCompetition.name} (ID: ${kdbiCompetition.id})`)

  // 2. Check for debate rounds
  console.log('\n2. Checking KDBI debate rounds...')
  const rounds = await prisma.debateRound.findMany({
    where: {
      competitionId: kdbiCompetition.id
    },
    orderBy: [
      { stage: 'asc' },
      { roundNumber: 'asc' },
      { session: 'asc' }
    ]
  })

  if (rounds.length === 0) {
    console.log('❌ No debate rounds found for KDBI!')
  } else {
    console.log(`✅ Found ${rounds.length} debate round(s):`)
    rounds.forEach(r => {
      console.log(`   - ${r.roundName} (Stage: ${r.stage}, Round: ${r.roundNumber}, Session: ${r.session})`)
      console.log(`     ID: ${r.id}`)
      console.log(`     Motion: ${r.motion || 'Not set'}`)
      console.log(`     Frozen: ${r.isFrozen}`)
    })
  }

  // 3. Check for the specific round being queried
  console.log('\n3. Checking for PRELIMINARY Round 1 Session 1...')
  const targetRound = await prisma.debateRound.findFirst({
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
          judge: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { matchNumber: 'asc' }
      }
    }
  })

  if (!targetRound) {
    console.log('❌ PRELIMINARY Round 1 Session 1 not found!')
    console.log('\n💡 This is likely why the endpoint returns empty data.')
    console.log('   You need to create this round first using the admin dashboard.')
  } else {
    console.log(`✅ Round found: ${targetRound.roundName}`)
    console.log(`   Matches: ${targetRound.matches.length}`)
    targetRound.matches.forEach(m => {
      console.log(`   - Match ${m.matchNumber}: ${m.team1?.teamName || 'TBD'} vs ${m.team2?.teamName || 'TBD'} vs ${m.team3?.teamName || 'TBD'} vs ${m.team4?.teamName || 'TBD'}`)
      console.log(`     Judge: ${m.judge?.name || 'Not assigned'}`)
    })
  }

  // 4. Check for registered teams
  console.log('\n4. Checking KDBI registered teams...')
  const registrations = await prisma.registration.findMany({
    where: {
      competition: { type: 'KDBI' },
      status: { in: ['VERIFIED', 'COMPLETED'] }
    },
    include: {
      teamMembers: { include: { participant: true } }
    },
    orderBy: { createdAt: 'asc' }
  })

  if (registrations.length === 0) {
    console.log('❌ No verified KDBI teams found!')
    console.log('   You need teams to be registered and verified before creating rooms.')
  } else {
    console.log(`✅ Found ${registrations.length} verified team(s):`)
    registrations.forEach(r => {
      const teamName = r.teamName || r.teamMembers.map(tm => tm.participant?.fullName || 'Unknown').slice(0, 2).join(' & ')
      console.log(`   - ${teamName} (${r.teamMembers.length} members)`)
    })
  }

  // 5. Test the exact query from the API
  console.log('\n5. Testing exact API query...')
  try {
    const round = await prisma.debateRound.findFirst({
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
            judge: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { matchNumber: 'asc' }
        }
      }
    })

    console.log('✅ Query executed successfully!')
    console.log(`   Result: ${round ? 'Round found' : 'Round not found (returns null)'}`)
  } catch (error) {
    console.log('❌ Query failed with error:')
    console.error(error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('DIAGNOSIS COMPLETE')
  console.log('='.repeat(60))
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

