// Test script to verify scoring with duplicate participantId
// This tests that all 8 scores are saved correctly even when teams have duplicate participantId

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testScoring() {
  console.log('🧪 TEST: Scoring with Duplicate ParticipantId')
  console.log('=' .repeat(60))
  console.log('')

  try {
    // Get a KDBI match to test
    const match = await prisma.debateMatch.findFirst({
      where: {
        round: {
          competition: {
            type: 'KDBI'
          }
        }
      },
      include: {
        round: {
          include: {
            competition: true
          }
        },
        team1: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team2: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team3: {
          include: {
            teamMembers: {
              include: {
                participant: true
              }
            }
          }
        },
        team4: {
          include: {
            teamMembers: {
              include: {
                participant: true
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
    })

    if (!match) {
      console.log('❌ No KDBI match found')
      return
    }

    console.log(`📋 Match: Round ${match.round.roundNumber} - Match ${match.matchNumber}`)
    console.log(`   Competition: ${match.round.competition.name}`)
    console.log('')

    // Check each team for duplicate participantId
    const teams = [
      { name: match.team1?.teamName, members: match.team1?.teamMembers || [] },
      { name: match.team2?.teamName, members: match.team2?.teamMembers || [] },
      { name: match.team3?.teamName, members: match.team3?.teamMembers || [] },
      { name: match.team4?.teamName, members: match.team4?.teamMembers || [] }
    ]

    console.log('👥 TEAM MEMBERS ANALYSIS:')
    console.log('-'.repeat(60))
    
    let totalMembers = 0
    let teamsWithDuplicates = 0
    
    teams.forEach((team, idx) => {
      if (!team.name) return
      
      console.log(`\n${idx + 1}. ${team.name}`)
      const participantIds = team.members.map(m => m.participantId)
      const uniqueIds = new Set(participantIds)
      
      team.members.forEach((member, mIdx) => {
        console.log(`   Speaker ${mIdx + 1}: ${member.fullName}`)
        console.log(`   - participantId: ${member.participantId}`)
        console.log(`   - Participant name: ${member.participant?.fullName}`)
      })
      
      if (uniqueIds.size < participantIds.length) {
        console.log(`   ⚠️  DUPLICATE participantId detected!`)
        teamsWithDuplicates++
      } else {
        console.log(`   ✅ Unique participantIds`)
      }
      
      totalMembers += team.members.length
    })

    console.log('')
    console.log('📊 SUMMARY:')
    console.log(`   Total members: ${totalMembers}`)
    console.log(`   Teams with duplicate participantId: ${teamsWithDuplicates}`)
    console.log('')

    // Check existing scores
    console.log('💯 EXISTING SCORES:')
    console.log('-'.repeat(60))
    
    if (match.scores.length === 0) {
      console.log('   No scores yet')
    } else {
      // Group scores by participantId
      const scoresByParticipant = {}
      match.scores.forEach(score => {
        if (!scoresByParticipant[score.participantId]) {
          scoresByParticipant[score.participantId] = []
        }
        scoresByParticipant[score.participantId].push(score)
      })

      Object.entries(scoresByParticipant).forEach(([participantId, scores]) => {
        console.log(`\n   Participant: ${scores[0].participant.fullName}`)
        console.log(`   ParticipantId: ${participantId}`)
        scores.forEach(score => {
          console.log(`   - Score: ${score.score}, bpPosition: ${score.bpPosition || 'null'}`)
        })
        
        if (scores.length > 1) {
          console.log(`   ✅ Multiple scores saved (${scores.length})`)
        }
      })

      console.log('')
      console.log(`   Total scores in DB: ${match.scores.length}`)
      console.log(`   Expected scores: ${totalMembers}`)
      
      if (match.scores.length === totalMembers) {
        console.log(`   ✅ All scores saved correctly!`)
      } else {
        console.log(`   ⚠️  Missing ${totalMembers - match.scores.length} scores`)
      }
    }

    console.log('')
    console.log('🔍 CONSTRAINT CHECK:')
    console.log('-'.repeat(60))
    
    // Check database constraints
    const constraints = await prisma.$queryRaw`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = '"DebateScore"'::regclass
        AND contype = 'u'
      ORDER BY conname
    `

    console.log('   Database constraints:')
    constraints.forEach(c => {
      console.log(`   - ${c.constraint_name}`)
      console.log(`     ${c.definition}`)
    })

    if (constraints.length === 1 && constraints[0].constraint_name.includes('bpPosition')) {
      console.log(`   ✅ Correct constraint (includes bpPosition)`)
    } else {
      console.log(`   ⚠️  Constraint may need update`)
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
testScoring()
