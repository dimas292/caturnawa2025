import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function deleteSPCTestSubmissions() {
    try {
        console.log('🔄 Starting SPC test submissions cleanup...\n')

        // 1. Get test submissions (using a pattern to identify test accounts)
        const testSubmissions = await prisma.sPCSubmission.findMany({
            where: {
                registration: {
                    participant: {
                        // Pattern that matches test accounts
                        OR: [
                            { email: { contains: 'test' } },
                            { email: { contains: 'example' } },
                            { fullName: { contains: 'test' } },
                            { fullName: { contains: 'Test' } }
                        ]
                    }
                }
            },
            include: {
                registration: {
                    include: {
                        participant: true
                    }
                }
            }
        })

        console.log(`Found ${testSubmissions.length} test submissions:`)
        testSubmissions.forEach(sub => {
            console.log(`- ${sub.registration.participant.fullName} (${sub.registration.participant.email})`)
        })

        // 2. Delete related final scores first
        const deletedScores = await prisma.sPCFinalScore.deleteMany({
            where: {
                participantId: {
                    in: testSubmissions.map(sub => sub.id)
                }
            }
        })
        console.log(`\n✅ Deleted ${deletedScores.count} final scores`)

        // 3. Delete related semifinal evaluations
        const deletedEvals = await prisma.sPCEvaluation.deleteMany({
            where: {
                submissionId: {
                    in: testSubmissions.map(sub => sub.id)
                }
            }
        })
        console.log(`✅ Deleted ${deletedEvals.count} semifinal evaluations`)

        // 4. Delete the submissions
        const deletedSubs = await prisma.sPCSubmission.deleteMany({
            where: {
                id: {
                    in: testSubmissions.map(sub => sub.id)
                }
            }
        })
        console.log(`✅ Deleted ${deletedSubs.count} submissions`)

        // 5. Delete the registrations
        const deletedRegs = await prisma.sPCRegistration.deleteMany({
            where: {
                id: {
                    in: testSubmissions.map(sub => sub.registration.id)
                }
            }
        })
        console.log(`✅ Deleted ${deletedRegs.count} registrations`)

        // 6. Delete the participants
        const deletedParticipants = await prisma.participant.deleteMany({
            where: {
                id: {
                    in: testSubmissions.map(sub => sub.registration.participant.id)
                }
            }
        })
        console.log(`✅ Deleted ${deletedParticipants.count} test participants`)

        console.log('\n✨ Cleanup completed successfully!')

    } catch (error) {
        console.error('Error during cleanup:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

deleteSPCTestSubmissions()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })