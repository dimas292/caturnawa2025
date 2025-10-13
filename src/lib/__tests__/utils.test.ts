import { cn, refreshSessionToken, isTokenExpiringSoon, getTokenRemainingTime } from '../utils'

// Mock fetch
global.fetch = jest.fn()

describe('Utils', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset Date.now mock
    jest.spyOn(Date, 'now').mockRestore()
  })

  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'hidden-class', 'visible-class')
      expect(result).toContain('base-class')
      expect(result).toContain('visible-class')
      expect(result).not.toContain('hidden-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'another-class')
      expect(result).toContain('base-class')
      expect(result).toContain('another-class')
    })

    it('should override conflicting Tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      // tailwind-merge should keep only the last conflicting class
      expect(result).toBe('text-blue-500')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle object with boolean values', () => {
      const result = cn({ 'active': true, 'disabled': false })
      expect(result).toContain('active')
      expect(result).not.toContain('disabled')
    })
  })

  describe('refreshSessionToken', () => {
    it('should return true when session refresh succeeds', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({})
      } as Response)

      const result = await refreshSessionToken()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
    })

    it('should return false when session refresh fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401
      } as Response)

      const result = await refreshSessionToken()

      expect(result).toBe(false)
    })

    it('should return false and log error when fetch throws', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await refreshSessionToken()

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to refresh session token:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('should include correct headers in request', async () => {
      mockFetch.mockResolvedValue({
        ok: true
      } as Response)

      await refreshSessionToken()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/session',
        expect.objectContaining({
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
      )
    })
  })

  describe('isTokenExpiringSoon', () => {
    it('should return true when token expires in less than 1 hour', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresIn30Minutes = now + (30 * 60) // 30 minutes from now

      const result = isTokenExpiringSoon(expiresIn30Minutes)

      expect(result).toBe(true)
    })

    it('should return false when token expires in more than 1 hour', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresIn2Hours = now + (2 * 60 * 60) // 2 hours from now

      const result = isTokenExpiringSoon(expiresIn2Hours)

      expect(result).toBe(false)
    })

    it('should return false when token is already expired', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiredToken = now - (10 * 60) // 10 minutes ago

      const result = isTokenExpiringSoon(expiredToken)

      expect(result).toBe(false)
    })

    it('should return true when token expires in exactly 59 minutes', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresIn59Minutes = now + (59 * 60)

      const result = isTokenExpiringSoon(expiresIn59Minutes)

      expect(result).toBe(true)
    })

    it('should return false when token expires in exactly 61 minutes', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresIn61Minutes = now + (61 * 60)

      const result = isTokenExpiringSoon(expiresIn61Minutes)

      expect(result).toBe(false)
    })

    it('should return false when token expires at exactly 0 seconds', () => {
      const now = Math.floor(Date.now() / 1000)

      const result = isTokenExpiringSoon(now)

      expect(result).toBe(false)
    })
  })

  describe('getTokenRemainingTime', () => {
    it('should return remaining time in minutes', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresIn2Hours = now + (2 * 60 * 60) // 2 hours = 120 minutes

      const result = getTokenRemainingTime(expiresIn2Hours)

      expect(result).toBe(120)
    })

    it('should return 0 for expired tokens', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiredToken = now - (10 * 60) // 10 minutes ago

      const result = getTokenRemainingTime(expiredToken)

      expect(result).toBe(0)
    })

    it('should return floored minutes', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresIn90Seconds = now + 90 // 1.5 minutes

      const result = getTokenRemainingTime(expiresIn90Seconds)

      expect(result).toBe(1) // Should floor to 1 minute
    })

    it('should return 0 when token expires in less than 1 minute', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresIn30Seconds = now + 30

      const result = getTokenRemainingTime(expiresIn30Seconds)

      expect(result).toBe(0)
    })

    it('should handle exact minute boundaries', () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresInExactly60Minutes = now + (60 * 60)

      const result = getTokenRemainingTime(expiresInExactly60Minutes)

      expect(result).toBe(60)
    })

    it('should return 0 for tokens expiring at current time', () => {
      const now = Math.floor(Date.now() / 1000)

      const result = getTokenRemainingTime(now)

      expect(result).toBe(0)
    })
  })
})
