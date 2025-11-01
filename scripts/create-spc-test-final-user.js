// scripts/create-spc-test-final-user.js
// Creates a test user/participant/registration and marks SPC submission as qualifiedToFinal

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('🔧 Creating SPC test user and advancing to final (account name: test)')

        // Find SPC competition
        const competition = await prisma.competition.findFirst({ where: { type: 'SPC' } })
        if (!competition) {
            throw new Error('SPC competition not found in database. Please ensure competition seed exists.')
        }

        const testEmail = 'test@spc.local'

        // Upsert user
        const user = await prisma.user.upsert({
            where: { email: testEmail },
            update: { name: 'test' },
            create: {
                name: 'test',
                email: testEmail,
                password: null,
                role: 'participant'
            }
        })

        // Upsert participant
        const participant = await prisma.participant.upsert({
            where: { userId: user.id },
            update: {
                fullName: 'Test User',
                email: testEmail,
                whatsappNumber: '081234567890',
                institution: 'Test Institution'
            },
            create: {
                userId: user.id,
                fullName: 'Test User',
                email: testEmail,
                gender: 'MALE',
                whatsappNumber: '081234567890',
                institution: 'Test Institution'
            }
        })

        // Upsert registration (verified)
        const registration = await prisma.registration.upsert({
            where: {
                participantId_competitionId: {
                    participantId: participant.id,
                    competitionId: competition.id
                }
            },
            update: {
                teamName: 'Test SPC Team',
                status: 'VERIFIED',
                paymentPhase: 'PHASE_1',
                paymentAmount: 0,
                verifiedAt: new Date(),
                agreementAccepted: true,
                workTitle: 'Test Paper Title',
                workDescription: 'Auto-created test submission for SPC final',
                updatedAt: new Date()
            },
            create: {
                participantId: participant.id,
                competitionId: competition.id,
                teamName: 'Test SPC Team',
                status: 'VERIFIED',
                paymentPhase: 'PHASE_1',
                paymentAmount: 0,
                paymentCode: 'TEST',
                agreementAccepted: true,
                workTitle: 'Test Paper Title',
                workDescription: 'Auto-created test submission for SPC final',
                verifiedAt: new Date()
            }
        })

        // Upsert SPCSubmission and mark qualifiedToFinal = true
        const submission = await prisma.sPCSubmission.upsert({
            where: { registrationId: registration.id },
            update: {
                judulKarya: 'Test Paper for Final',
                status: 'QUALIFIED',
                qualifiedToFinal: true,
                updatedAt: new Date()
            },
            create: {
                registrationId: registration.id,
                judulKarya: 'Test Paper for Final',
                status: 'QUALIFIED',
                qualifiedToFinal: true
            }
        })

        console.log('✅ Created/updated:')
        console.log('User:', { id: user.id, email: user.email })
        console.log('Participant:', { id: participant.id, fullName: participant.fullName })
        console.log('Registration:', { id: registration.id, competitionId: registration.competitionId })
        console.log('SPCSubmission:', { id: submission.id, qualifiedToFinal: submission.qualifiedToFinal })

    } catch (err) {
        console.error('Error:', err)
        process.exitCode = 1
    } finally {
        await prisma.$disconnect()
    }
}

main()
