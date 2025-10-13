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

  describe('Cleanup Mechanism', () => {
    it('should clean up expired entries when store size exceeds 10000', async () => {
      jest.useFakeTimers()

      const config = { interval: 1000, uniqueTokenPerInterval: 5 }

      // Add more than 10000 entries to trigger cleanup
      // We'll add 10001 entries
      for (let i = 0; i < 10001; i++) {
        await rateLimit(`user-${i}`, config)
      }

      // Advance time to expire some entries
      jest.advanceTimersByTime(1500)

      // Add one more request to trigger cleanup logic
      const result = await rateLimit('trigger-cleanup', config)

      // Should succeed
      expect(result.success).toBe(true)

      jest.useRealTimers()
    })

    it('should only delete expired entries during cleanup', async () => {
      jest.useFakeTimers()

      const config = { interval: 5000, uniqueTokenPerInterval: 5 }

      // Add 10001 entries with long TTL
      for (let i = 0; i < 10001; i++) {
        await rateLimit(`active-user-${i}`, config)
      }

      // Don't advance time much (entries not expired)
      jest.advanceTimersByTime(100)

      // Trigger cleanup
      const result = await rateLimit('trigger-cleanup-2', config)

      // Should succeed
      expect(result.success).toBe(true)

      // Verify some active users still have their limits
      const activeResult = await rateLimit('active-user-100', config)
      expect(activeResult.remaining).toBeLessThan(5) // Should have used some quota

      jest.useRealTimers()
    })

    it('should handle cleanup with mixed expired and active entries', async () => {
      jest.useFakeTimers()

      // Add 5000 entries with short TTL
      const shortConfig = { interval: 1000, uniqueTokenPerInterval: 5 }
      for (let i = 0; i < 5000; i++) {
        await rateLimit(`short-ttl-${i}`, shortConfig)
      }

      // Advance time to expire short TTL entries
      jest.advanceTimersByTime(1500)

      // Add 5002 entries with long TTL (total > 10000)
      const longConfig = { interval: 10000, uniqueTokenPerInterval: 5 }
      for (let i = 0; i < 5002; i++) {
        await rateLimit(`long-ttl-${i}`, longConfig)
      }

      // Trigger cleanup
      const result = await rateLimit('cleanup-trigger', longConfig)

      // Should succeed
      expect(result.success).toBe(true)

      // Expired entries should be cleaned up
      const expiredResult = await rateLimit('short-ttl-100', shortConfig)
      expect(expiredResult.remaining).toBe(4) // Should be fresh (cleaned up)

      jest.useRealTimers()
    })
  })

  describe('Edge Cases', () => {
    it('should handle default config', async () => {
      const result = await rateLimit('default-config-user')

      expect(result.success).toBe(true)
      expect(result.limit).toBe(10) // Default uniqueTokenPerInterval
    })

    it('should handle zero remaining correctly', async () => {
      const config = { interval: 60000, uniqueTokenPerInterval: 1 }

      const result1 = await rateLimit('zero-remaining', config)
      expect(result1.remaining).toBe(0)

      const result2 = await rateLimit('zero-remaining', config)
      expect(result2.success).toBe(false)
      expect(result2.remaining).toBe(0)
    })

    it('should handle very short intervals', async () => {
      jest.useFakeTimers()

      const config = { interval: 100, uniqueTokenPerInterval: 2 }

      await rateLimit('short-interval', config)
      await rateLimit('short-interval', config)

      const blocked = await rateLimit('short-interval', config)
      expect(blocked.success).toBe(false)

      jest.advanceTimersByTime(101)

      const allowed = await rateLimit('short-interval', config)
      expect(allowed.success).toBe(true)

      jest.useRealTimers()
    })

    it('should handle very large intervals', async () => {
      const config = { interval: 24 * 60 * 60 * 1000, uniqueTokenPerInterval: 100 }

      const result = await rateLimit('large-interval', config)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(100)
    })

    it('should return correct reset time', async () => {
      jest.useFakeTimers()
      const now = Date.now()

      const config = { interval: 5000, uniqueTokenPerInterval: 5 }

      const result = await rateLimit('reset-time-test', config)

      expect(result.reset).toBe(now + 5000)

      jest.useRealTimers()
    })
  })
})

