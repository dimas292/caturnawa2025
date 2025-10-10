const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Debugging Leaderboard Data Sync Issue\n');

  // Check DebateScore table
  console.log('📊 DebateScore Table:');
  const debateScores = await prisma.debateScore.findMany({
    include: {
      participant: { select: { fullName: true } },
      match: {
        include: {
          round: { select: { stage: true, roundNumber: true } }
        }
      }
    }
  });
  
  console.log(`   Found ${debateScores.length} debate scores`);
  if (debateScores.length > 0) {
    console.log('   Sample scores:');
    debateScores.slice(0, 3).forEach(score => {
      console.log(`   - ${score.participant.fullName}: ${score.score} pts (${score.match.round.stage} R${score.match.round.roundNumber})`);
    });
  }

  console.log('\n📈 TeamStanding Table:');
  const teamStandings = await prisma.teamStanding.findMany({
    include: {
      registration: {
        include: {
          participant: { select: { fullName: true } },
          competition: { select: { name: true } }
        }
      }
    }
  });
  
  console.log(`   Found ${teamStandings.length} team standings`);
  if (teamStandings.length > 0) {
    console.log('   Sample standings:');
    teamStandings.slice(0, 3).forEach(standing => {
      console.log(`   - ${standing.registration.teamName}: ${standing.teamPoints} TP, ${standing.speakerPoints} SP, ${standing.matchesPlayed} matches`);
    });
  } else {
    console.log('   ❌ NO TEAM STANDINGS FOUND - This is the problem!');
  }

  console.log('\n🏆 DebateMatch Table:');
  const matches = await prisma.debateMatch.findMany({
    include: {
      round: { select: { stage: true, roundNumber: true } },
      team1: { select: { teamName: true } },
      team2: { select: { teamName: true } },
      team3: { select: { teamName: true } },
      team4: { select: { teamName: true } },
      scores: { select: { score: true } }
    }
  });
  
  console.log(`   Found ${matches.length} matches`);
  if (matches.length > 0) {
    const completedMatches = matches.filter(m => m.completedAt);
    console.log(`   Completed matches: ${completedMatches.length}`);
    
    if (completedMatches.length > 0) {
      console.log('   Sample completed match:');
      const match = completedMatches[0];
      console.log(`   - ${match.round.stage} R${match.round.roundNumber}: ${match.scores.length} scores`);
      console.log(`   - Teams: ${match.team1?.teamName}, ${match.team2?.teamName}, ${match.team3?.teamName}, ${match.team4?.teamName}`);
      console.log(`   - Rankings set: 1st=${match.firstPlaceTeamId ? '✓' : '✗'}, 2nd=${match.secondPlaceTeamId ? '✓' : '✗'}, 3rd=${match.thirdPlaceTeamId ? '✓' : '✗'}, 4th=${match.fourthPlaceTeamId ? '✓' : '✗'}`);
    }
  }

  console.log('\n📋 Registration Table:');
  const registrations = await prisma.registration.findMany({
    include: {
      participant: { select: { fullName: true } },
      competition: { select: { name: true, type: true } }
    }
  });
  
  console.log(`   Found ${registrations.length} registrations`);
  registrations.forEach(reg => {
    console.log(`   - ${reg.teamName} (${reg.competition.type}): ${reg.status}`);
  });

  // Check if there's a trigger or procedure that should update TeamStanding
  console.log('\n🔧 Analysis:');
  if (debateScores.length > 0 && teamStandings.length === 0) {
    console.log('❌ ISSUE IDENTIFIED: DebateScores exist but TeamStanding is empty');
    console.log('   This means the scoring system is not updating TeamStanding table');
    console.log('   Solution: Either fix the scoring trigger/procedure or modify leaderboard to calculate from DebateScore directly');
  } else if (debateScores.length === 0) {
    console.log('ℹ️  No debate scores found - this might be expected if no matches have been scored yet');
  } else {
    console.log('✅ Both tables have data - investigate further');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });