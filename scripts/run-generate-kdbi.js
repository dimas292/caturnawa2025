// scripts/run-generate-kdbi.js
// Simple runner script for generating KDBI participants

const { generateKDBIParticipants } = require('./generate-kdbi-participants')

async function main() {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 5
  
  console.log('🎯 KDBI Participant Generator')
  console.log('============================')
  console.log(`Generating ${count} KDBI teams with mock data...\n`)
  
  try {
    await generateKDBIParticipants(count)
    console.log('\n✨ Generation completed successfully!')
    console.log('\n📋 What was created:')
    console.log('• User accounts for team leaders and members')
    console.log('• Participant profiles with complete data')
    console.log('• Team registrations with VERIFIED status')
    console.log('• Mock file uploads for all required documents')
    console.log('• Team standings for debate tournament')
    console.log('\n🔐 Login Info:')
    console.log('• Email: [firstname].[lastname]@email.com')
    console.log('• Password: password123')
    console.log('\n🎮 Ready for testing!')
  } catch (error) {
    console.error('\n❌ Generation failed:', error.message)
    process.exit(1)
  }
}

main()
