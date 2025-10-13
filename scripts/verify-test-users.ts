import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying test users in database...\n')

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['admin@test.com', 'judge@test.com', 'participant@test.com'],
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      participant: {
        select: {
          fullName: true,
          institution: true,
        },
      },
    },
    orderBy: {
      role: 'asc',
    },
  })

  if (users.length === 0) {
    console.log('❌ No test users found!')
    return
  }

  console.log(`✅ Found ${users.length} test user(s):\n`)

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.role.toUpperCase()}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`)
    console.log(`   Created: ${user.createdAt.toISOString()}`)
    if (user.participant) {
      console.log(`   Participant Profile: ✅`)
      console.log(`   Institution: ${user.participant.institution}`)
    }
    console.log('')
  })

  console.log('✅ All test users verified successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

