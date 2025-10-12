/**
 * Tests for /api/auth/register endpoint
 */

import { POST } from '../auth/register/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    participant: {
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const validRegistrationData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    fullName: 'Test User Full Name',
    gender: 'MALE',
    whatsappNumber: '081234567890',
    institution: 'Test University',
    faculty: 'Engineering',
    studyProgram: 'Computer Science',
    studentId: '12345678',
    teamName: 'Test Team',
  }

  it('should register a new user successfully', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password')
    ;(prisma.user.create as jest.Mock).mockResolvedValue({
      id: '1',
      email: validRegistrationData.email,
      name: validRegistrationData.name,
      role: 'PARTICIPANT',
    })
    ;(prisma.participant.create as jest.Mock).mockResolvedValue({
      id: '1',
      userId: '1',
    })

    const request = {
      json: async () => validRegistrationData,
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('message', 'Registrasi berhasil')
    expect(data).toHaveProperty('user')
    expect(prisma.user.create).toHaveBeenCalled()
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
  })

  it('should reject registration with existing email', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: validRegistrationData.email,
    })

    const request = {
      json: async () => validRegistrationData,
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error', 'Email sudah terdaftar')
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should validate email format', async () => {
    const invalidData = {
      ...validRegistrationData,
      email: 'invalid-email',
    }

    const request = {
      json: async () => invalidData,
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Email tidak valid')
  })

  it('should validate password length', async () => {
    const invalidData = {
      ...validRegistrationData,
      password: '12345', // Less than 6 characters
    }

    const request = {
      json: async () => invalidData,
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Password minimal 6 karakter')
  })

  it('should validate required fields', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'password123',
      // Missing required fields
    }

    const request = {
      json: async () => invalidData,
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })

  it('should validate gender enum', async () => {
    const invalidData = {
      ...validRegistrationData,
      gender: 'INVALID',
    }

    const request = {
      json: async () => invalidData,
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Jenis kelamin')
  })

  it('should handle database errors gracefully', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password')
    ;(prisma.user.create as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    )

    const request = {
      json: async () => validRegistrationData,
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
  })

  it('should handle optional fields correctly', async () => {
    const minimalData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      fullName: 'Test User Full Name',
      gender: 'FEMALE',
      whatsappNumber: '081234567890',
      institution: 'Test University',
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password')
    ;(prisma.user.create as jest.Mock).mockResolvedValue({
      id: '1',
      email: minimalData.email,
      name: minimalData.name,
      role: 'PARTICIPANT',
    })
    ;(prisma.participant.create as jest.Mock).mockResolvedValue({
      id: '1',
      userId: '1',
    })

    const request = {
      json: async () => minimalData,
    } as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('message', 'Registrasi berhasil')
  })
})

