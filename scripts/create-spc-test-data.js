const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const mockSPCParticipants = [
  {
    fullName: "Andi Pratama",
    email: "andi.pratama@ui.ac.id",
    gender: "MALE",
    whatsappNumber: "081234567890",
    institution: "Universitas Indonesia",
    faculty: "Fakultas Ilmu Sosial dan Ilmu Politik",
    studyProgram: "Ilmu Komunikasi",
    studentId: "2021110001",
    judulKarya: "Transformasi Digital: Peluang dan Tantangan bagi Generasi Muda",
    catatan: "Karya ini membahas dampak transformasi digital terhadap kehidupan sehari-hari generasi muda."
  },
  {
    fullName: "Sari Dewi",
    email: "sari.dewi@itb.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234567891",
    institution: "Institut Teknologi Bandung",
    faculty: "Sekolah Bisnis dan Manajemen",
    studyProgram: "Manajemen",
    studentId: "2021120002",
    judulKarya: "Inovasi Teknologi untuk Sustainable Development Goals",
    catatan: "Membahas peran teknologi dalam mencapai tujuan pembangunan berkelanjutan."
  },
  {
    fullName: "Budi Santoso",
    email: "budi.santoso@ugm.ac.id",
    gender: "MALE",
    whatsappNumber: "081234567892",
    institution: "Universitas Gadjah Mada",
    faculty: "Fakultas Teknik",
    studyProgram: "Teknik Informatika",
    studentId: "2021130003",
    judulKarya: "Kecerdasan Buatan: Masa Depan Pendidikan di Indonesia",
    catatan: "Analisis implementasi AI dalam sistem pendidikan Indonesia."
  },
  {
    fullName: "Maya Kusuma",
    email: "maya.kusuma@unair.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234567893",
    institution: "Universitas Airlangga",
    faculty: "Fakultas Psikologi",
    studyProgram: "Psikologi",
    studentId: "2021140004",
    judulKarya: "Mental Health Awareness di Era Media Sosial",
    catatan: "Pentingnya kesadaran kesehatan mental di kalangan pengguna media sosial."
  },
  {
    fullName: "Rizki Firmansyah",
    email: "rizki.firmansyah@its.ac.id",
    gender: "MALE",
    whatsappNumber: "081234567894",
    institution: "Institut Teknologi Sepuluh Nopember",
    faculty: "Fakultas Teknologi Industri",
    studyProgram: "Teknik Industri",
    studentId: "2021150005",
    judulKarya: "Revolusi Industri 4.0: Adaptasi UMKM Indonesia",
    catatan: "Strategi adaptasi UMKM menghadapi revolusi industri 4.0."
  },
  {
    fullName: "Putri Maharani",
    email: "putri.maharani@undip.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234567895",
    institution: "Universitas Diponegoro",
    faculty: "Fakultas Ekonomika dan Bisnis",
    studyProgram: "Ekonomi Pembangunan",
    studentId: "2021160006",
    judulKarya: "Ekonomi Kreatif: Motor Penggerak Pertumbuhan Ekonomi Nasional",
    catatan: "Peran ekonomi kreatif dalam mendorong pertumbuhan ekonomi Indonesia."
  },
  {
    fullName: "Ahmad Fadhil",
    email: "ahmad.fadhil@ub.ac.id",
    gender: "MALE",
    whatsappNumber: "081234567896",
    institution: "Universitas Brawijaya",
    faculty: "Fakultas Ilmu Administrasi",
    studyProgram: "Administrasi Publik",
    studentId: "2021170007",
    judulKarya: "Good Governance: Kunci Pembangunan Berkelanjutan",
    catatan: "Implementasi good governance dalam pembangunan daerah di Indonesia."
  },
  {
    fullName: "Dina Safitri",
    email: "dina.safitri@unhas.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234567897",
    institution: "Universitas Hasanuddin",
    faculty: "Fakultas Hukum",
    studyProgram: "Ilmu Hukum",
    studentId: "2021180008",
    judulKarya: "Reformasi Hukum Digital: Menjawab Tantangan Era Digital",
    catatan: "Urgensi reformasi hukum untuk menghadapi perkembangan teknologi digital."
  }
]

async function createSPCTestData() {
  console.log('🎯 Creating SPC test data...')

  try {
    // Get SPC competition
    let spcCompetition = await prisma.competition.findFirst({
      where: { type: 'SPC' }
    })

    if (!spcCompetition) {
      console.log('📝 Creating SPC competition...')
      spcCompetition = await prisma.competition.create({
        data: {
          name: "Speech Competition",
          shortName: "SPC",
          type: "SPC",
          category: "academic",
          description: "Kompetisi pidato bahasa Indonesia dengan tema inovasi dan teknologi",
          earlyBirdPrice: 75000,
          phase1Price: 100000,
          phase2Price: 125000,
          earlyBirdStart: new Date('2025-01-01'),
          earlyBirdEnd: new Date('2025-02-01'),
          phase1Start: new Date('2025-02-01'),
          phase1End: new Date('2025-03-01'),
          phase2Start: new Date('2025-03-01'),
          phase2End: new Date('2025-03-15'),
          workUploadDeadline: new Date('2025-03-20'),
          competitionDate: new Date('2025-04-15'),
          maxTeamSize: 1,
          minTeamSize: 1,
          isActive: true
        }
      })
    }

    // Create participants and registrations
    for (let i = 0; i < mockSPCParticipants.length; i++) {
      const participantData = mockSPCParticipants[i]

      console.log(`👤 Creating participant ${i + 1}: ${participantData.fullName}`)

      // Create user account (check if exists first)
      const hashedPassword = await bcrypt.hash('password123', 10)

      let user = await prisma.user.findUnique({
        where: { email: participantData.email }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: participantData.fullName,
            email: participantData.email,
            password: hashedPassword,
            role: 'participant',
            emailVerified: new Date()
          }
        })
      }

      // Create participant profile (check if exists first)
      let participant = await prisma.participant.findUnique({
        where: { userId: user.id }
      })

      if (!participant) {
        participant = await prisma.participant.create({
          data: {
            userId: user.id,
            fullName: participantData.fullName,
            email: participantData.email,
            gender: participantData.gender,
            whatsappNumber: participantData.whatsappNumber,
            institution: participantData.institution,
            faculty: participantData.faculty,
            studyProgram: participantData.studyProgram,
            studentId: participantData.studentId,
            fullAddress: `Alamat lengkap ${participantData.fullName}, ${participantData.institution}`
          }
        })
      }

      // Create registration
      const registration = await prisma.registration.create({
        data: {
          participantId: participant.id,
          competitionId: spcCompetition.id,
          status: 'VERIFIED', // Already approved
          paymentPhase: 'EARLY_BIRD',
          paymentAmount: spcCompetition.earlyBirdPrice,
          paymentCode: `SPC${String(i + 1).padStart(3, '0')}`,
          paymentProofUrl: `https://example.com/payment-proof-spc-${i + 1}.jpg`,
          agreementAccepted: true
        }
      })

      // Create SPC submission with work
      const submission = await prisma.sPCSubmission.create({
        data: {
          registrationId: registration.id,
          judulKarya: participantData.judulKarya,
          catatan: participantData.catatan,
          fileKarya: `https://example.com/spc-karya-${i + 1}.pdf`,

          // Semifinal evaluation fields (some already evaluated, some pending)
          strukturOrganisasi: i < 4 ? Math.floor(Math.random() * 3) + 3 : null, // 3-5 rating for first 4
          kualitasArgumen: i < 4 ? Math.floor(Math.random() * 3) + 3 : null,
          gayaBahasaTulis: i < 4 ? Math.floor(Math.random() * 3) + 3 : null,
          feedback: i < 4 ? `Karya yang baik dengan argumen yang solid. ${participantData.fullName} menunjukkan pemahaman yang mendalam tentang topik.` : null,

          // Status based on evaluation
          status: i < 3 ? 'QUALIFIED' : (i < 4 ? 'NOT_QUALIFIED' : 'PENDING'),
          qualifiedToFinal: i < 3, // First 3 qualified to final
          evaluatedAt: i < 4 ? new Date() : null,
          evaluatedBy: i < 4 ? 'judge-user-id' : null,

          // Final stage details for qualified participants
          presentationOrder: i < 3 ? i + 1 : null,
          presentationTitle: i < 3 ? participantData.judulKarya : null,
          scheduledTime: i < 3 ? `${String(9 + Math.floor((i * 15) / 60)).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')} - ${String(9 + Math.floor(((i + 1) * 15) / 60)).padStart(2, '0')}:${String(((i + 1) * 15) % 60).padStart(2, '0')}` : null, // 15 min intervals starting from 09:00

          submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        }
      })

      console.log(`✅ Created: ${participantData.fullName} - Status: ${submission.status}`)
    }

    // Create some final scores for testing (from different judges)
    const qualifiedSubmissions = await prisma.sPCSubmission.findMany({
      where: { status: 'QUALIFIED' },
      take: 3
    })

    // Mock judges
    const judges = [
      { id: 'judge1', name: 'Dr. Andi Wijaya' },
      { id: 'judge2', name: 'Prof. Siti Nurhaliza' },
      { id: 'judge3', name: 'Dr. Budi Hartono' }
    ]

    for (let i = 0; i < qualifiedSubmissions.length; i++) {
      const submission = qualifiedSubmissions[i]

      // Create scores from 2-3 judges for each participant
      const numJudges = Math.floor(Math.random() * 2) + 2 // 2-3 judges

      for (let j = 0; j < numJudges; j++) {
        const judge = judges[j]

        const materi = Math.floor(Math.random() * 20) + 75 // 75-95
        const penyampaian = Math.floor(Math.random() * 20) + 70 // 70-90
        const bahasa = Math.floor(Math.random() * 20) + 80 // 80-100

        await prisma.sPCFinalScore.create({
          data: {
            submissionId: submission.id,
            judgeId: judge.id,
            judgeName: judge.name,
            materi: materi,
            penyampaian: penyampaian,
            bahasa: bahasa,
            total: materi + penyampaian + bahasa,
            feedback: `Presentasi yang sangat baik dari ${submission.judulKarya}. Penyampaian yang menarik dan argumen yang kuat.`,
            createdAt: new Date()
          }
        })
      }

      console.log(`🏆 Created final scores for: ${submission.judulKarya}`)
    }

    console.log('\n🎉 SPC test data created successfully!')
    console.log('\n📊 Summary:')
    console.log(`   👥 Participants: ${mockSPCParticipants.length}`)
    console.log(`   ✅ Verified registrations: ${mockSPCParticipants.length}`)
    console.log(`   📝 Submissions: ${mockSPCParticipants.length}`)
    console.log(`   🎯 Qualified for final: 3`)
    console.log(`   ❌ Not qualified: 1`)
    console.log(`   ⏳ Pending evaluation: 4`)
    console.log(`   🏆 Final scores created for qualified participants`)

    console.log('\n🔑 Test credentials:')
    mockSPCParticipants.forEach((p, i) => {
      console.log(`   Email: ${p.email} | Password: password123`)
    })

  } catch (error) {
    console.error('❌ Error creating SPC test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  createSPCTestData()
    .then(() => {
      console.log('✅ SPC test data script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ SPC test data script failed:', error)
      process.exit(1)
    })
}

module.exports = { createSPCTestData }