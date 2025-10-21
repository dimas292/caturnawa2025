/**
 * Script untuk mengubah password participant berdasarkan email
 * 
 * Usage:
 * node scripts/update-participant-password.js <email> <new-password>
 * 
 * Contoh:
 * node scripts/update-participant-password.js user@example.com newpassword123
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateParticipantPassword(email, newPassword) {
  try {
    console.log(`\n🔍 Mencari user dengan email: ${email}`)
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        participant: true
      }
    })

    if (!user) {
      console.error(`❌ User dengan email "${email}" tidak ditemukan`)
      process.exit(1)
    }

    if (user.role !== 'participant') {
      console.error(`❌ User dengan email "${email}" bukan participant (role: ${user.role})`)
      process.exit(1)
    }

    console.log(`✅ User ditemukan:`)
    console.log(`   - Name: ${user.name}`)
    console.log(`   - Email: ${user.email}`)
    console.log(`   - Role: ${user.role}`)
    console.log(`   - Participant ID: ${user.participant?.id || 'N/A'}`)

    // Hash new password
    console.log(`\n🔐 Hashing password baru...`)
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    console.log(`💾 Mengupdate password...`)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    console.log(`\n✅ Password berhasil diubah untuk ${user.email}`)
    console.log(`   Password baru: ${newPassword}`)
    console.log(`\n⚠️  PENTING: Simpan password ini dengan aman!\n`)

  } catch (error) {
    console.error(`\n❌ Error:`, error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get arguments from command line
const args = process.argv.slice(2)

if (args.length !== 2) {
  console.error(`
❌ Usage: node scripts/update-participant-password.js <email> <new-password>

Contoh:
  node scripts/update-participant-password.js user@example.com newpassword123
  `)
  process.exit(1)
}

const [email, newPassword] = args

if (!email || !newPassword) {
  console.error('❌ Email dan password harus diisi')
  process.exit(1)
}

if (newPassword.length < 6) {
  console.error('❌ Password minimal 6 karakter')
  process.exit(1)
}

// Run the update
updateParticipantPassword(email, newPassword)
