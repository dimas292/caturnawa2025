import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Adding session column to DebateRound table...\n')

  try {
    // Step 1: Add session column if it doesn't exist
    console.log('Step 1: Adding session column...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."DebateRound" 
      ADD COLUMN IF NOT EXISTS "session" INTEGER NOT NULL DEFAULT 1;
    `)
    console.log('✅ Session column added (or already exists)')

    // Step 2: Drop old unique constraint if it exists
    console.log('\nStep 2: Dropping old unique constraint...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."DebateRound" 
      DROP CONSTRAINT IF EXISTS "DebateRound_competitionId_stage_roundNumber_key";
    `)
    console.log('✅ Old constraint dropped (if it existed)')

    // Step 3: Create new unique constraint with session
    console.log('\nStep 3: Creating new unique constraint with session...')
    await prisma.$executeRawUnsafe(`
      DROP INDEX IF EXISTS "DebateRound_competitionId_stage_roundNumber_session_key";
    `)
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "DebateRound_competitionId_stage_roundNumber_session_key" 
      ON "public"."DebateRound"("competitionId", "stage", "roundNumber", "session");
    `)
    console.log('✅ New unique constraint created')

    // Step 4: Verify the column exists
    console.log('\nStep 4: Verifying session column...')
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'DebateRound'
        AND column_name = 'session';
    `) as any[]

    if (result.length > 0) {
      console.log('✅ Session column verified:')
      console.log(`   Type: ${result[0].data_type}`)
      console.log(`   Default: ${result[0].column_default}`)
    } else {
      console.log('❌ Session column not found!')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ MIGRATION COMPLETE!')
    console.log('='.repeat(60))
    console.log('\nNext steps:')
    console.log('1. Run: npx prisma generate')
    console.log('2. Run: pm2 restart caturnawa-tes')
    console.log('3. Test the endpoint again')

  } catch (error) {
    console.error('\n❌ Error during migration:')
    console.error(error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

