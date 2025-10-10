const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('Start creating SPC final scores...');

  // Get all qualified SPC submissions (finalists)
  const finalists = await prisma.sPCSubmission.findMany({
    where: {
      status: 'QUALIFIED',
      qualifiedToFinal: true
    },
    include: {
      registration: {
        include: {
          participant: {
            select: { fullName: true }
          }
        }
      }
    }
  });

  if (finalists.length === 0) {
    console.log('No qualified SPC finalists found. Run create-spc-participants.js first.');
    return;
  }

  // Create some sample judges
  const judges = [
    { id: 'judge-001', name: 'Prof. Dr. Ahmad Syafi\'i' },
    { id: 'judge-002', name: 'Dr. Sari Indrawati, M.A.' }, 
    { id: 'judge-003', name: 'Drs. Bambang Prihantoro, M.Pd.' }
  ];

  let totalScoresCreated = 0;

  for (const finalist of finalists) {
    // Randomly decide how many judges have scored this finalist (1-3)
    const numberOfJudgesScored = faker.number.int({ min: 1, max: 3 });
    const selectedJudges = faker.helpers.shuffle(judges).slice(0, numberOfJudgesScored);
    
    console.log(`\n📝 Creating scores for: ${finalist.registration.participant?.fullName}`);
    console.log(`   Topic: "${finalist.judulKarya}"`);
    
    for (const judge of selectedJudges) {
      // Generate realistic scores (tend to be higher for qualified participants)
      const materi = faker.number.int({ min: 75, max: 95 });
      const penyampaian = faker.number.int({ min: 70, max: 95 });
      const bahasa = faker.number.int({ min: 75, max: 90 });
      const total = materi + penyampaian + bahasa;
      
      const feedback = faker.helpers.arrayElement([
        'Presentasi yang sangat baik dengan argumen yang kuat dan penyampaian yang meyakinkan.',
        'Konten materi excellent, delivery perlu sedikit improvement pada gesture.',
        'Bahasa sangat baik, struktur argumen clear, overall performance sangat memuaskan.',
        'Strong content knowledge, confident delivery, minor issues with time management.',
        'Outstanding presentation skills, very engaging, arguments well-structured.',
        'Good grasp of the topic, clear articulation, room for improvement in eye contact.',
        'Impressive command of language, persuasive arguments, excellent stage presence.'
      ]);

      const score = await prisma.sPCFinalScore.create({
        data: {
          submissionId: finalist.id,
          judgeId: judge.id,
          judgeName: judge.name,
          materi,
          penyampaian,
          bahasa,
          total,
          feedback: faker.helpers.maybe(() => feedback, { probability: 0.7 })
        }
      });

      console.log(`   ⭐ ${judge.name}: ${total}/300 (M:${materi} P:${penyampaian} B:${bahasa})`);
      totalScoresCreated++;
    }
  }

  console.log(`\n🎉 Final scoring completed!`);
  console.log(`📊 Created ${totalScoresCreated} scores for ${finalists.length} finalists`);
  
  // Show summary by finalist with average scores
  console.log(`\n📈 Final Standings (based on average scores):`);
  
  const standings = await prisma.sPCSubmission.findMany({
    where: {
      status: 'QUALIFIED',
      qualifiedToFinal: true
    },
    include: {
      registration: {
        include: {
          participant: {
            select: { fullName: true }
          }
        }
      },
      finalScores: true
    },
    orderBy: {
      presentationOrder: 'asc'
    }
  });

  standings.forEach((finalist, index) => {
    if (finalist.finalScores.length > 0) {
      const avgTotal = finalist.finalScores.reduce((sum, score) => sum + score.total, 0) / finalist.finalScores.length;
      const avgMateri = finalist.finalScores.reduce((sum, score) => sum + score.materi, 0) / finalist.finalScores.length;
      const avgPenyampaian = finalist.finalScores.reduce((sum, score) => sum + score.penyampaian, 0) / finalist.finalScores.length;
      const avgBahasa = finalist.finalScores.reduce((sum, score) => sum + score.bahasa, 0) / finalist.finalScores.length;
      
      console.log(`${index + 1}. ${finalist.registration.participant?.fullName}`);
      console.log(`   📊 Avg Score: ${avgTotal.toFixed(1)}/300 (M:${avgMateri.toFixed(1)} P:${avgPenyampaian.toFixed(1)} B:${avgBahasa.toFixed(1)})`);
      console.log(`   👥 Judges scored: ${finalist.finalScores.length}/3`);
    } else {
      console.log(`${index + 1}. ${finalist.registration.participant?.fullName} - No scores yet`);
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });