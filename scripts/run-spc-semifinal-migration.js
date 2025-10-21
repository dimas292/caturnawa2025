/**
 * Script untuk menjalankan SQL migration manual
 * Membaca file SQL dan execute ke database
 * 
 * Usage:
 *   node scripts/run-spc-semifinal-migration.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function runMigration() {
  console.log('🚀 Running SPC Semifinal Score Table Migration')
  console.log('═'.repeat(80))
  console.log('')

  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, '..', 'add-spc-semifinal-score-table.sql')
    console.log('📄 Reading SQL file:', sqlFilePath)
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('SQL file not found: ' + sqlFilePath)
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    console.log('✓ SQL file loaded successfully\n')

    // Split SQL into individual statements and execute one by one
    console.log('⚙️  Executing migration...')
    console.log('─'.repeat(80))
    
    // Split by semicolon but keep multi-line statements together
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // Filter out empty statements and comments
        return stmt.length > 0 && 
               !stmt.startsWith('--') && 
               !stmt.match(/^\/\*/) &&
               !stmt.match(/^DO \$\$/)
      })
    
    console.log(`   Found ${statements.length} SQL statements to execute\n`)
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      try {
        console.log(`   [${i + 1}/${statements.length}] Executing...`)
        await prisma.$executeRawUnsafe(stmt)
        console.log(`   ✓ Success`)
      } catch (error) {
        // Ignore "already exists" errors (idempotent)
        if (error.message.includes('already exists') || 
            error.code === '42P07' || 
            error.code === '42710') {
          console.log(`   ⚠️  Already exists (skipped)`)
        } else {
          throw error
        }
      }
    }
    
    console.log('─'.repeat(80))
    console.log('✅ Migration executed successfully!\n')

    // Verify results
    console.log('🔍 Verifying migration results...')
    
    const submissionsWithScores = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "SPCSubmission"
      WHERE "penilaianKaryaTulisIlmiah" IS NOT NULL
    `
    
    const migratedScores = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "SPCSemifinalScore"
    `

    const submissionCount = Number(submissionsWithScores[0].count)
    const scoreCount = Number(migratedScores[0].count)

    console.log(`   📊 Submissions with scores: ${submissionCount}`)
    console.log(`   📊 Migrated scores: ${scoreCount}`)
    
    if (submissionCount === scoreCount) {
      console.log('   ✅ Data migration verified - counts match!\n')
    } else {
      console.log('   ⚠️  Warning: Counts do not match. Please investigate.\n')
    }

    // Show sample data
    console.log('📋 Sample migrated data:')
    const sampleData = await prisma.sPCSemifinalScore.findMany({
      take: 3,
      include: {
        submission: {
          select: {
            judulKarya: true
          }
        }
      }
    })

    if (sampleData.length > 0) {
      sampleData.forEach((score, idx) => {
        console.log(`   ${idx + 1}. ${score.submission.judulKarya}`)
        console.log(`      Judge: ${score.judgeName} (${score.judgeId})`)
        console.log(`      Total: ${score.total}`)
      })
    } else {
      console.log('   No data found (this is OK if no submissions have been scored yet)')
    }

    console.log('\n' + '═'.repeat(80))
    console.log('✨ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run: npx prisma generate')
    console.log('2. Restart your application')
    console.log('3. Test with multiple judges')
    console.log('═'.repeat(80))

  } catch (error) {
    console.error('\n❌ Migration failed!')
    console.error('Error:', error.message)
    console.error('\nFull error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed')
    process.exit(1)
  })
