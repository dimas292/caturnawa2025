// scripts/generate-kdbi-participants.js
// Script to generate mock KDBI participants for testing

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Mock data arrays
const universities = [
  'Universitas Indonesia',
  'Institut Teknologi Bandung',
  'Universitas Gadjah Mada',
  'Universitas Airlangga',
  'Universitas Brawijaya',
  'Universitas Diponegoro',
  'Universitas Padjadjaran',
  'Institut Teknologi Sepuluh Nopember',
  'Universitas Sebelas Maret',
  'Universitas Hasanuddin',
  'Universitas Padjadjaran',
  'Universitas Padjadjaran'
]

const faculties = [
  'Fakultas Hukum',
  'Fakultas Ekonomi dan Bisnis',
  'Fakultas Ilmu Sosial dan Ilmu Politik',
  'Fakultas Psikologi',
  'Fakultas Ilmu Budaya',
  'Fakultas Komunikasi dan Informatika',
  'Fakultas Teknik',
  'Fakultas Kedokteran',
  'Fakultas Ilmu Komunikasi',
  'Fakultas Ilmu Komunikasi',
]

const studyPrograms = [
  'Ilmu Hukum',
  'Manajemen',
  'Akuntansi',
  'Ilmu Komunikasi',
  'Hubungan Internasional',
  'Psikologi',
  'Sastra Indonesia',
  'Teknik Informatika',
  'Teknik Informatika',
  'Teknik Informatika'
]

const firstNames = [
  'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gilang', 'Hana',
  'Indra', 'Joko', 'Kartika', 'Lina', 'Maya', 'Nanda', 'Oka', 'Putri',
  'Qori', 'Rina', 'Sari', 'Toni', 'Umar', 'Vina', 'Wati', 'Yudi', 'Zara'
]

const lastNames = [
  'Pratama', 'Sari', 'Wijaya', 'Putri', 'Santoso', 'Lestari', 'Kurniawan',
  'Anggraini', 'Setiawan', 'Maharani', 'Nugroho', 'Permata', 'Hakim',
  'Safitri', 'Ramadhan', 'Kusuma', 'Wardani', 'Prabowo', 'Melati', 'Surya'
]

const teamNames = [
  'Garuda Nusantara',
  'Bhineka Tunggal Ika',
  'Merah Putih',
  'Pancasila Warriors',
  'Nusantara Debaters',
  'Indonesia Merdeka',
  'Sang Saka Merah Putih',
  'Bhinneka Speakers',
  'Archipelago Voices',
  'Tricolor Debaters',
  'Majapahit Speakers',
  'Sriwijaya Debaters',
  'Borobudur Voices',
  'Prambanan Speakers',
  'Krakatau Debaters'
]

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function generateEmail(firstName, lastName, index = null) {
  const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
  const timestamp = Date.now().toString().slice(-4)
  const randomId = Math.floor(Math.random() * 1000)
  
  if (index !== null) {
    return `${baseEmail}.${index}.${timestamp}@email.com`
  }
  return `${baseEmail}.${randomId}.${timestamp}@email.com`
}

function generatePhone() {
  return `08${Math.floor(Math.random() * 900000000 + 100000000)}`
}

function generateStudentId() {
  return `${Math.floor(Math.random() * 90000 + 10000)}${Math.floor(Math.random() * 900 + 100)}`
}

function generatePaymentCode() {
  return `KDBI${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`
}

// Mock file URLs (these would be actual uploaded files in production)
const mockFileUrls = {
  ktm: '/uploads/mock/ktm_sample.pdf',
  photo: '/uploads/mock/photo_sample.jpg',
  khs: '/uploads/mock/khs_sample.pdf',
  twibbon: '/uploads/mock/twibbon_sample.jpg',
  socialMedia: '/uploads/mock/social_media_sample.jpg',
  delegationLetter: '/uploads/mock/delegation_letter_sample.pdf',
  achievements: '/uploads/mock/achievements_sample.pdf',
  pddikti: '/uploads/mock/pddikti_sample.jpg',
  instagramFollow: '/uploads/mock/instagram_follow_sample.jpg',
  youtubeFollow: '/uploads/mock/youtube_follow_sample.jpg',
  tiktokFollow: '/uploads/mock/tiktok_follow_sample.jpg',
  attendanceCommitment: '/uploads/mock/attendance_commitment_sample.pdf',
  paymentProof: '/uploads/mock/payment_proof_sample.jpg'
}

async function createKDBIParticipant(teamIndex) {
  const teamName = teamNames[teamIndex]
  const university = getRandomElement(universities)
  const faculty = getRandomElement(faculties)
  const studyProgram = getRandomElement(studyPrograms)
  
  // Create team leader (participant)
  const leaderFirstName = getRandomElement(firstNames)
  const leaderLastName = getRandomElement(lastNames)
  const leaderEmail = generateEmail(leaderFirstName, leaderLastName, `leader${teamIndex}`)
  
  // Create user account for team leader
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const leaderUser = await prisma.user.create({
    data: {
      name: `${leaderFirstName} ${leaderLastName}`,
      email: leaderEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: 'participant',
      emailVerified: new Date()
    }
  })

  // Create participant profile for team leader
  const leaderParticipant = await prisma.participant.create({
    data: {
      userId: leaderUser.id,
      fullName: `${leaderFirstName} ${leaderLastName}`,
      email: leaderEmail.toLowerCase().trim(),
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      fullAddress: `Jl. ${getRandomElement(['Sudirman', 'Thamrin', 'Gatot Subroto', 'Kuningan', 'Senayan'])} No. ${Math.floor(Math.random() * 100 + 1)}, Jakarta`,
      whatsappNumber: generatePhone(),
      institution: university,
      faculty: faculty,
      studyProgram: studyProgram,
      studentId: generateStudentId()
    }
  })

  // Get KDBI competition
  const kdbiCompetition = await prisma.competition.findUnique({
    where: { type: 'KDBI' }
  })

  if (!kdbiCompetition) {
    throw new Error('KDBI competition not found. Please create it first.')
  }

  // Create registration
  const registration = await prisma.registration.create({
    data: {
      participantId: leaderParticipant.id,
      competitionId: kdbiCompetition.id,
      teamName: teamName,
      status: 'VERIFIED', // Set as verified for testing
      paymentPhase: 'PHASE_1',
      paymentAmount: kdbiCompetition.phase1Price,
      paymentCode: generatePaymentCode(),
      paymentProofUrl: mockFileUrls.paymentProof,
      agreementAccepted: true,
      verifiedAt: new Date(),
      verifiedBy: 'admin'
    }
  })

  // Create team members (KDBI is team competition with 2 speakers)
  const teamMembers = []
  
  // Team Leader (Speaker 1)
  const leaderMember = await prisma.teamMember.create({
    data: {
      registrationId: registration.id,
      participantId: leaderParticipant.id,
      role: 'LEADER',
      position: 1,
      fullName: `${leaderFirstName} ${leaderLastName}`,
      email: leaderEmail.toLowerCase().trim(),
      phone: generatePhone(),
      institution: university,
      faculty: faculty,
      studentId: generateStudentId(),
      ktmFile: mockFileUrls.ktm,
      photoFile: mockFileUrls.photo,
      khsFile: mockFileUrls.khs,
      socialMediaProof: mockFileUrls.socialMedia,
      twibbonProof: mockFileUrls.twibbon,
      delegationLetter: mockFileUrls.delegationLetter,
      achievementsProof: mockFileUrls.achievements,
      pddiktiProof: mockFileUrls.pddikti,
      instagramFollowProof: mockFileUrls.instagramFollow,
      youtubeFollowProof: mockFileUrls.youtubeFollow,
      tiktokFollowProof: mockFileUrls.tiktokFollow,
      attendanceCommitmentLetter: mockFileUrls.attendanceCommitment
    }
  })
  teamMembers.push(leaderMember)

  // Team Member (Speaker 2)
  const memberFirstName = getRandomElement(firstNames)
  const memberLastName = getRandomElement(lastNames)
  const memberEmail = generateEmail(memberFirstName, memberLastName, `member${teamIndex}`)
  
  // Create user account for team member
  const memberUser = await prisma.user.create({
    data: {
      name: `${memberFirstName} ${memberLastName}`,
      email: memberEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: 'participant',
      emailVerified: new Date()
    }
  })

  // Create participant profile for team member
  const memberParticipant = await prisma.participant.create({
    data: {
      userId: memberUser.id,
      fullName: `${memberFirstName} ${memberLastName}`,
      email: memberEmail.toLowerCase().trim(),
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      fullAddress: `Jl. ${getRandomElement(['Sudirman', 'Thamrin', 'Gatot Subroto', 'Kuningan', 'Senayan'])} No. ${Math.floor(Math.random() * 100 + 1)}, Jakarta`,
      whatsappNumber: generatePhone(),
      institution: university,
      faculty: faculty,
      studyProgram: studyProgram,
      studentId: generateStudentId()
    }
  })

  const member = await prisma.teamMember.create({
    data: {
      registrationId: registration.id,
      participantId: memberParticipant.id,
      role: 'MEMBER',
      position: 2,
      fullName: `${memberFirstName} ${memberLastName}`,
      email: memberEmail.toLowerCase().trim(),
      phone: generatePhone(),
      institution: university,
      faculty: faculty,
      studentId: generateStudentId(),
      ktmFile: mockFileUrls.ktm,
      photoFile: mockFileUrls.photo,
      khsFile: mockFileUrls.khs,
      socialMediaProof: mockFileUrls.socialMedia,
      twibbonProof: mockFileUrls.twibbon,
      delegationLetter: mockFileUrls.delegationLetter,
      achievementsProof: mockFileUrls.achievements,
      pddiktiProof: mockFileUrls.pddikti,
      instagramFollowProof: mockFileUrls.instagramFollow,
      youtubeFollowProof: mockFileUrls.youtubeFollow,
      tiktokFollowProof: mockFileUrls.tiktokFollow,
      attendanceCommitmentLetter: mockFileUrls.attendanceCommitment
    }
  })
  teamMembers.push(member)

  // Create registration files
  const fileTypes = [
    'KTM', 'PAS_FOTO', 'KHS', 'TWIBBON', 'SOCIAL_MEDIA', 
    'DELEGATION_LETTER', 'ACHIEVEMENTS_PROOF', 'PAYMENT_PROOF'
  ]

  for (const fileType of fileTypes) {
    await prisma.registrationFile.create({
      data: {
        registrationId: registration.id,
        fileName: `${fileType.toLowerCase()}_${teamName.replace(/\s+/g, '_')}.pdf`,
        fileType: fileType,
        fileUrl: mockFileUrls[fileType.toLowerCase()] || mockFileUrls.ktm,
        fileSize: Math.floor(Math.random() * 5000000 + 100000), // 100KB - 5MB
        mimeType: fileType === 'PAS_FOTO' || fileType === 'TWIBBON' || fileType === 'SOCIAL_MEDIA' ? 'image/jpeg' : 'application/pdf',
        originalName: `${fileType}_original.${fileType === 'PAS_FOTO' || fileType === 'TWIBBON' || fileType === 'SOCIAL_MEDIA' ? 'jpg' : 'pdf'}`
      }
    })
  }

  // Create team standing for debate
  await prisma.teamStanding.create({
    data: {
      registrationId: registration.id,
      teamPoints: 0,
      speakerPoints: 0,
      averageSpeakerPoints: 0,
      matchesPlayed: 0,
      firstPlaces: 0,
      secondPlaces: 0,
      thirdPlaces: 0,
      fourthPlaces: 0,
      avgPosition: 0
    }
  })

  console.log(`✅ Created KDBI team: ${teamName} from ${university}`)
  console.log(`   Leader: ${leaderFirstName} ${leaderLastName} (${leaderEmail})`)
  console.log(`   Member: ${memberFirstName} ${memberLastName} (${memberEmail})`)
  
  return {
    registration,
    teamMembers,
    teamName,
    university
  }
}

async function generateKDBIParticipants(count = 10) {
  console.log(`🚀 Generating ${count} KDBI teams...`)
  
  try {
    // Check if KDBI competition exists
    const kdbiCompetition = await prisma.competition.findUnique({
      where: { type: 'KDBI' }
    })

    if (!kdbiCompetition) {
      console.log('❌ KDBI competition not found. Creating it first...')
      
      // Create KDBI competition
      await prisma.competition.create({
        data: {
          name: 'Kompetisi Debat Bahasa Indonesia',
          shortName: 'KDBI',
          type: 'KDBI',
          category: 'debate',
          description: 'Kompetisi debat menggunakan Bahasa Indonesia dengan format British Parliamentary',
          earlyBirdPrice: 200000, // Rp 200,000
          phase1Price: 225000,    // Rp 225,000
          phase2Price: 250000,    // Rp 250,000
          earlyBirdStart: new Date('2025-09-01'),
          earlyBirdEnd: new Date('2025-09-07'),
          phase1Start: new Date('2025-09-08'),
          phase1End: new Date('2025-09-19'),
          phase2Start: new Date('2025-09-20'),
          phase2End: new Date('2025-09-28'),
          competitionDate: new Date('2025-11-06'),
          maxTeamSize: 2,
          minTeamSize: 2,
          isActive: true
        }
      })
      console.log('✅ KDBI competition created')
    }

    const teams = []
    for (let i = 0; i <= 12; i++) {
      const team = await createKDBIParticipant(i)
      teams.push(team)
      
      // Add small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n🎉 Successfully generated ${teams.length} KDBI teams!`)
    console.log('\n📊 Summary:')
    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.teamName} - ${team.university}`)
    })

    console.log('\n🔑 Login credentials for all participants:')
    console.log('Password: password123')
    console.log('\n📝 All teams are set to VERIFIED status for testing purposes')
    
  } catch (error) {
    console.error('❌ Error generating KDBI participants:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 10
  generateKDBIParticipants(count)
    .catch(console.error)
}

module.exports = { generateKDBIParticipants, createKDBIParticipant }
