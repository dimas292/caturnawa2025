// scripts/migrate-dcc-final-score-columns.js
// Script to add missing DCC Final Score columns to production database

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrateDCCFinalScoreColumns() {
  console.log('🔄 MIGRATING DCC FINAL SCORE COLUMNS')
  console.log('=' .repeat(60))
  console.log('')
  
  try {
    console.log('📋 Checking current DCCFinalScore table structure...')
    
    // Check if table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'DCCFinalScore'
      );
    `
    
    console.log('Table exists:', tableCheck)
    
    console.log('')
    console.log('🔨 Adding missing columns...')
    
    // Add strukturPresentasi
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'strukturPresentasi'
        ) THEN
          ALTER TABLE "DCCFinalScore" ADD COLUMN "strukturPresentasi" INTEGER NOT NULL DEFAULT 0;
          RAISE NOTICE '✅ Added column: strukturPresentasi';
        ELSE
          RAISE NOTICE '⏭️  Column already exists: strukturPresentasi';
        END IF;
      END $$;
    `
    
    // Add teknikPenyampaian
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'teknikPenyampaian'
        ) THEN
          ALTER TABLE "DCCFinalScore" ADD COLUMN "teknikPenyampaian" INTEGER NOT NULL DEFAULT 0;
          RAISE NOTICE '✅ Added column: teknikPenyampaian';
        ELSE
          RAISE NOTICE '⏭️  Column already exists: teknikPenyampaian';
        END IF;
      END $$;
    `
    
    // Add penguasaanMateri
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'penguasaanMateri'
        ) THEN
          ALTER TABLE "DCCFinalScore" ADD COLUMN "penguasaanMateri" INTEGER NOT NULL DEFAULT 0;
          RAISE NOTICE '✅ Added column: penguasaanMateri';
        ELSE
          RAISE NOTICE '⏭️  Column already exists: penguasaanMateri';
        END IF;
      END $$;
    `
    
    // Add kolaborasiTeam
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'kolaborasiTeam'
        ) THEN
          ALTER TABLE "DCCFinalScore" ADD COLUMN "kolaborasiTeam" INTEGER NOT NULL DEFAULT 0;
          RAISE NOTICE '✅ Added column: kolaborasiTeam';
        ELSE
          RAISE NOTICE '⏭️  Column already exists: kolaborasiTeam';
        END IF;
      END $$;
    `
    
    // Add total
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'total'
        ) THEN
          ALTER TABLE "DCCFinalScore" ADD COLUMN "total" INTEGER NOT NULL DEFAULT 0;
          RAISE NOTICE '✅ Added column: total';
        ELSE
          RAISE NOTICE '⏭️  Column already exists: total';
        END IF;
      END $$;
    `
    
    // Add feedback
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'feedback'
        ) THEN
          ALTER TABLE "DCCFinalScore" ADD COLUMN "feedback" TEXT;
          RAISE NOTICE '✅ Added column: feedback';
        ELSE
          RAISE NOTICE '⏭️  Column already exists: feedback';
        END IF;
      END $$;
    `
    
    // Add judgeName
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'judgeName'
        ) THEN
          ALTER TABLE "DCCFinalScore" ADD COLUMN "judgeName" TEXT NOT NULL DEFAULT 'Unknown';
          RAISE NOTICE '✅ Added column: judgeName';
        ELSE
          RAISE NOTICE '⏭️  Column already exists: judgeName';
        END IF;
      END $$;
    `
    
    console.log('')
    console.log('🔨 Removing default constraints...')
    
    // Remove defaults (wrap in DO block to avoid errors if already removed)
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        ALTER TABLE "DCCFinalScore" ALTER COLUMN "strukturPresentasi" DROP DEFAULT;
        ALTER TABLE "DCCFinalScore" ALTER COLUMN "teknikPenyampaian" DROP DEFAULT;
        ALTER TABLE "DCCFinalScore" ALTER COLUMN "penguasaanMateri" DROP DEFAULT;
        ALTER TABLE "DCCFinalScore" ALTER COLUMN "kolaborasiTeam" DROP DEFAULT;
        ALTER TABLE "DCCFinalScore" ALTER COLUMN "total" DROP DEFAULT;
        ALTER TABLE "DCCFinalScore" ALTER COLUMN "judgeName" DROP DEFAULT;
        RAISE NOTICE '✅ Removed default constraints';
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE '⚠️  Some defaults may have already been removed';
      END $$;
    `
    
    console.log('')
    console.log('📊 Verifying table structure...')
    
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'DCCFinalScore'
      ORDER BY ordinal_position;
    `
    
    console.log('')
    console.log('Current DCCFinalScore columns:')
    console.table(columns)
    
    console.log('')
    console.log('=' .repeat(60))
    console.log('✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateDCCFinalScoreColumns()
  .then(() => {
    console.log('')
    console.log('🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
