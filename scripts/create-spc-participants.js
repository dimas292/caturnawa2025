const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding SPC participants with submissions...');

  const spcCompetition = await prisma.competition.findUnique({
    where: { type: 'SPC' },
  });

  if (!spcCompetition) {
    console.error('Scientific Paper Competition (SPC) not found. Please seed competitions first.');
    return;
  }

  const numberOfParticipants = 15;
  const researchTopics = [
    'Pemberdayaan Pemuda dalam Era Digital',
    'Inovasi Teknologi untuk Sustainable Development',
    'Pentingnya Literasi Digital di Kalangan Mahasiswa',
    'Membangun Karakter Bangsa Melalui Pendidikan',
    'Peran Generasi Muda dalam Melestarikan Budaya',
    'Transformasi Digital dalam Dunia Pendidikan',
    'Sustainability dan Bisnis Masa Depan',
    'Kepemimpinan Milenial dalam Organisasi',
    'Dampak Artificial Intelligence terhadap Masa Depan Kerja',
    'Membangun Indonesia Maju Melalui Inovasi Teknologi'
  ];

  for (let i = 0; i < numberOfParticipants; i++) {
    const fullName = faker.person.fullName();
    const email = faker.internet.email({
      firstName: fullName.split(' ')[0],
      lastName: fullName.split(' ')[1],
    });

    // 1. Create User and Participant Profile
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email: email,
        role: 'participant',
        participant: {
          create: {
            fullName: fullName,
            email: email,
            gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
            whatsappNumber: faker.phone.number(),
            institution: faker.helpers.arrayElement([
              'Universitas Indonesia',
              'Institut Teknologi Bandung', 
              'Universitas Gadjah Mada',
              'Universitas Airlangga',
              'Institut Teknologi Sepuluh Nopember',
              'Universitas Padjadjaran',
              'Universitas Diponegoro',
              'Universitas Brawijaya',
              'Universitas Sebelas Maret',
              'Universitas Nasional'
            ]),
            faculty: faker.helpers.arrayElement([
              'Fakultas Ilmu Komputer',
              'Fakultas Teknik',
              'Fakultas Ekonomi dan Bisnis',
              'Fakultas Ilmu Sosial dan Politik',
              'Fakultas Hukum',
              'Fakultas Kedokteran',
              'Fakultas Sastra dan Humaniora'
            ]),
            studyProgram: faker.helpers.arrayElement([
              'Ilmu Komputer', 
              'Sistem Informasi',
              'Teknik Informatika',
              'Manajemen',
              'Akuntansi',
              'Hukum',
              'Komunikasi'
            ]),
          },
        },
      },
      include: {
        participant: true,
      },
    });

    const participant = user.participant;
    if (!participant) continue;

    // 2. Create Registration for SPC
    const registration = await prisma.registration.create({
      data: {
        participantId: participant.id,
        competitionId: spcCompetition.id,
        status: 'VERIFIED', // Participant is verified and can submit work
        paymentPhase: 'PHASE_1',
        paymentAmount: spcCompetition.phase1Price,
        agreementAccepted: true,
        verifiedAt: new Date(),
      },
    });

    // 3. Create SPC Submission (NEW MODEL)
    const judulKarya = faker.helpers.arrayElement(researchTopics);
    const randomStatus = faker.helpers.weightedArrayElement([
      { weight: 6, value: 'PENDING' },      // 60% pending (need evaluation)
      { weight: 2, value: 'QUALIFIED' },    // 20% qualified  
      { weight: 1, value: 'NOT_QUALIFIED' }, // 10% not qualified
      { weight: 1, value: 'REVIEWED' }      // 10% reviewed but not decided
    ]);

    const spcSubmission = await prisma.sPCSubmission.create({
      data: {
        registrationId: registration.id,
        judulKarya: judulKarya,
        catatan: faker.lorem.sentence(),
        
        // File URLs (simulated)
        fileKarya: `/uploads/spc/${registration.id}/karya.pdf`,
        suratOrisinalitas: `/uploads/spc/${registration.id}/orisinalitas.pdf`, 
        suratPengalihanHakCipta: `/uploads/spc/${registration.id}/hak_cipta.pdf`,
        
        status: randomStatus,
        
        // Add evaluation data for reviewed submissions
        ...(randomStatus !== 'PENDING' && {
          strukturOrganisasi: faker.number.int({ min: 3, max: 5 }),
          kualitasArgumen: faker.number.int({ min: 3, max: 5 }),
          gayaBahasaTulis: faker.number.int({ min: 3, max: 5 }),
          feedback: faker.lorem.paragraph(),
          evaluatedAt: faker.date.recent({ days: 7 }),
          evaluatedBy: 'judge-' + faker.string.uuid()
        }),
        
        // Add final stage data for qualified submissions
        ...(randomStatus === 'QUALIFIED' && {
          qualifiedToFinal: true,
          presentationOrder: faker.number.int({ min: 1, max: 10 }),
          presentationTitle: judulKarya,
          scheduledTime: `${faker.number.int({ min: 9, max: 16 })}:${faker.helpers.arrayElement(['00', '15', '30', '45'])} - ${faker.number.int({ min: 9, max: 16 })}:${faker.helpers.arrayElement(['15', '30', '45', '00'])}`
        })
      },
    });

    console.log(`✅ Created SPC participant: ${fullName}`);
    console.log(`   📝 Submission: "${judulKarya}" (${randomStatus})`);
    
    if (randomStatus === 'QUALIFIED') {
      console.log(`   🏆 Qualified for final - Presentation order: ${spcSubmission.presentationOrder}`);
    }
  }

  console.log(`\n🎉 Seeding finished!`);
  console.log(`📊 Created ${numberOfParticipants} SPC participants with submissions:`);
  
  // Show summary
  const summary = await prisma.sPCSubmission.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  summary.forEach(stat => {
    console.log(`   ${stat.status}: ${stat._count.id} submissions`);
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
