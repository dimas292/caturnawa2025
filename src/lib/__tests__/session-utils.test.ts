import { 
  clearUserSessions, 
  invalidateCurrentSession, 
  validateUserExists,
  refreshSession,
  isSessionExpiringSoon,
  getRemainingSessionTime
} from '../session-utils'
import { signOut, getSession } from 'next-auth/react'
import { prisma } from '../prisma'

// Mock dependencies
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
  getSession: jest.fn()
}))

jest.mock('../prisma', () => ({
  prisma: {
    session: {
      deleteMany: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    }
  }
}))

// Mock global fetch
global.fetch = jest.fn()

describe('Session Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('clearUserSessions', () => {
    it('should delete all sessions for a user', async () => {
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 3 })

      await clearUserSessions('user-123')

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' }
      })
    })

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(prisma.session.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      await clearUserSessions('user-123')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error clearing user sessions:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('should work with empty userId', async () => {
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })

      await clearUserSessions('')

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: '' }
      })
    })

    it('should not throw on database error', async () => {
      (prisma.session.deleteMany as jest.Mock).mockRejectedValue(new Error('DB error'))
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(clearUserSessions('user-123')).resolves.not.toThrow()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('invalidateCurrentSession', () => {
    it('should call signOut with deleted reason', () => {
      invalidateCurrentSession('deleted')

      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: '/auth/signin?message=account-deleted',
        redirect: true
      })
    })

    it('should call signOut with invalid reason for other reasons', () => {
      invalidateCurrentSession('expired')

      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: '/auth/signin?message=session-invalid',
        redirect: true
      })
    })

    it('should call signOut with invalid reason when no reason provided', () => {
      invalidateCurrentSession()

      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: '/auth/signin?message=session-invalid',
        redirect: true
      })
    })

    it('should return signOut promise', () => {
      const mockPromise = Promise.resolve({ url: '/auth/signin' });
      (signOut as jest.Mock).mockReturnValue(mockPromise)

      const result = invalidateCurrentSession()

      expect(result).toBe(mockPromise)
    })
  })

  describe('validateUserExists', () => {
    it('should return true when user exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com'
      })

      const result = await validateUserExists('user-123')

      expect(result).toBe(true)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      })
    })

    it('should return false when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await validateUserExists('user-123')

      expect(result).toBe(false)
    })

    it('should return false on database error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'))

      const result = await validateUserExists('user-123')

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error validating user existence:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('should handle empty userId', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await validateUserExists('')

      expect(result).toBe(false)
    })
  })

  describe('refreshSession', () => {
    it('should return true when session refresh succeeds', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
        expires: new Date(Date.now() + 3600000).toISOString()
      })
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await refreshSession()

      expect(result).toBe(true)
      expect(fetch).toHaveBeenCalledWith('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      })
    })

    it('should return false when no session exists', async () => {
      (getSession as jest.Mock).mockResolvedValue(null)

      const result = await refreshSession()

      expect(result).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should return false when fetch fails', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' }
      })
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401
      })

      const result = await refreshSession()

      expect(result).toBe(false)
    })

    it('should return false on network error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' }
      })
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await refreshSession()

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error refreshing session:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('isSessionExpiringSoon', () => {
    it('should return true when session expires in less than 1 hour', () => {
      const session = {
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      }

      expect(isSessionExpiringSoon(session)).toBe(true)
    })

    it('should return false when session expires in more than 1 hour', () => {
      const session = {
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      }

      expect(isSessionExpiringSoon(session)).toBe(false)
    })

    it('should return false when session has no expires field', () => {
      expect(isSessionExpiringSoon({})).toBe(false)
      expect(isSessionExpiringSoon({ expires: null })).toBe(false)
      expect(isSessionExpiringSoon({ expires: undefined })).toBe(false)
    })

    it('should return false when session is null', () => {
      expect(isSessionExpiringSoon(null)).toBe(false)
    })

    it('should return true when session already expired', () => {
      const session = {
        expires: new Date(Date.now() - 1000).toISOString() // 1 second ago
      }

      expect(isSessionExpiringSoon(session)).toBe(true)
    })

    it('should return true when session expires exactly in 1 hour', () => {
      const session = {
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString() // exactly 1 hour
      }

      // Should be false because it's not less than 1 hour
      expect(isSessionExpiringSoon(session)).toBe(false)
    })
  })

  describe('getRemainingSessionTime', () => {
    it('should return remaining time in minutes', () => {
      const session = {
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      }

      const remaining = getRemainingSessionTime(session)

      expect(remaining).toBeGreaterThanOrEqual(29)
      expect(remaining).toBeLessThanOrEqual(30)
    })

    it('should return 0 when session has no expires field', () => {
      expect(getRemainingSessionTime({})).toBe(0)
      expect(getRemainingSessionTime({ expires: null })).toBe(0)
      expect(getRemainingSessionTime({ expires: undefined })).toBe(0)
    })

    it('should return 0 when session is null', () => {
      expect(getRemainingSessionTime(null)).toBe(0)
    })

    it('should return 0 when session already expired', () => {
      const session = {
        expires: new Date(Date.now() - 1000).toISOString() // 1 second ago
      }

      expect(getRemainingSessionTime(session)).toBe(0)
    })

    it('should return correct time for long sessions', () => {
      const session = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      const remaining = getRemainingSessionTime(session)

      expect(remaining).toBeGreaterThanOrEqual(1439) // 24 * 60 - 1
      expect(remaining).toBeLessThanOrEqual(1440) // 24 * 60
    })

    it('should floor the minutes', () => {
      const session = {
        expires: new Date(Date.now() + 90 * 1000).toISOString() // 90 seconds = 1.5 minutes
      }

      expect(getRemainingSessionTime(session)).toBe(1) // Should floor to 1 minute
    })
  })
})

