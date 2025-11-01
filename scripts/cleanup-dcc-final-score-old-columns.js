// scripts/cleanup-dcc-final-score-old-columns.js
// Script to remove old/unused columns from DCCFinalScore table

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupOldColumns() {
  console.log('🧹 CLEANING UP OLD DCC FINAL SCORE COLUMNS')
  console.log('=' .repeat(60))
  console.log('')
  
  try {
    console.log('⚠️  This will remove old semifinal criteria columns:')
    console.log('   - konsepKreatif')
    console.log('   - eksekusiDesain')
    console.log('   - komunikasiVisual')
    console.log('')
    
    // Drop old columns if they exist
    console.log('🔨 Dropping old columns...')
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        -- Drop konsepKreatif
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'konsepKreatif'
        ) THEN
          ALTER TABLE "DCCFinalScore" DROP COLUMN "konsepKreatif";
          RAISE NOTICE '✅ Dropped column: konsepKreatif';
        ELSE
          RAISE NOTICE '⏭️  Column does not exist: konsepKreatif';
        END IF;

        -- Drop eksekusiDesain
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'eksekusiDesain'
        ) THEN
          ALTER TABLE "DCCFinalScore" DROP COLUMN "eksekusiDesain";
          RAISE NOTICE '✅ Dropped column: eksekusiDesain';
        ELSE
          RAISE NOTICE '⏭️  Column does not exist: eksekusiDesain';
        END IF;

        -- Drop komunikasiVisual
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'DCCFinalScore' 
          AND column_name = 'komunikasiVisual'
        ) THEN
          ALTER TABLE "DCCFinalScore" DROP COLUMN "komunikasiVisual";
          RAISE NOTICE '✅ Dropped column: komunikasiVisual';
        ELSE
          RAISE NOTICE '⏭️  Column does not exist: komunikasiVisual';
        END IF;
      END $$;
    `
    
    console.log('')
    console.log('📊 Verifying table structure...')
    
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'DCCFinalScore'
      ORDER BY ordinal_position;
    `
    
    console.log('')
    console.log('Current DCCFinalScore columns:')
    console.table(columns)
    
    console.log('')
    console.log('=' .repeat(60))
    console.log('✅ Cleanup completed successfully!')
    console.log('')
    console.log('⚠️  IMPORTANT: You must now:')
    console.log('   1. Run: npx prisma generate')
    console.log('   2. Restart your application')
    console.log('   3. Deploy to production')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupOldColumns()
  .then(() => {
    console.log('')
    console.log('🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
