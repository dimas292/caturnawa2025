const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createJudge() {
  try {
    console.log('🔧 Creating Judge Account for UNAS FEST 2025');
    console.log('=====================================');

    const name = await question('Judge Name: ');
    const email = await question('Judge Email: ');
    const password = await question('Judge Password (min 8 characters, optional): ', true);

    // Validate inputs
    if (!name || !email || (password && password.length < 8)) {
      console.error(' All fields are required and password must be at least 8 characters if provided!');
      process.exit(1);
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.error(' Email already exists!');
      process.exit(1);
    }

    console.log('🔐 Hashing password...')
    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;

    // Create judge user
    console.log('👤 Creating judge user...');
    const judge = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'judge',
      },
    });

    console.log('✅ Judge created successfully!');
    console.log('📧 Email:', judge.email);
    console.log('👤 Name:', judge.name);
    console.log('🎭 Role:', judge.role);
    console.log('🆔 ID:', judge.id);
    console.log('');
    console.log('🚀 Judge can now access the system.');

  } catch (error) {
    console.error(' Error creating judge:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

createJudge();