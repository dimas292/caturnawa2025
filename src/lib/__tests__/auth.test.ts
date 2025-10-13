import { authOptions } from '../auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}))

jest.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({}))
}))

describe('Auth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('authOptions Structure', () => {
    it('should have correct session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('should have correct session maxAge (30 days)', () => {
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60)
    })

    it('should have correct session updateAge (24 hours)', () => {
      expect(authOptions.session?.updateAge).toBe(24 * 60 * 60)
    })

    it('should have correct JWT maxAge (30 days)', () => {
      expect(authOptions.jwt?.maxAge).toBe(30 * 24 * 60 * 60)
    })

    it('should have signin page configured', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin')
    })

    it('should have providers array', () => {
      expect(authOptions.providers).toBeDefined()
      expect(Array.isArray(authOptions.providers)).toBe(true)
      expect(authOptions.providers.length).toBeGreaterThan(0)
    })

    it('should have callbacks defined', () => {
      expect(authOptions.callbacks).toBeDefined()
      expect(authOptions.callbacks?.jwt).toBeDefined()
      expect(authOptions.callbacks?.session).toBeDefined()
      expect(authOptions.callbacks?.redirect).toBeDefined()
    })

    it('should have useSecureCookies configured', () => {
      expect(authOptions.useSecureCookies).toBeDefined()
      expect(typeof authOptions.useSecureCookies).toBe('boolean')
    })

    it('should have debug configured', () => {
      expect(authOptions.debug).toBeDefined()
      expect(typeof authOptions.debug).toBe('boolean')
    })
  })

  describe('Credentials Provider', () => {
    const mockPrismaUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'PARTICIPANT',
      password: 'hashed-password',
      image: null,
      participant: null
    }

    it('should return null if email is missing', async () => {
      const provider = authOptions.providers[0] as any
      const result = await provider.authorize({ password: 'password' })
      
      expect(result).toBeNull()
    })

    it('should return null if password is missing', async () => {
      const provider = authOptions.providers[0] as any
      const result = await provider.authorize({ email: 'test@example.com' })
      
      expect(result).toBeNull()
    })

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      
      const provider = authOptions.providers[0] as any
      const result = await provider.authorize({
        email: 'notfound@example.com',
        password: 'password'
      })
      
      expect(result).toBeNull()
    })

    it('should return null if password is invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockPrismaUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false)
      
      const provider = authOptions.providers[0] as any
      const result = await provider.authorize({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      
      expect(result).toBeNull()
    })

    it('should have credentials provider configured', () => {
      const provider = authOptions.providers[0] as any

      expect(provider.name).toBe('Credentials')
      expect(provider.authorize).toBeDefined()
      expect(typeof provider.authorize).toBe('function')
    })

    it('should have provider type', () => {
      const provider = authOptions.providers[0] as any

      expect(provider.type).toBe('credentials')
    })

    it('should have provider id', () => {
      const provider = authOptions.providers[0] as any

      expect(provider.id).toBe('credentials')
    })
  })

  describe('JWT Callback', () => {
    it('should add user data to token on signin', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARTICIPANT'
      }
      
      const token = {}
      const result = await authOptions.callbacks!.jwt!({
        token,
        user: mockUser,
        trigger: 'signIn' as any,
        session: undefined as any,
        account: null
      })
      
      expect(result.id).toBe('user-123')
      expect(result.email).toBe('test@example.com')
      expect(result.name).toBe('Test User')
      expect(result.role).toBe('PARTICIPANT')
      expect(result.lastActivity).toBeDefined()
    })

    it('should update lastActivity on every request', async () => {
      const token = { id: 'user-123', role: 'PARTICIPANT' }
      const beforeTime = Date.now()
      
      const result = await authOptions.callbacks!.jwt!({
        token,
        user: undefined,
        trigger: undefined as any,
        session: undefined as any,
        account: null
      })
      
      const afterTime = Date.now()
      
      expect(result.lastActivity).toBeDefined()
      expect(result.lastActivity).toBeGreaterThanOrEqual(beforeTime)
      expect(result.lastActivity).toBeLessThanOrEqual(afterTime)
    })

    it('should preserve existing token data', async () => {
      const token = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN',
        customField: 'custom-value'
      }
      
      const result = await authOptions.callbacks!.jwt!({
        token,
        user: undefined,
        trigger: undefined as any,
        session: undefined as any,
        account: null
      })
      
      expect(result.id).toBe('user-123')
      expect(result.email).toBe('test@example.com')
      expect(result.role).toBe('ADMIN')
      expect((result as any).customField).toBe('custom-value')
    })
  })

  describe('Session Callback', () => {
    it('should create session with valid token', async () => {
      const mockSession = {
        user: {} as any,
        expires: ''
      }
      
      const mockToken = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARTICIPANT'
      }
      
      const result = await authOptions.callbacks!.session!({
        session: mockSession,
        token: mockToken,
        user: undefined as any,
        newSession: undefined as any,
        trigger: 'getSession'
      })
      
      expect(result.user.id).toBe('user-123')
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.name).toBe('Test User')
      expect(result.user.role).toBe('PARTICIPANT')
      expect(result.expires).toBeDefined()
    })

    it('should set expires to 30 days from now', async () => {
      const mockSession = {
        user: {} as any,
        expires: ''
      }
      
      const mockToken = {
        id: 'user-123',
        role: 'PARTICIPANT',
        email: 'test@example.com',
        name: 'Test User'
      }
      
      const beforeTime = Date.now()
      
      const result = await authOptions.callbacks!.session!({
        session: mockSession,
        token: mockToken,
        user: undefined as any,
        newSession: undefined as any,
        trigger: 'getSession'
      })
      
      const expiresTime = new Date(result.expires).getTime()
      const expectedTime = beforeTime + 30 * 24 * 60 * 60 * 1000
      
      // Allow 1 second tolerance
      expect(expiresTime).toBeGreaterThanOrEqual(expectedTime - 1000)
      expect(expiresTime).toBeLessThanOrEqual(expectedTime + 1000)
    })

    it('should return session unchanged if token is invalid', async () => {
      const mockSession = {
        user: {} as any,
        expires: 'original-expires'
      }
      
      const mockToken = {} // Missing required fields
      
      const result = await authOptions.callbacks!.session!({
        session: mockSession,
        token: mockToken,
        user: undefined as any,
        newSession: undefined as any,
        trigger: 'getSession'
      })
      
      expect(result.user.id).toBeUndefined()
      expect(result.expires).toBe('original-expires')
    })
  })

  describe('Redirect Callback', () => {
    const baseUrl = 'http://localhost:3000'

    it('should handle relative URLs', async () => {
      const result = await authOptions.callbacks!.redirect!({
        url: '/dashboard',
        baseUrl
      })

      expect(result).toBe('http://localhost:3000/dashboard')
    })

    it('should handle same origin URLs', async () => {
      const result = await authOptions.callbacks!.redirect!({
        url: 'http://localhost:3000/auth/signin',
        baseUrl
      })

      expect(result).toBe('http://localhost:3000/auth/signin')
    })

    it('should return baseUrl for different origin URLs', async () => {
      const result = await authOptions.callbacks!.redirect!({
        url: 'http://malicious-site.com/phishing',
        baseUrl
      })

      expect(result).toBe(baseUrl)
    })

    it('should handle root path', async () => {
      const result = await authOptions.callbacks!.redirect!({
        url: '/',
        baseUrl
      })

      expect(result).toBe('http://localhost:3000/')
    })

    it('should handle nested paths', async () => {
      const result = await authOptions.callbacks!.redirect!({
        url: '/dashboard/admin/users',
        baseUrl
      })

      expect(result).toBe('http://localhost:3000/dashboard/admin/users')
    })
  })

  describe('Cookie Configuration', () => {
    it('should have sessionToken cookie configured', () => {
      expect(authOptions.cookies?.sessionToken).toBeDefined()
      expect(authOptions.cookies?.sessionToken?.options?.httpOnly).toBe(true)
      expect(authOptions.cookies?.sessionToken?.options?.sameSite).toBe('lax')
      expect(authOptions.cookies?.sessionToken?.options?.path).toBe('/')
    })

    it('should have callbackUrl cookie configured', () => {
      expect(authOptions.cookies?.callbackUrl).toBeDefined()
      expect(authOptions.cookies?.callbackUrl?.options?.httpOnly).toBe(true)
      expect(authOptions.cookies?.callbackUrl?.options?.sameSite).toBe('lax')
      expect(authOptions.cookies?.callbackUrl?.options?.path).toBe('/')
    })

    it('should have csrfToken cookie configured', () => {
      expect(authOptions.cookies?.csrfToken).toBeDefined()
      expect(authOptions.cookies?.csrfToken?.options?.httpOnly).toBe(true)
      expect(authOptions.cookies?.csrfToken?.options?.sameSite).toBe('lax')
      expect(authOptions.cookies?.csrfToken?.options?.path).toBe('/')
    })

    it('should have cookie names configured', () => {
      expect(authOptions.cookies?.sessionToken?.name).toBeDefined()
      expect(authOptions.cookies?.callbackUrl?.name).toBeDefined()
      expect(authOptions.cookies?.csrfToken?.name).toBeDefined()
    })

    it('should have secure flag configured for cookies', () => {
      expect(authOptions.cookies?.sessionToken?.options?.secure).toBeDefined()
      expect(authOptions.cookies?.callbackUrl?.options?.secure).toBeDefined()
      expect(authOptions.cookies?.csrfToken?.options?.secure).toBeDefined()
    })
  })

  describe('Security', () => {
    it('should have secret configured', () => {
      expect(authOptions.secret).toBeDefined()
    })

    it('should use PrismaAdapter', () => {
      expect(authOptions.adapter).toBeDefined()
    })

    it('should have httpOnly cookies', () => {
      expect(authOptions.cookies?.sessionToken?.options?.httpOnly).toBe(true)
      expect(authOptions.cookies?.callbackUrl?.options?.httpOnly).toBe(true)
      expect(authOptions.cookies?.csrfToken?.options?.httpOnly).toBe(true)
    })

    it('should use lax sameSite policy', () => {
      expect(authOptions.cookies?.sessionToken?.options?.sameSite).toBe('lax')
      expect(authOptions.cookies?.callbackUrl?.options?.sameSite).toBe('lax')
      expect(authOptions.cookies?.csrfToken?.options?.sameSite).toBe('lax')
    })
  })
})

