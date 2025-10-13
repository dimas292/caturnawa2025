import { PrismaClient, CompetitionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 FIXING MATCH TEAM ASSIGNMENTS\n')

  // Get all KDBI verified teams
  const teams = await prisma.registration.findMany({
    where: {
      competition: { type: CompetitionType.KDBI },
      status: 'VERIFIED'
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log(`Found ${teams.length} verified KDBI teams`)

  if (teams.length < 8) {
    console.log('❌ Not enough teams (need at least 8)')
    return
  }

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
    console.log('❌ Round not found')
    return
  }

  console.log(`Found round: ${round.roundName}\n`)

  // Get existing matches
  const matches = await prisma.debateMatch.findMany({
    where: { roundId: round.id },
    orderBy: { matchNumber: 'asc' }
  })

  console.log(`Found ${matches.length} existing matches\n`)

  // Assign teams to matches
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const team1 = teams[i * 4]
    const team2 = teams[i * 4 + 1]
    const team3 = teams[i * 4 + 2]
    const team4 = teams[i * 4 + 3]

    if (!team1 || !team2 || !team3 || !team4) {
      console.log(`⚠️  Match ${match.matchNumber}: Not enough teams`)
      continue
    }

    console.log(`Assigning teams to Match ${match.matchNumber}:`)
    console.log(`  - Team 1: ${team1.teamName}`)
    console.log(`  - Team 2: ${team2.teamName}`)
    console.log(`  - Team 3: ${team3.teamName}`)
    console.log(`  - Team 4: ${team4.teamName}`)

    const updated = await prisma.debateMatch.update({
      where: { id: match.id },
      data: {
        team1Id: team1.id,
        team2Id: team2.id,
        team3Id: team3.id,
        team4Id: team4.id
      }
    })

    console.log(`✅ Match ${match.matchNumber} updated\n`)
  }

  // Verify
  console.log('Verifying assignments...\n')
  const verifyMatches = await prisma.debateMatch.findMany({
    where: { roundId: round.id },
    include: {
      team1: true,
      team2: true,
      team3: true,
      team4: true,
      judge: true
    }
  })

  verifyMatches.forEach(m => {
    console.log(`Match ${m.matchNumber}:`)
    console.log(`  Team 1: ${m.team1?.teamName || 'NOT ASSIGNED'}`)
    console.log(`  Team 2: ${m.team2?.teamName || 'NOT ASSIGNED'}`)
    console.log(`  Team 3: ${m.team3?.teamName || 'NOT ASSIGNED'}`)
    console.log(`  Team 4: ${m.team4?.teamName || 'NOT ASSIGNED'}`)
    console.log(`  Judge: ${m.judge?.name || 'NOT ASSIGNED'}`)
    console.log()
  })

  console.log('✅ Team assignment complete!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

