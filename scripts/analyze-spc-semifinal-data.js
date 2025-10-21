/**
 * Script untuk menganalisis data SPC Semifinal yang sudah ada
 * Sebelum melakukan migrasi ke tabel baru
 * 
 * Run: node scripts/analyze-spc-semifinal-data.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function analyzeSPCSemifinalData() {
  console.log('🔍 Menganalisis data SPC Semifinal existing...\n')

  try {
    // 1. Hitung total submissions
    const totalSubmissions = await prisma.sPCSubmission.count()
    console.log(`📊 Total SPC Submissions: ${totalSubmissions}`)

    // 2. Hitung submissions yang sudah dinilai (ada nilai semifinal)
    const evaluatedSubmissions = await prisma.sPCSubmission.count({
      where: {
        AND: [
          { penilaianKaryaTulisIlmiah: { not: null } },
          { substansiKaryaTulisIlmiah: { not: null } },
          { kualitasKaryaTulisIlmiah: { not: null } }
        ]
      }
    })
    console.log(`✅ Submissions yang sudah dinilai: ${evaluatedSubmissions}`)
    console.log(`⏳ Submissions belum dinilai: ${totalSubmissions - evaluatedSubmissions}\n`)

    // 3. Ambil detail submissions yang sudah dinilai
    const evaluatedDetails = await prisma.sPCSubmission.findMany({
      where: {
        AND: [
          { penilaianKaryaTulisIlmiah: { not: null } },
          { substansiKaryaTulisIlmiah: { not: null } },
          { kualitasKaryaTulisIlmiah: { not: null } }
        ]
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    })

    console.log('📋 Detail Submissions yang Sudah Dinilai:\n')
    console.log('═'.repeat(100))

    if (evaluatedDetails.length === 0) {
      console.log('✨ Tidak ada data yang perlu dimigrasi. Database masih bersih.')
    } else {
      evaluatedDetails.forEach((submission, index) => {
        console.log(`\n${index + 1}. ${submission.judulKarya}`)
        console.log(`   Peserta: ${submission.registration.participant?.fullName || 'Unknown'}`)
        console.log(`   Email: ${submission.registration.participant?.email || 'Unknown'}`)
        console.log(`   Status: ${submission.status}`)
        console.log(`   Evaluated By: ${submission.evaluatedBy || 'Unknown'}`)
        console.log(`   Evaluated At: ${submission.evaluatedAt ? new Date(submission.evaluatedAt).toLocaleString('id-ID') : 'N/A'}`)
        console.log(`   Scores:`)
        console.log(`     - Penilaian Karya: ${submission.penilaianKaryaTulisIlmiah}`)
        console.log(`     - Substansi Karya: ${submission.substansiKaryaTulisIlmiah}`)
        console.log(`     - Kualitas Karya: ${submission.kualitasKaryaTulisIlmiah}`)
        console.log(`     - Total: ${submission.totalSemifinalScore || 'N/A'}`)
        console.log(`   Catatan:`)
        console.log(`     - Penilaian: ${submission.catatanPenilaian ? '✓' : '✗'}`)
        console.log(`     - Substansi: ${submission.catatanSubstansi ? '✓' : '✗'}`)
        console.log(`     - Kualitas: ${submission.catatanKualitas ? '✓' : '✗'}`)
        console.log('   ' + '─'.repeat(95))
      })
    }

    console.log('\n' + '═'.repeat(100))

    // 4. Cek apakah ada data yang evaluatedBy null
    const nullEvaluatedBy = await prisma.sPCSubmission.count({
      where: {
        AND: [
          { penilaianKaryaTulisIlmiah: { not: null } },
          { evaluatedBy: null }
        ]
      }
    })

    if (nullEvaluatedBy > 0) {
      console.log(`\n⚠️  WARNING: Ada ${nullEvaluatedBy} submission dengan nilai tapi evaluatedBy = NULL`)
      console.log('   Ini akan menyebabkan masalah saat migrasi!')
    }

    // 5. Summary untuk migrasi
    console.log('\n📌 SUMMARY UNTUK MIGRASI:')
    console.log('─'.repeat(100))
    console.log(`✓ Total data yang akan dimigrasi: ${evaluatedSubmissions} records`)
    console.log(`✓ Data akan dipindahkan ke tabel: SPCSemifinalScore`)
    console.log(`✓ Setiap record akan menjadi 1 score dengan judgeId dari evaluatedBy`)
    
    if (nullEvaluatedBy > 0) {
      console.log(`\n⚠️  PERHATIAN: ${nullEvaluatedBy} record memiliki evaluatedBy = NULL`)
      console.log('   Solusi: Akan menggunakan judgeId = "UNKNOWN_JUDGE" untuk data ini')
    }

    console.log('\n✅ Analisis selesai. Data siap untuk dimigrasi.')
    console.log('   Next step: Update schema.prisma dan buat migration script')

  } catch (error) {
    console.error('❌ Error saat menganalisis data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the analysis
analyzeSPCSemifinalData()
  .then(() => {
    console.log('\n✨ Script selesai dijalankan')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script gagal:', error)
    process.exit(1)
  })
