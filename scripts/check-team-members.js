// scripts/check-team-members.js
// Check how many participants each team has
// Usage: 
//   node scripts/check-team-members.js
//   node scripts/check-team-members.js --db="postgresql://user:pass@host:5432/dbname"

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

async function checkTeamMembers() {
  console.log('🔍 CHECKING TEAM MEMBERS DATA')
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
      },
      orderBy: {
        teamName: 'asc'
      }
    })
    
    console.log(`📊 Total Teams: ${registrations.length}`)
    console.log('')
    
    // Group by member count
    const byMemberCount = {}
    
    registrations.forEach(reg => {
      const memberCount = reg.teamMembers.length
      if (!byMemberCount[memberCount]) {
        byMemberCount[memberCount] = []
      }
      byMemberCount[memberCount].push(reg)
    })
    
    // Show summary
    console.log('📈 Summary by Member Count:')
    Object.keys(byMemberCount).sort().forEach(count => {
      const teams = byMemberCount[count]
      console.log(`  ${count} members: ${teams.length} teams`)
    })
    console.log('')
    
    // Show teams with only 1 member (PROBLEM!)
    if (byMemberCount[1]) {
      console.log('⚠️  TEAMS WITH ONLY 1 MEMBER (SHOULD HAVE 2):')
      console.log('-'.repeat(60))
      byMemberCount[1].forEach(reg => {
        const member = reg.teamMembers[0]
        console.log(`  ${reg.competition.shortName} - ${reg.teamName}`)
        console.log(`    Member: ${member.participant?.fullName || 'Unknown'}`)
        console.log(`    Position: ${member.position}`)
        console.log(`    Registration ID: ${reg.id}`)
        console.log('')
      })
    }
    
    // Show teams with 2 members (CORRECT!)
    if (byMemberCount[2]) {
      console.log('✅ TEAMS WITH 2 MEMBERS (CORRECT):')
      console.log('-'.repeat(60))
      byMemberCount[2].slice(0, 5).forEach(reg => {
        console.log(`  ${reg.competition.shortName} - ${reg.teamName}`)
        reg.teamMembers.forEach((member, idx) => {
          console.log(`    Speaker ${idx + 1}: ${member.participant?.fullName || 'Unknown'} (pos: ${member.position})`)
        })
        console.log('')
      })
      if (byMemberCount[2].length > 5) {
        console.log(`  ... and ${byMemberCount[2].length - 5} more teams`)
        console.log('')
      }
    }
    
    // Show teams with 0 members (EMPTY!)
    if (byMemberCount[0]) {
      console.log('❌ TEAMS WITH 0 MEMBERS (EMPTY):')
      console.log('-'.repeat(60))
      byMemberCount[0].forEach(reg => {
        console.log(`  ${reg.competition.shortName} - ${reg.teamName} (ID: ${reg.id})`)
      })
      console.log('')
    }
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS:')
    console.log('-'.repeat(60))
    if (byMemberCount[1]) {
      console.log(`⚠️  ${byMemberCount[1].length} teams need a second member added`)
      console.log('   Run: node scripts/fix-team-members.js --add-missing')
    }
    if (byMemberCount[0]) {
      console.log(`❌ ${byMemberCount[0].length} teams are completely empty`)
      console.log('   These teams should be removed or populated')
    }
    if (byMemberCount[2]) {
      console.log(`✅ ${byMemberCount[2].length} teams are correctly configured`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

checkTeamMembers()
  .catch((e) => {
    console.error('💥 Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('')
    console.log('🔌 Database disconnected')
  })
