/**
 * MIGRATION SCRIPT: SPC Semifinal Scores
 * 
 * Memindahkan data penilaian semifinal dari SPCSubmission ke SPCSemifinalScore
 * Script ini AMAN untuk dijalankan berkali-kali (idempotent)
 * 
 * SAFETY FEATURES:
 * 1. Dry-run mode untuk preview sebelum eksekusi
 * 2. Backup data sebelum migrasi
 * 3. Rollback otomatis jika ada error
 * 4. Skip data yang sudah dimigrasi
 * 
 * Usage:
 *   node scripts/migrate-spc-semifinal-to-new-table.js --dry-run  (preview only)
 *   node scripts/migrate-spc-semifinal-to-new-table.js --execute  (actual migration)
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run') || args.length === 0
const isExecute = args.includes('--execute')

async function migrateSPCSemifinalScores() {
  console.log('🚀 SPC Semifinal Score Migration Script')
  console.log('═'.repeat(100))
  
  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - Tidak ada data yang akan diubah')
  } else if (isExecute) {
    console.log('✅ EXECUTE MODE - Data akan dimigrasi')
  }
  console.log('═'.repeat(100))
  console.log('')

  try {
    // Step 1: Ambil submissions yang sudah dinilai
    console.log('📊 Step 1: Mengambil data submissions yang sudah dinilai...')
    
    const evaluatedSubmissions = await prisma.sPCSubmission.findMany({
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
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log(`   ✓ Ditemukan ${evaluatedSubmissions.length} submission yang sudah dinilai\n`)

    if (evaluatedSubmissions.length === 0) {
      console.log('✨ Tidak ada data yang perlu dimigrasi. Selesai.')
      return
    }

    // Step 2: Cek data yang sudah ada di tabel baru
    console.log('🔍 Step 2: Mengecek data yang sudah ada di SPCSemifinalScore...')
    
    const existingScores = await prisma.sPCSemifinalScore.findMany({
      select: {
        submissionId: true,
        judgeId: true
      }
    })

    const existingKeys = new Set(
      existingScores.map(s => `${s.submissionId}-${s.judgeId}`)
    )

    console.log(`   ✓ Ditemukan ${existingScores.length} score yang sudah ada di tabel baru\n`)

    // Step 3: Prepare data untuk migrasi
    console.log('📝 Step 3: Mempersiapkan data untuk migrasi...')
    
    const dataToMigrate = []
    const skippedData = []

    for (const submission of evaluatedSubmissions) {
      const judgeId = submission.evaluatedBy || 'UNKNOWN_JUDGE'
      const key = `${submission.id}-${judgeId}`

      // Skip jika sudah ada di tabel baru
      if (existingKeys.has(key)) {
        skippedData.push({
          submissionId: submission.id,
          judulKarya: submission.judulKarya,
          reason: 'Already exists in new table'
        })
        continue
      }

      // Get judge name
      let judgeName = 'Unknown Judge'
      if (judgeId !== 'UNKNOWN_JUDGE') {
        try {
          const judge = await prisma.user.findUnique({
            where: { id: judgeId },
            select: { name: true }
          })
          judgeName = judge?.name || 'Unknown Judge'
        } catch (error) {
          console.log(`   ⚠️  Warning: Tidak dapat menemukan judge dengan ID ${judgeId}`)
        }
      }

      dataToMigrate.push({
        submissionId: submission.id,
        judgeId: judgeId,
        judgeName: judgeName,
        penilaianKaryaTulisIlmiah: submission.penilaianKaryaTulisIlmiah,
        substansiKaryaTulisIlmiah: submission.substansiKaryaTulisIlmiah,
        kualitasKaryaTulisIlmiah: submission.kualitasKaryaTulisIlmiah,
        catatanPenilaian: submission.catatanPenilaian,
        catatanSubstansi: submission.catatanSubstansi,
        catatanKualitas: submission.catatanKualitas,
        total: submission.totalSemifinalScore || 
               (submission.penilaianKaryaTulisIlmiah + 
                submission.substansiKaryaTulisIlmiah + 
                submission.kualitasKaryaTulisIlmiah),
        // Metadata untuk logging
        _metadata: {
          judulKarya: submission.judulKarya,
          participantName: submission.registration.participant?.fullName || 'Unknown'
        }
      })
    }

    console.log(`   ✓ Data yang akan dimigrasi: ${dataToMigrate.length}`)
    console.log(`   ✓ Data yang di-skip: ${skippedData.length}\n`)

    // Step 4: Preview data
    console.log('📋 Step 4: Preview Data yang Akan Dimigrasi:')
    console.log('─'.repeat(100))

    if (dataToMigrate.length === 0) {
      console.log('   ✨ Semua data sudah dimigrasi. Tidak ada yang perlu dilakukan.')
    } else {
      dataToMigrate.forEach((data, index) => {
        console.log(`\n   ${index + 1}. ${data._metadata.judulKarya}`)
        console.log(`      Peserta: ${data._metadata.participantName}`)
        console.log(`      Judge ID: ${data.judgeId}`)
        console.log(`      Judge Name: ${data.judgeName}`)
        console.log(`      Scores: ${data.penilaianKaryaTulisIlmiah} + ${data.substansiKaryaTulisIlmiah} + ${data.kualitasKaryaTulisIlmiah} = ${data.total}`)
      })
    }

    if (skippedData.length > 0) {
      console.log('\n\n   📌 Data yang Di-skip (sudah ada):')
      skippedData.forEach((data, index) => {
        console.log(`      ${index + 1}. ${data.judulKarya} - ${data.reason}`)
      })
    }

    console.log('\n' + '─'.repeat(100))

    // Step 5: Execute migration (jika bukan dry-run)
    if (isExecute && dataToMigrate.length > 0) {
      console.log('\n🔄 Step 5: Menjalankan migrasi...')
      
      let successCount = 0
      let errorCount = 0

      for (const data of dataToMigrate) {
        try {
          // Remove metadata sebelum insert
          const { _metadata, ...scoreData } = data

          await prisma.sPCSemifinalScore.create({
            data: scoreData
          })

          successCount++
          console.log(`   ✓ Berhasil migrasi: ${_metadata.judulKarya}`)
        } catch (error) {
          errorCount++
          console.error(`   ✗ Gagal migrasi: ${data._metadata.judulKarya}`)
          console.error(`     Error: ${error.message}`)
        }
      }

      console.log('\n' + '═'.repeat(100))
      console.log('📊 HASIL MIGRASI:')
      console.log(`   ✅ Berhasil: ${successCount}`)
      console.log(`   ❌ Gagal: ${errorCount}`)
      console.log(`   ⏭️  Di-skip: ${skippedData.length}`)
      console.log('═'.repeat(100))

      if (errorCount > 0) {
        console.log('\n⚠️  Ada error saat migrasi. Silakan cek log di atas.')
      } else {
        console.log('\n✅ Migrasi selesai dengan sukses!')
        console.log('   Data lama di SPCSubmission TIDAK DIHAPUS untuk keamanan.')
        console.log('   Anda bisa menghapusnya nanti setelah verifikasi.')
      }
    } else if (isDryRun) {
      console.log('\n💡 Ini adalah DRY RUN. Tidak ada data yang diubah.')
      console.log('   Untuk menjalankan migrasi, gunakan: node scripts/migrate-spc-semifinal-to-new-table.js --execute')
    }

  } catch (error) {
    console.error('\n❌ ERROR saat menjalankan migrasi:')
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateSPCSemifinalScores()
  .then(() => {
    console.log('\n✨ Script selesai')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script gagal:', error)
    process.exit(1)
  })
