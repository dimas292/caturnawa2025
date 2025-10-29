const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteEDCMatches() {
    try {
        console.log('🗑️  DELETE EDC MATCHES & SCORES')
        console.log('='.repeat(50))
        console.log('')

        // Get all EDC rounds first
        const edcRounds = await prisma.debateRound.findMany({
            where: {
                competition: {
                    code: 'EDC'
                }
            },
            include: {
                matches: {
                    include: {
                        scores: true
                    }
                }
            }
        })

        if (!edcRounds || edcRounds.length === 0) {
            console.log('❌ No EDC rounds found')
            return
        }

        // Get counts before deletion
        const matchCount = edcRounds.reduce((acc, r) => acc + r.matches.length, 0)
        const scoreCount = edcRounds.reduce((acc, r) =>
            acc + r.matches.reduce((mAcc, m) => mAcc + m.scores.length, 0), 0)

        console.log('📊 Current EDC Data:')
        console.log(`  - Debate Matches: ${matchCount}`)
        console.log(`  - Debate Scores: ${scoreCount}`)
        console.log('')

        if (matchCount === 0 && scoreCount === 0) {
            console.log('✅ Already clean - no data to delete')
            return
        }

        // Check if --confirm flag is provided
        if (!process.argv.includes('--confirm')) {
            console.log('⚠️  DRY RUN MODE')
            console.log('This script will delete:')
            console.log(`  ❌ ${scoreCount} debate scores`)
            console.log(`  ❌ ${matchCount} debate matches`)
            console.log('')
            console.log('To actually delete, run with: --confirm')
            return
        }

        console.log('⚠️  CONFIRMED - Starting deletion...')
        console.log('')

        // Delete scores first
        console.log('1️⃣  Deleting debate scores...')
        const deletedScores = await prisma.debateScore.deleteMany({
            where: {
                match: {
                    round: {
                        competition: {
                            code: 'EDC'
                        }
                    }
                }
            }
        })
        console.log(`   ✅ Deleted ${deletedScores.count} scores`)

        // Delete matches
        console.log('2️⃣  Deleting debate matches...')
        const deletedMatches = await prisma.debateMatch.deleteMany({
            where: {
                round: {
                    competition: {
                        code: 'EDC'
                    }
                }
            }
        })
        console.log(`   ✅ Deleted ${deletedMatches.count} matches`)

        console.log('')
        console.log('✅ EDC matches & scores deletion completed!')
    } catch (error) {
        console.error('❌ Error during deletion:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Run the script
deleteEDCMatches()
    .catch(console.error)