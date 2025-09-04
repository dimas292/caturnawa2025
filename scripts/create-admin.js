const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function createAdmin() {
  try {
    console.log('🔧 Creating Admin Account for UNAS FEST 2025')
    console.log('=====================================')

    const name = await question('Admin Name: ')
    const email = await question('Admin Email: ')
    const password = await question('Admin Password (min 8 characters): ', true)

    // Validate inputs
    if (!name || !email || !password) {
      console.error(' All fields are required!')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error(' Password must be at least 8 characters!')
      process.exit(1)
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error(' Email already exists!')
      process.exit(1)
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    console.log('👤 Creating admin user...')
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      }
    })

    console.log('✅ Admin created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('👤 Name:', admin.name)
    console.log('🎭 Role:', admin.role)
    console.log('🆔 ID:', admin.id)
    console.log('')
    console.log('🚀 You can now login to admin dashboard at: /auth/signin')

  } catch (error) {
    console.error(' Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

function question(prompt, hidden = false) {
  return new Promise((resolve) => {
    if (hidden) {
      process.stdout.write(prompt)
      process.stdin.setRawMode(true)
      process.stdin.resume()
      process.stdin.setEncoding('utf8')
      
      let password = ''
      process.stdin.on('data', function(char) {
        char = char + ''
        
        switch(char) {
          case '\n':
          case '\r':
          case '\u0004':
            process.stdin.setRawMode(false)
            process.stdin.pause()
            process.stdout.write('\n')
            resolve(password)
            break
          case '\u0003':
            process.exit()
            break
          case '\u007f': // backspace
            if (password.length > 0) {
              password = password.slice(0, -1)
              process.stdout.write('\b \b')
            }
            break
          default:
            password += char
            process.stdout.write('*')
            break
        }
      })
    } else {
      rl.question(prompt, resolve)
    }
  })
}

createAdmin()