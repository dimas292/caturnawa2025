const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Mock data untuk DCC Infografis
const mockInfografisParticipants = [
  {
    fullName: "Rina Kartika",
    email: "rina.kartika@ui.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234560001",
    institution: "Universitas Indonesia",
    faculty: "Fakultas Ilmu Komputer",
    studyProgram: "Sistem Informasi",
    studentId: "2021210001",
    judulKarya: "Dampak Perubahan Iklim terhadap Ekosistem Laut Indonesia",
    deskripsiKarya: "Infografis yang menggambarkan dampak perubahan iklim terhadap kehidupan laut di Indonesia dengan visualisasi data yang menarik."
  },
  {
    fullName: "Dimas Prasetyo",
    email: "dimas.prasetyo@itb.ac.id",
    gender: "MALE",
    whatsappNumber: "081234560002",
    institution: "Institut Teknologi Bandung",
    faculty: "Fakultas Seni Rupa dan Desain",
    studyProgram: "Desain Komunikasi Visual",
    studentId: "2021220002",
    judulKarya: "Revolusi Energi Terbarukan di Indonesia",
    deskripsiKarya: "Visualisasi potensi dan perkembangan energi terbarukan di Indonesia melalui desain infografis yang informatif."
  },
  {
    fullName: "Ayu Lestari",
    email: "ayu.lestari@ugm.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234560003",
    institution: "Universitas Gadjah Mada",
    faculty: "Fakultas Ilmu Sosial dan Ilmu Politik",
    studyProgram: "Ilmu Komunikasi",
    studentId: "2021230003",
    judulKarya: "Literasi Digital untuk Generasi Muda Indonesia",
    deskripsiKarya: "Infografis edukatif tentang pentingnya literasi digital di era teknologi modern."
  },
  {
    fullName: "Farhan Maulana",
    email: "farhan.maulana@unair.ac.id",
    gender: "MALE",
    whatsappNumber: "081234560004",
    institution: "Universitas Airlangga",
    faculty: "Fakultas Kesehatan Masyarakat",
    studyProgram: "Kesehatan Masyarakat",
    studentId: "2021240004",
    judulKarya: "Pencegahan Stunting: Langkah Menuju Generasi Sehat",
    deskripsiKarya: "Infografis yang menjelaskan cara pencegahan stunting pada anak dengan visualisasi yang mudah dipahami."
  },
  {
    fullName: "Sinta Dewi",
    email: "sinta.dewi@its.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234560005",
    institution: "Institut Teknologi Sepuluh Nopember",
    faculty: "Fakultas Teknologi Informasi",
    studyProgram: "Desain Produk Industri",
    studentId: "2021250005",
    judulKarya: "Smart City: Kota Cerdas untuk Masa Depan Indonesia",
    deskripsiKarya: "Konsep smart city dan implementasinya di Indonesia dalam bentuk infografis interaktif."
  },
  {
    fullName: "Reza Firmansyah",
    email: "reza.firmansyah@undip.ac.id",
    gender: "MALE",
    whatsappNumber: "081234560006",
    institution: "Universitas Diponegoro",
    faculty: "Fakultas Teknik",
    studyProgram: "Arsitektur",
    studentId: "2021260006",
    judulKarya: "Arsitektur Berkelanjutan: Solusi Hunian Ramah Lingkungan",
    deskripsiKarya: "Infografis tentang konsep arsitektur berkelanjutan dan penerapannya di Indonesia."
  }
]

// Mock data untuk DCC Short Video
const mockShortVideoParticipants = [
  {
    fullName: "Kevin Adiputra",
    email: "kevin.adiputra@ui.ac.id",
    gender: "MALE",
    whatsappNumber: "081234570001",
    institution: "Universitas Indonesia",
    faculty: "Fakultas Ilmu Pengetahuan Budaya",
    studyProgram: "Ilmu Sejarah",
    studentId: "2021310001",
    judulKarya: "Jejak Pahlawan: Kisah Perjuangan Kemerdekaan Indonesia",
    deskripsiKarya: "Video pendek yang menceritakan perjuangan pahlawan Indonesia dalam merebut kemerdekaan dengan sinematografi yang menarik."
  },
  {
    fullName: "Nadya Putri",
    email: "nadya.putri@itb.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234570002",
    institution: "Institut Teknologi Bandung",
    faculty: "Fakultas Seni Rupa dan Desain",
    studyProgram: "Film dan Televisi",
    studentId: "2021320002",
    judulKarya: "Harmoni Alam: Keindahan Nusantara dalam Bingkai",
    deskripsiKarya: "Dokumenter pendek yang menampilkan keindahan alam Indonesia dengan teknik sinematografi profesional."
  },
  {
    fullName: "Arif Budiman",
    email: "arif.budiman@ugm.ac.id",
    gender: "MALE",
    whatsappNumber: "081234570003",
    institution: "Universitas Gadjah Mada",
    faculty: "Fakultas Ilmu Budaya",
    studyProgram: "Sastra Indonesia",
    studentId: "2021330003",
    judulKarya: "Warisan Budaya: Melestarikan Tradisi di Era Modern",
    deskripsiKarya: "Video yang mengangkat pentingnya pelestarian budaya tradisional Indonesia di tengah modernisasi."
  },
  {
    fullName: "Lina Marlina",
    email: "lina.marlina@unair.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234570004",
    institution: "Universitas Airlangga",
    faculty: "Fakultas Ilmu Sosial dan Ilmu Politik",
    studyProgram: "Sosiologi",
    studentId: "2021340004",
    judulKarya: "Suara Milenial: Peran Generasi Muda dalam Pembangunan",
    deskripsiKarya: "Video dokumenter tentang kontribusi generasi muda dalam pembangunan Indonesia."
  },
  {
    fullName: "Yoga Pratama",
    email: "yoga.pratama@its.ac.id",
    gender: "MALE",
    whatsappNumber: "081234570005",
    institution: "Institut Teknologi Sepuluh Nopember",
    faculty: "Fakultas Teknologi Informasi",
    studyProgram: "Teknologi Multimedia",
    studentId: "2021350005",
    judulKarya: "Inovasi Teknologi: Solusi Cerdas untuk Indonesia",
    deskripsiKarya: "Video yang menampilkan berbagai inovasi teknologi karya anak bangsa untuk menyelesaikan masalah di Indonesia."
  },
  {
    fullName: "Fitri Handayani",
    email: "fitri.handayani@undip.ac.id",
    gender: "FEMALE",
    whatsappNumber: "081234570006",
    institution: "Universitas Diponegoro",
    faculty: "Fakultas Ekonomika dan Bisnis",
    studyProgram: "Manajemen",
    studentId: "2021360006",
    judulKarya: "UMKM Go Digital: Transformasi Bisnis Lokal",
    deskripsiKarya: "Video tentang transformasi digital UMKM Indonesia dan dampaknya terhadap perekonomian."
  }
]

async function createDCCTestData() {
  console.log('🎨 Creating DCC test data...')

  try {
    // Get or create DCC Infografis competition
    let infografisCompetition = await prisma.competition.findFirst({
      where: { type: 'DCC_INFOGRAFIS' }
    })

    if (!infografisCompetition) {
      console.log('📝 Creating DCC Infografis competition...')
      infografisCompetition = await prisma.competition.create({
        data: {
          name: "Digital Creative Competition - Infografis",
          shortName: "DCC Infografis",
          type: "DCC_INFOGRAFIS",
          category: "creative",
          description: "Kompetisi desain infografis dengan tema inovasi dan kreativitas",
          earlyBirdPrice: 50000,
          phase1Price: 75000,
          phase2Price: 100000,
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

    // Get or create DCC Short Video competition
    let shortVideoCompetition = await prisma.competition.findFirst({
      where: { type: 'DCC_SHORT_VIDEO' }
    })

    if (!shortVideoCompetition) {
      console.log('📝 Creating DCC Short Video competition...')
      shortVideoCompetition = await prisma.competition.create({
        data: {
          name: "Digital Creative Competition - Short Video",
          shortName: "DCC Short Video",
          type: "DCC_SHORT_VIDEO",
          category: "creative",
          description: "Kompetisi video pendek dengan tema kreativitas dan sinematografi",
          earlyBirdPrice: 50000,
          phase1Price: 75000,
          phase2Price: 100000,
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

    // Create Infografis participants
    console.log('\n📊 Creating Infografis participants...')
    for (let i = 0; i < mockInfografisParticipants.length; i++) {
      const participantData = mockInfografisParticipants[i]

      console.log(`👤 Creating participant ${i + 1}: ${participantData.fullName}`)

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
          competitionId: infografisCompetition.id,
          status: 'VERIFIED',
          paymentPhase: 'EARLY_BIRD',
          paymentAmount: infografisCompetition.earlyBirdPrice,
          paymentCode: `INFG${String(i + 1).padStart(3, '0')}`,
          paymentProofUrl: `https://example.com/payment-proof-infografis-${i + 1}.jpg`,
          agreementAccepted: true
        }
      })

      // Create DCC submission with work
      const submission = await prisma.dCCSubmission.create({
        data: {
          registrationId: registration.id,
          judulKarya: participantData.judulKarya,
          deskripsiKarya: participantData.deskripsiKarya,
          catatan: `Karya ini dibuat dengan penuh dedikasi oleh ${participantData.fullName}`,
          fileKarya: `https://example.com/infografis-${i + 1}.png`,
          suratOrisinalitas: `https://example.com/surat-orisinalitas-infografis-${i + 1}.pdf`,
          suratPengalihanHakCipta: `https://example.com/surat-hak-cipta-infografis-${i + 1}.pdf`,
          status: 'PENDING'
        }
      })

      console.log(`✅ Created Infografis: ${participantData.fullName} - ${participantData.judulKarya}`)
    }

    // Create Short Video participants
    console.log('\n🎬 Creating Short Video participants...')
    for (let i = 0; i < mockShortVideoParticipants.length; i++) {
      const participantData = mockShortVideoParticipants[i]

      console.log(`👤 Creating participant ${i + 1}: ${participantData.fullName}`)

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
          competitionId: shortVideoCompetition.id,
          status: 'VERIFIED',
          paymentPhase: 'EARLY_BIRD',
          paymentAmount: shortVideoCompetition.earlyBirdPrice,
          paymentCode: `VIDX${String(i + 1).padStart(3, '0')}`,
          paymentProofUrl: `https://example.com/payment-proof-video-${i + 1}.jpg`,
          agreementAccepted: true
        }
      })

      // Create DCC submission with work
      const submission = await prisma.dCCSubmission.create({
        data: {
          registrationId: registration.id,
          judulKarya: participantData.judulKarya,
          deskripsiKarya: participantData.deskripsiKarya,
          catatan: `Video ini diproduksi dengan kualitas terbaik oleh ${participantData.fullName}`,
          fileKarya: `https://example.com/short-video-${i + 1}.mp4`,
          suratOrisinalitas: `https://example.com/surat-orisinalitas-video-${i + 1}.pdf`,
          suratPengalihanHakCipta: `https://example.com/surat-hak-cipta-video-${i + 1}.pdf`,
          status: 'PENDING'
        }
      })

      console.log(`✅ Created Short Video: ${participantData.fullName} - ${participantData.judulKarya}`)
    }

    console.log('\n🎉 DCC test data created successfully!')
    console.log('\n📊 Summary:')
    console.log(`   📊 Infografis participants: ${mockInfografisParticipants.length}`)
    console.log(`   🎬 Short Video participants: ${mockShortVideoParticipants.length}`)
    console.log(`   ✅ All registrations verified`)
    console.log(`   📝 All submissions ready for judging`)

    console.log('\n🔑 Test credentials (Infografis):')
    mockInfografisParticipants.forEach((p) => {
      console.log(`   Email: ${p.email} | Password: password123`)
    })

    console.log('\n🔑 Test credentials (Short Video):')
    mockShortVideoParticipants.forEach((p) => {
      console.log(`   Email: ${p.email} | Password: password123`)
    })

  } catch (error) {
    console.error('❌ Error creating DCC test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  createDCCTestData()
    .then(() => {
      console.log('✅ DCC test data script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ DCC test data script failed:', error)
      process.exit(1)
    })
}

module.exports = { createDCCTestData }
