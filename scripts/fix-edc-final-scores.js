// scripts/fix-edc-final-scores.js
// Fix duplicate scores in EDC final rounds
// Usage: 
//   node scripts/fix-edc-final-scores.js
//   node scripts/fix-edc-final-scores.js --confirm
//   node scripts/fix-edc-final-scores.js --db="postgresql://user:pass@host:5432/dbname"

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

async function checkAndFixFinalScores() {
    console.log('🔍 CHECKING EDC FINAL SCORES')
    console.log('='.repeat(60))
    console.log('')

    try {
        // Get EDC competition ID
        const competition = await prisma.competition.findUnique({
            where: {
                type: 'EDC'
            }
        })

        if (!competition) {
            console.log('❌ EDC competition not found')
            return
        }

        // Get all completed final matches
        const matches = await prisma.debateMatch.findMany({
            where: {
                round: {
                    competitionId: competition.id,
                    stage: 'FINAL'
                },
                completedAt: { not: null }
            },
            include: {
                round: {
                    select: {
                        roundName: true,
                        stage: true
                    }
                },
                scores: {
                    include: {
                        participant: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                team1: {
                    include: {
                        teamMembers: {
                            orderBy: {
                                position: 'asc'
                            }
                        }
                    }
                },
                team2: {
                    include: {
                        teamMembers: {
                            orderBy: {
                                position: 'asc'
                            }
                        }
                    }
                },
                team3: {
                    include: {
                        teamMembers: {
                            orderBy: {
                                position: 'asc'
                            }
                        }
                    }
                },
                team4: {
                    include: {
                        teamMembers: {
                            orderBy: {
                                position: 'asc'
                            }
                        }
                    }
                }
            }
        })

        console.log(`📊 Found ${matches.length} completed final matches`)
        console.log('')

        const issuesFound = []

        // Check each match for potential score issues
        for (const match of matches) {
            // Get all teams in this match
            const teams = [
                { id: match.team1Id, data: match.team1 },
                { id: match.team2Id, data: match.team2 },
                { id: match.team3Id, data: match.team3 },
                { id: match.team4Id, data: match.team4 }
            ].filter(t => t.id && t.data)

            for (const team of teams) {
                if (team.data.teamMembers.length !== 2) {
                    issuesFound.push({
                        type: 'wrong_member_count',
                        matchId: match.id,
                        teamId: team.id,
                        teamName: team.data.teamName,
                        details: `Team has ${team.data.teamMembers.length} members (should be 2)`
                    })
                    continue
                }

                // Check if same participant registered twice
                const [member1, member2] = team.data.teamMembers
                if (member1.participantId === member2.participantId) {
                    issuesFound.push({
                        type: 'duplicate_participant',
                        matchId: match.id,
                        teamId: team.id,
                        teamName: team.data.teamName,
                        details: `Same participant (${member1.fullName}) registered twice`,
                        memberToFix: member2.id
                    })
                }

                // Check scores for this team
                const teamScores = match.scores.filter(s =>
                    team.data.teamMembers.some(m => m.participantId === s.participantId)
                )

                // Check for missing scores
                if (teamScores.length === 0) {
                    issuesFound.push({
                        type: 'no_scores',
                        matchId: match.id,
                        teamId: team.id,
                        teamName: team.data.teamName,
                        details: 'No scores found for this team'
                    })
                    continue
                }

                // Group scores by participant
                const scoresByParticipant = {}
                teamScores.forEach(score => {
                    if (!scoresByParticipant[score.participantId]) {
                        scoresByParticipant[score.participantId] = []
                    }
                    scoresByParticipant[score.participantId].push(score)
                })

                // Check for duplicate scores per judge
                for (const [participantId, scores] of Object.entries(scoresByParticipant)) {
                    const scoresByJudge = scores.reduce((acc, score) => {
                        if (!acc[score.judgeId]) {
                            acc[score.judgeId] = []
                        }
                        acc[score.judgeId].push(score)
                        return acc
                    }, {})

                    for (const [judgeId, judgeScores] of Object.entries(scoresByJudge)) {
                        if (judgeScores.length > 1) {
                            issuesFound.push({
                                type: 'duplicate_scores',
                                matchId: match.id,
                                teamId: team.id,
                                teamName: team.data.teamName,
                                participantId,
                                judgeId,
                                details: `Multiple scores (${judgeScores.length}) from same judge`,
                                scoresToFix: judgeScores.slice(1).map(s => s.id) // Keep first score, flag others for removal
                            })
                        }
                    }
                }
            }
        }

        // Show summary of issues
        console.log('📋 ISSUES FOUND:')
        console.log('-'.repeat(60))

        const issueTypes = {}
        issuesFound.forEach(issue => {
            if (!issueTypes[issue.type]) {
                issueTypes[issue.type] = []
            }
            issueTypes[issue.type].push(issue)
        })

        for (const [type, issues] of Object.entries(issueTypes)) {
            console.log(`\n${type.toUpperCase()}: ${issues.length} issues`)
            issues.slice(0, 5).forEach(issue => {
                console.log(`  Team: ${issue.teamName}`)
                console.log(`  Details: ${issue.details}`)
                console.log('')
            })
            if (issues.length > 5) {
                console.log(`  ... and ${issues.length - 5} more issues`)
            }
        }

        if (issuesFound.length === 0) {
            console.log('✅ No issues found - all scores look good!')
            return
        }

        // Check if we should fix
        const isConfirmed = process.argv.includes('--confirm')

        if (!isConfirmed) {
            console.log('\n⚠️  DRY RUN MODE')
            console.log('\nTo fix these issues, run with: --confirm')
            console.log('This will:')

            if (issueTypes.duplicate_scores) {
                const count = issueTypes.duplicate_scores.reduce((sum, issue) =>
                    sum + issue.scoresToFix.length, 0
                )
                console.log(`  ❌ Remove ${count} duplicate score entries`)
            }

            if (issueTypes.duplicate_participant) {
                console.log(`  ❌ Remove ${issueTypes.duplicate_participant.length} duplicate team member entries`)
            }

            console.log('\nExample: node scripts/fix-edc-final-scores.js --confirm')
            return
        }

        console.log('\n⚠️  CONFIRMED - Starting fixes...')
        console.log('')

        // Fix duplicate scores
        if (issueTypes.duplicate_scores) {
            console.log('1️⃣  Fixing duplicate scores...')
            for (const issue of issueTypes.duplicate_scores) {
                try {
                    await prisma.debateScore.deleteMany({
                        where: {
                            id: {
                                in: issue.scoresToFix
                            }
                        }
                    })
                    console.log(`  ✓ Removed ${issue.scoresToFix.length} duplicate scores for ${issue.teamName}`)
                } catch (error) {
                    console.error(`  ❌ Failed to fix scores for ${issue.teamName}:`, error.message)
                }
            }
        }

        // Fix duplicate team members
        if (issueTypes.duplicate_participant) {
            console.log('\n2️⃣  Fixing duplicate team members...')
            for (const issue of issueTypes.duplicate_participant) {
                try {
                    await prisma.teamMember.delete({
                        where: {
                            id: issue.memberToFix
                        }
                    })
                    console.log(`  ✓ Removed duplicate member for ${issue.teamName}`)
                } catch (error) {
                    console.error(`  ❌ Failed to fix member for ${issue.teamName}:`, error.message)
                }
            }
        }

        console.log('\n✅ Fix completed!')
        console.log('\n📝 NEXT STEPS:')
        console.log('-'.repeat(60))
        console.log('1. For teams with removed duplicate members:')
        console.log('   - Add correct second speaker via registration/admin')
        console.log('2. For teams with missing scores:')
        console.log('   - Check if judges need to submit scores')
        console.log('   - Or re-enter scores if they were lost')
        console.log('\n⚠️  Run this script again to verify all issues are fixed')

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    }
}

checkAndFixFinalScores()
    .catch((e) => {
        console.error('💥 Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        console.log('\n🔌 Database disconnected')
    })