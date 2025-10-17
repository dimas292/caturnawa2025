// scripts/fix-duplicate-team-members.js
// Fix teams that have the same participant listed twice with different positions
// This will keep only position 1 and remove position 2 duplicates

const { PrismaClient } = require('@prisma/client')

// Check if custom database URL is provided
const dbUrlArg = process.argv.find(arg => arg.startsWith('--db='))
const databaseUrl = dbUrlArg ? dbUrlArg.split('=')[1] : process.env.DATABASE_URL

if (dbUrlArg) {
  console.log('🔗 Using custom database connection')
  console.log(`   Host: ${databaseUrl.split('@')[1]?.split('/')[0] || 'hidden'}`)
  console.log('')
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

async function fixDuplicateTeamMembers() {
  console.log('🔧 FIX DUPLICATE TEAM MEMBERS')
  console.log('=' .repeat(60))
  console.log('')
  
  try {
    // Get all registrations for KDBI/EDC
    const registrations = await prisma.registration.findMany({
      where: {
        competition: {
          type: {
            in: ['KDBI', 'EDC']
          }
        }
      },
      include: {
        competition: {
          select: {
            type: true,
            shortName: true
          }
        },
        teamMembers: {
          include: {
            participant: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    })
    
    console.log(`📊 Total Teams: ${registrations.length}`)
    console.log('')
    
    // Find teams with duplicate participants
    const teamsWithDuplicates = []
    
    registrations.forEach(reg => {
      if (reg.teamMembers.length === 2) {
        const participant1 = reg.teamMembers[0].participantId
        const participant2 = reg.teamMembers[1].participantId
        
        if (participant1 === participant2) {
          teamsWithDuplicates.push({
            registration: reg,
            duplicateParticipantId: participant1,
            memberToDelete: reg.teamMembers[1] // Delete position 2
          })
        }
      }
    })
    
    console.log(`⚠️  Found ${teamsWithDuplicates.length} teams with duplicate participants`)
    console.log('')
    
    if (teamsWithDuplicates.length === 0) {
      console.log('✅ No duplicates found - database is clean!')
      return
    }
    
    // Show preview
    console.log('📋 PREVIEW - Teams to be fixed:')
    console.log('-'.repeat(60))
    teamsWithDuplicates.slice(0, 10).forEach(item => {
      const reg = item.registration
      console.log(`  ${reg.competition.shortName} - ${reg.teamName}`)
      console.log(`    Duplicate: ${item.memberToDelete.participant?.fullName}`)
      console.log(`    Will delete: TeamMember ID ${item.memberToDelete.id} (position ${item.memberToDelete.position})`)
      console.log('')
    })
    
    if (teamsWithDuplicates.length > 10) {
      console.log(`  ... and ${teamsWithDuplicates.length - 10} more teams`)
      console.log('')
    }
    
    // Check confirmation
    const isConfirmed = process.argv.includes('--confirm')
    
    if (!isConfirmed) {
      console.log('⚠️  DRY RUN MODE')
      console.log('')
      console.log('This will:')
      console.log(`  ❌ Delete ${teamsWithDuplicates.length} duplicate TeamMember records (position 2)`)
      console.log(`  ✅ Keep ${teamsWithDuplicates.length} original TeamMember records (position 1)`)
      console.log('')
      console.log('⚠️  WARNING: After this fix, teams will only have 1 member!')
      console.log('   You need to add the SECOND SPEAKER manually or via registration.')
      console.log('')
      console.log('To actually delete, run with: --confirm')
      console.log('Example: node scripts/fix-duplicate-team-members.js --confirm')
      return
    }
    
    console.log('⚠️  CONFIRMED - Starting deletion...')
    console.log('')
    
    // Delete duplicates
    let deletedCount = 0
    
    for (const item of teamsWithDuplicates) {
      try {
        await prisma.teamMember.delete({
          where: {
            id: item.memberToDelete.id
          }
        })
        deletedCount++
        
        if (deletedCount % 10 === 0) {
          console.log(`  Progress: ${deletedCount}/${teamsWithDuplicates.length} deleted...`)
        }
      } catch (error) {
        console.error(`  ❌ Failed to delete TeamMember ${item.memberToDelete.id}:`, error.message)
      }
    }
    
    console.log('')
    console.log(`✅ Deleted ${deletedCount} duplicate TeamMember records`)
    console.log('')
    console.log('📝 NEXT STEPS:')
    console.log('-'.repeat(60))
    console.log('1. Each team now has only 1 member (Speaker 1)')
    console.log('2. You need to add Speaker 2 for each team')
    console.log('3. Options:')
    console.log('   a) Ask teams to re-register their 2nd speaker')
    console.log('   b) Manually add via admin dashboard')
    console.log('   c) Import from spreadsheet if you have the data')
    console.log('')
    console.log('⚠️  Until Speaker 2 is added, scoring will fail!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

fixDuplicateTeamMembers()
  .catch((e) => {
    console.error('💥 Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('')
    console.log('🔌 Database disconnected')
  })
