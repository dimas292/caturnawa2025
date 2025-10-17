// Test script to verify comprehension results API
// Checks if scores are fetched correctly and display shows proper names

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testComprehensionResults() {
  console.log('🧪 TEST: Comprehension Results API')
  console.log('=' .repeat(60))
  console.log('')

  try {
    // Get KDBI competition
    const competition = await prisma.competition.findFirst({
      where: { type: 'KDBI' }
    })

    if (!competition) {
      console.log('❌ KDBI competition not found')
      return
    }

    // Get a round with matches
    const round = await prisma.debateRound.findFirst({
      where: {
        competitionId: competition.id
      },
      include: {
        matches: {
          include: {
            team1: {
              include: {
                teamMembers: {
                  include: {
                    participant: true
                  },
                  orderBy: {
                    position: 'asc'
                  }
                }
              }
            },
            team2: {
              include: {
                teamMembers: {
                  include: {
                    participant: true
                  },
                  orderBy: {
                    position: 'asc'
                  }
                }
              }
            },
            team3: {
              include: {
                teamMembers: {
                  include: {
                    participant: true
                  },
                  orderBy: {
                    position: 'asc'
                  }
                }
              }
            },
            team4: {
              include: {
                teamMembers: {
                  include: {
                    participant: true
                  },
                  orderBy: {
                    position: 'asc'
                  }
                }
              }
            },
            scores: {
              include: {
                participant: true
              }
            }
          }
        }
      }
    })

    if (!round || round.matches.length === 0) {
      console.log('❌ No matches found')
      return
    }

    console.log(`📋 Round: ${round.roundName}`)
    console.log(`   Stage: ${round.stage}`)
    console.log(`   Matches: ${round.matches.length}`)
    console.log('')

    // Analyze each match
    round.matches.forEach((match, matchIdx) => {
      console.log(`\n🏆 MATCH ${match.matchNumber}`)
      console.log('-'.repeat(60))

      const teams = [
        { name: match.team1?.teamName, registration: match.team1, position: 'OG' },
        { name: match.team2?.teamName, registration: match.team2, position: 'OO' },
        { name: match.team3?.teamName, registration: match.team3, position: 'CG' },
        { name: match.team4?.teamName, registration: match.team4, position: 'CO' }
      ]

      teams.forEach((team, teamIdx) => {
        if (!team.name) return

        console.log(`\n${team.position}: ${team.name}`)
        
        const members = team.registration.teamMembers
        const teamScores = match.scores.filter(s => 
          members.some(m => m.participantId === s.participantId)
        )

        // Check for duplicate participantId
        const participantIds = members.map(m => m.participantId)
        const hasDuplicate = participantIds.length !== new Set(participantIds).size

        if (hasDuplicate) {
          console.log('   ⚠️  Team has DUPLICATE participantId')
        }

        // Display members and their scores
        members.forEach((member, idx) => {
          console.log(`\n   Speaker ${idx + 1}:`)
          console.log(`   - TeamMember.fullName: ${member.fullName}`)
          console.log(`   - Participant.fullName: ${member.participant?.fullName}`)
          console.log(`   - participantId: ${member.participantId}`)
          
          // Find scores for this member
          const memberScores = teamScores.filter(s => s.participantId === member.participantId)
          
          if (memberScores.length === 0) {
            console.log(`   - Score: NOT YET SCORED`)
          } else if (memberScores.length === 1) {
            console.log(`   - Score: ${memberScores[0].score}`)
            console.log(`   - bpPosition: ${memberScores[0].bpPosition || 'null'}`)
          } else {
            console.log(`   - Multiple scores found: ${memberScores.length}`)
            memberScores.forEach((s, sIdx) => {
              console.log(`     [${sIdx + 1}] Score: ${s.score}, bpPosition: ${s.bpPosition || 'null'}`)
            })
          }

          // Check if name matches
          if (member.fullName !== member.participant?.fullName) {
            console.log(`   ⚠️  Name mismatch detected!`)
          } else {
            console.log(`   ✅ Names match`)
          }
        })

        // Team total
        const teamTotal = teamScores.reduce((sum, s) => sum + s.score, 0)
        const teamAvg = teamScores.length > 0 ? (teamTotal / teamScores.length).toFixed(2) : 0
        
        console.log(`\n   Team Stats:`)
        console.log(`   - Scores saved: ${teamScores.length}/${members.length}`)
        console.log(`   - Total: ${teamTotal}`)
        console.log(`   - Average: ${teamAvg}`)
      })

      console.log('')
    })

    console.log('')
    console.log('📊 OVERALL SUMMARY:')
    console.log('-'.repeat(60))

    let totalMembers = 0
    let totalScores = 0
    let teamsWithDuplicates = 0
    let teamsWithNameMismatch = 0

    round.matches.forEach(match => {
      [match.team1, match.team2, match.team3, match.team4].forEach(team => {
        if (!team) return
        
        const members = team.teamMembers
        totalMembers += members.length
        
        const participantIds = members.map(m => m.participantId)
        if (participantIds.length !== new Set(participantIds).size) {
          teamsWithDuplicates++
        }

        members.forEach(member => {
          if (member.fullName !== member.participant?.fullName) {
            teamsWithNameMismatch++
          }
        })
      })

      totalScores += match.scores.length
    })

    console.log(`Total members across all matches: ${totalMembers}`)
    console.log(`Total scores in database: ${totalScores}`)
    console.log(`Teams with duplicate participantId: ${teamsWithDuplicates}`)
    console.log(`Members with name mismatch: ${teamsWithNameMismatch}`)
    console.log('')

    if (totalScores === totalMembers) {
      console.log('✅ All members have scores!')
    } else if (totalScores < totalMembers) {
      console.log(`⚠️  Missing ${totalMembers - totalScores} scores`)
    } else {
      console.log(`⚠️  Extra ${totalScores - totalMembers} scores (possible duplicates)`)
    }

    if (teamsWithNameMismatch === 0) {
      console.log('✅ All names match between TeamMember and Participant')
    } else {
      console.log(`⚠️  ${teamsWithNameMismatch} members have name mismatches`)
    }

    console.log('')
    console.log('=' .repeat(60))
    console.log('✅ Test completed')
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run test
testComprehensionResults()
