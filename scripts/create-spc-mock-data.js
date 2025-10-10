// Mock data untuk testing SPC tanpa database
// File ini bisa digunakan untuk menguji UI dengan data mock

const mockSPCSubmissions = [
  {
    id: 'spc-001',
    participantName: 'Andi Pratama',
    institution: 'Universitas Indonesia',
    submissionTitle: 'Transformasi Digital: Peluang dan Tantangan bagi Generasi Muda',
    submittedAt: '2025-01-12T10:30:00Z',
    fileUrl: '/api/files/spc-001-karya.pdf',
    fileName: 'karya-andi-pratama.pdf',
    fileSize: '2.1 MB',
    status: 'pending',
    notes: null
  },
  {
    id: 'spc-002',
    participantName: 'Sari Dewi',
    institution: 'Institut Teknologi Bandung',
    submissionTitle: 'Inovasi Teknologi untuk Sustainable Development Goals',
    submittedAt: '2025-01-12T14:15:00Z',
    fileUrl: '/api/files/spc-002-karya.pdf',
    fileName: 'karya-sari-dewi.pdf',
    fileSize: '3.2 MB',
    status: 'pending',
    notes: null
  },
  {
    id: 'spc-003',
    participantName: 'Budi Santoso',
    institution: 'Universitas Gadjah Mada',
    submissionTitle: 'Kecerdasan Buatan: Masa Depan Pendidikan di Indonesia',
    submittedAt: '2025-01-13T09:20:00Z',
    fileUrl: '/api/files/spc-003-karya.pdf',
    fileName: 'karya-budi-santoso.pdf',
    fileSize: '2.8 MB',
    status: 'qualified',
    notes: 'Karya yang sangat baik dengan argumen yang kuat dan struktur yang jelas.'
  },
  {
    id: 'spc-004',
    participantName: 'Maya Kusuma',
    institution: 'Universitas Airlangga',
    submissionTitle: 'Mental Health Awareness di Era Media Sosial',
    submittedAt: '2025-01-13T16:45:00Z',
    fileUrl: '/api/files/spc-004-karya.pdf',
    fileName: 'karya-maya-kusuma.pdf',
    fileSize: '2.5 MB',
    status: 'qualified',
    notes: 'Analisis yang mendalam tentang isu kesehatan mental yang relevan.'
  },
  {
    id: 'spc-005',
    participantName: 'Rizki Firmansyah',
    institution: 'Institut Teknologi Sepuluh Nopember',
    submissionTitle: 'Revolusi Industri 4.0: Adaptasi UMKM Indonesia',
    submittedAt: '2025-01-14T11:10:00Z',
    fileUrl: '/api/files/spc-005-karya.pdf',
    fileName: 'karya-rizki-firmansyah.pdf',
    fileSize: '3.1 MB',
    status: 'qualified',
    notes: 'Penelitian yang komprehensif dengan solusi praktis untuk UMKM.'
  },
  {
    id: 'spc-006',
    participantName: 'Putri Maharani',
    institution: 'Universitas Diponegoro',
    submissionTitle: 'Ekonomi Kreatif: Motor Penggerak Pertumbuhan Ekonomi Nasional',
    submittedAt: '2025-01-14T15:30:00Z',
    fileUrl: '/api/files/spc-006-karya.pdf',
    fileName: 'karya-putri-maharani.pdf',
    fileSize: '2.7 MB',
    status: 'not_qualified',
    notes: 'Argumentasi perlu diperkuat dengan data yang lebih akurat.'
  },
  {
    id: 'spc-007',
    participantName: 'Ahmad Fadhil',
    institution: 'Universitas Brawijaya',
    submissionTitle: 'Good Governance: Kunci Pembangunan Berkelanjutan',
    submittedAt: '2025-01-15T08:15:00Z',
    fileUrl: '/api/files/spc-007-karya.pdf',
    fileName: 'karya-ahmad-fadhil.pdf',
    fileSize: '2.9 MB',
    status: 'pending',
    notes: null
  },
  {
    id: 'spc-008',
    participantName: 'Dina Safitri',
    institution: 'Universitas Hasanuddin',
    submissionTitle: 'Reformasi Hukum Digital: Menjawab Tantangan Era Digital',
    submittedAt: '2025-01-15T12:40:00Z',
    fileUrl: '/api/files/spc-008-karya.pdf',
    fileName: 'karya-dina-safitri.pdf',
    fileSize: '3.3 MB',
    status: 'pending',
    notes: null
  }
]

const mockSPCFinalists = [
  {
    id: 'spc-003',
    participantName: 'Budi Santoso',
    institution: 'Universitas Gadjah Mada',
    presentationOrder: 1,
    status: 'waiting',
    presentationTitle: 'Kecerdasan Buatan: Masa Depan Pendidikan di Indonesia',
    scheduledTime: '09:00 - 09:15'
  },
  {
    id: 'spc-004',
    participantName: 'Maya Kusuma',
    institution: 'Universitas Airlangga',
    presentationOrder: 2,
    status: 'waiting',
    presentationTitle: 'Mental Health Awareness di Era Media Sosial',
    scheduledTime: '09:15 - 09:30'
  },
  {
    id: 'spc-005',
    participantName: 'Rizki Firmansyah',
    institution: 'Institut Teknologi Sepuluh Nopember',
    presentationOrder: 3,
    status: 'presenting',
    presentationTitle: 'Revolusi Industri 4.0: Adaptasi UMKM Indonesia',
    scheduledTime: '09:30 - 09:45'
  }
]

const mockSPCScores = [
  {
    participantId: 'spc-003',
    participantName: 'Budi Santoso',
    judgeId: 'judge1',
    judgeName: 'Dr. Andi Wijaya',
    materi: 85,
    penyampaian: 80,
    bahasa: 88,
    total: 253,
    feedback: 'Presentasi yang sangat baik dengan argumen yang kuat dan penyampaian yang menarik.'
  },
  {
    participantId: 'spc-003',
    participantName: 'Budi Santoso',
    judgeId: 'judge2',
    judgeName: 'Prof. Siti Nurhaliza',
    materi: 82,
    penyampaian: 85,
    bahasa: 86,
    total: 253,
    feedback: 'Konten yang mendalam dengan delivery yang baik, namun artikulasi bisa diperbaiki.'
  },
  {
    participantId: 'spc-004',
    participantName: 'Maya Kusuma',
    judgeId: 'judge1',
    judgeName: 'Dr. Andi Wijaya',
    materi: 88,
    penyampaian: 82,
    bahasa: 85,
    total: 255,
    feedback: 'Topik yang sangat relevan dengan analisis yang mendalam dan penyampaian yang baik.'
  }
]

// Export untuk digunakan di tempat lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mockSPCSubmissions,
    mockSPCFinalists,
    mockSPCScores
  }
}

console.log('📊 Mock SPC Data Summary:')
console.log(`   📝 Submissions: ${mockSPCSubmissions.length}`)
console.log(`   ⏳ Pending: ${mockSPCSubmissions.filter(s => s.status === 'pending').length}`)
console.log(`   ✅ Qualified: ${mockSPCSubmissions.filter(s => s.status === 'qualified').length}`)
console.log(`   ❌ Not Qualified: ${mockSPCSubmissions.filter(s => s.status === 'not_qualified').length}`)
console.log(`   🏆 Finalists: ${mockSPCFinalists.length}`)
console.log(`   📊 Scores: ${mockSPCScores.length}`)

console.log('\n🎯 Test Accounts for SPC:')
mockSPCSubmissions.forEach((sub, i) => {
  const email = sub.participantName.toLowerCase().replace(' ', '.') + '@test.com'
  console.log(`   ${sub.participantName}: ${email} | Status: ${sub.status}`)
})

console.log('\n💡 Instructions:')
console.log('   1. Use these mock data in your API endpoints for testing')
console.log('   2. Copy the data to your dashboard components')
console.log('   3. Test the UI with different statuses and scenarios')
console.log('   4. When database is ready, run the real create-spc-test-data.js script')

console.log('\n✨ Mock data ready for SPC testing!')