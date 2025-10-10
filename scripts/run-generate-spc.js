const { execSync } = require('child_process');

console.log('🎤 UNAS FEST 2025 - SPC Data Generator');
console.log('=====================================\n');

async function runScript(scriptName, description) {
  console.log(`🚀 ${description}...`);
  try {
    execSync(`node ${scriptName}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log(`✅ ${description} completed!\n`);
  } catch (error) {
    console.error(`❌ Error in ${description}:`);
    console.error(error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log('This script will create sample SPC (Speech Competition) data:');
    console.log('- 15 SPC participants with various submission statuses');
    console.log('- Sample final scores from 3 judges for qualified participants');
    console.log('- Realistic speech topics and evaluation data\n');

    await runScript('create-spc-participants.js', 'Creating SPC participants and submissions');
    
    // Wait a moment before creating scores
    console.log('⏳ Waiting 2 seconds before creating final scores...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await runScript('create-spc-final-scores.js', 'Creating SPC final scores from judges');
    
    console.log('🎉 SPC data generation completed successfully!');
    console.log('\n📋 What was created:');
    console.log('   👥 15 SPC participants with user accounts');
    console.log('   📝 15 SPC submissions with various statuses');
    console.log('   ⭐ Sample final scores from judges');
    console.log('   🏆 Complete data for testing SPC system');
    
    console.log('\n🔍 You can now:');
    console.log('   • Login as judge to see real SPC data');
    console.log('   • Test semifinal evaluation system');
    console.log('   • Test final scoring system');
    console.log('   • View complete SPC workflow');
    
  } catch (error) {
    console.error('❌ Failed to generate SPC data:', error.message);
    process.exit(1);
  }
}

main();