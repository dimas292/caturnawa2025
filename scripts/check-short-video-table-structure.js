const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTableStructure() {
  try {
    console.log('🔍 Checking DCCShortVideoScore table structure...\n')

    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'DCCShortVideoScore'
      ORDER BY ordinal_position;
    `

    console.log('Columns in DCCShortVideoScore table:')
    console.table(result)

    // Try to get actual data
    console.log('\n📊 Checking for existing Short Video scores...')
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) FROM "DCCShortVideoScore";
    `
    console.log('Total records:', count[0].count)

    if (parseInt(count[0].count) > 0) {
      console.log('\n📝 Sample data:')
      const sample = await prisma.$queryRaw`
        SELECT * FROM "DCCShortVideoScore" LIMIT 1;
      `
      console.log(sample[0])
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTableStructure()
