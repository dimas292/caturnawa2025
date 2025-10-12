import { rateLimit, getClientIdentifier, RateLimitPresets } from '../rate-limit'

describe('Rate Limit', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    jest.clearAllMocks()
  })

  describe('rateLimit', () => {
    it('should allow first request', async () => {
      const result = await rateLimit('test-user-1', {
        interval: 60000,
        uniqueTokenPerInterval: 5,
      })

      expect(result.success).toBe(true)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(4)
    })

    it('should track multiple requests', async () => {
      const config = { interval: 60000, uniqueTokenPerInterval: 3 }
      
      const result1 = await rateLimit('test-user-2', config)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(2)

      const result2 = await rateLimit('test-user-2', config)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(1)

      const result3 = await rateLimit('test-user-2', config)
      expect(result3.success).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('should block requests when limit exceeded', async () => {
      const config = { interval: 60000, uniqueTokenPerInterval: 2 }
      
      await rateLimit('test-user-3', config)
      await rateLimit('test-user-3', config)
      
      const result = await rateLimit('test-user-3', config)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after interval expires', async () => {
      jest.useFakeTimers()
      
      const config = { interval: 1000, uniqueTokenPerInterval: 2 }
      
      await rateLimit('test-user-4', config)
      await rateLimit('test-user-4', config)
      
      // Should be blocked
      const blocked = await rateLimit('test-user-4', config)
      expect(blocked.success).toBe(false)
      
      // Advance time past interval
      jest.advanceTimersByTime(1001)
      
      // Should be allowed again
      const allowed = await rateLimit('test-user-4', config)
      expect(allowed.success).toBe(true)
      expect(allowed.remaining).toBe(1)
      
      jest.useRealTimers()
    })

    it('should handle different identifiers separately', async () => {
      const config = { interval: 60000, uniqueTokenPerInterval: 1 }
      
      const result1 = await rateLimit('user-a', config)
      const result2 = await rateLimit('user-b', config)
      
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const mockRequest = {
        headers: {
          get: (key: string) => {
            if (key === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
            return null
          }
        }
      } as Request

      const identifier = getClientIdentifier(mockRequest)
      expect(identifier).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const mockRequest = {
        headers: {
          get: (key: string) => {
            if (key === 'x-real-ip') return '192.168.1.2'
            return null
          }
        }
      } as Request

      const identifier = getClientIdentifier(mockRequest)
      expect(identifier).toBe('192.168.1.2')
    })

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const mockRequest = {
        headers: {
          get: (key: string) => {
            if (key === 'x-forwarded-for') return '192.168.1.1'
            if (key === 'x-real-ip') return '192.168.1.2'
            return null
          }
        }
      } as Request

      const identifier = getClientIdentifier(mockRequest)
      expect(identifier).toBe('192.168.1.1')
    })

    it('should return unknown when no IP headers present', () => {
      const mockRequest = {
        headers: {
          get: () => null
        }
      } as Request

      const identifier = getClientIdentifier(mockRequest)
      expect(identifier).toBe('unknown')
    })
  })

  describe('RateLimitPresets', () => {
    it('should have auth preset with strict limits', () => {
      expect(RateLimitPresets.auth.uniqueTokenPerInterval).toBe(5)
      expect(RateLimitPresets.auth.interval).toBe(60000)
    })

    it('should have api preset with moderate limits', () => {
      expect(RateLimitPresets.api.uniqueTokenPerInterval).toBe(30)
      expect(RateLimitPresets.api.interval).toBe(60000)
    })

    it('should have upload preset', () => {
      expect(RateLimitPresets.upload.uniqueTokenPerInterval).toBe(10)
      expect(RateLimitPresets.upload.interval).toBe(60000)
    })

    it('should have admin preset', () => {
      expect(RateLimitPresets.admin.uniqueTokenPerInterval).toBe(20)
      expect(RateLimitPresets.admin.interval).toBe(60000)
    })
  })
})

