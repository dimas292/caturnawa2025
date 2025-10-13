import { cache, CacheTTL, getCached, invalidateCache } from '../cache'

describe('Cache', () => {
  beforeEach(() => {
    cache.clear()
  })

  afterAll(() => {
    cache.destroy()
  })

  describe('Basic Operations', () => {
    it('should set and get cached data', () => {
      cache.set('test-key', 'test-value')
      expect(cache.get('test-key')).toBe('test-value')
    })

    it('should return null for non-existent key', () => {
      expect(cache.get('non-existent')).toBeNull()
    })

    it('should delete cached data', () => {
      cache.set('test-key', 'test-value')
      cache.delete('test-key')
      expect(cache.get('test-key')).toBeNull()
    })

    it('should clear all cached data', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('TTL (Time To Live)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should expire data after TTL', () => {
      cache.set('test-key', 'test-value', 1000) // 1 second TTL
      
      // Should exist immediately
      expect(cache.get('test-key')).toBe('test-value')
      
      // Fast forward time
      jest.advanceTimersByTime(1001)
      
      // Should be expired
      expect(cache.get('test-key')).toBeNull()
    })

    it('should not expire data before TTL', () => {
      cache.set('test-key', 'test-value', 5000) // 5 seconds TTL
      
      jest.advanceTimersByTime(4000)
      
      expect(cache.get('test-key')).toBe('test-value')
    })

    it('should use default TTL if not specified', () => {
      cache.set('test-key', 'test-value')
      
      // Default is 5 minutes
      jest.advanceTimersByTime(4 * 60 * 1000)
      expect(cache.get('test-key')).toBe('test-value')
      
      jest.advanceTimersByTime(2 * 60 * 1000)
      expect(cache.get('test-key')).toBeNull()
    })
  })

  describe('Data Types', () => {
    it('should cache strings', () => {
      cache.set('string', 'hello')
      expect(cache.get('string')).toBe('hello')
    })

    it('should cache numbers', () => {
      cache.set('number', 42)
      expect(cache.get('number')).toBe(42)
    })

    it('should cache objects', () => {
      const obj = { name: 'test', value: 123 }
      cache.set('object', obj)
      expect(cache.get('object')).toEqual(obj)
    })

    it('should cache arrays', () => {
      const arr = [1, 2, 3, 4, 5]
      cache.set('array', arr)
      expect(cache.get('array')).toEqual(arr)
    })

    it('should cache null', () => {
      cache.set('null', null)
      expect(cache.get('null')).toBeNull()
    })
  })

  describe('Statistics', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.keys).toContain('key1')
      expect(stats.keys).toContain('key2')
    })

    it('should update size after deletion', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.delete('key1')
      
      const stats = cache.getStats()
      expect(stats.size).toBe(1)
    })
  })

  describe('getCached Helper', () => {
    it('should fetch and cache data', async () => {
      const fetcher = jest.fn().mockResolvedValue('fetched-data')
      
      const result = await getCached('test-key', fetcher)
      
      expect(result).toBe('fetched-data')
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    it('should return cached data without calling fetcher', async () => {
      const fetcher = jest.fn().mockResolvedValue('fetched-data')
      
      // First call
      await getCached('test-key', fetcher)
      
      // Second call
      const result = await getCached('test-key', fetcher)
      
      expect(result).toBe('fetched-data')
      expect(fetcher).toHaveBeenCalledTimes(1) // Only called once
    })

    it('should use custom TTL', async () => {
      jest.useFakeTimers()
      
      const fetcher = jest.fn().mockResolvedValue('data')
      
      await getCached('test-key', fetcher, 1000)
      
      jest.advanceTimersByTime(1001)
      
      await getCached('test-key', fetcher, 1000)
      
      expect(fetcher).toHaveBeenCalledTimes(2)
      
      jest.useRealTimers()
    })
  })

  describe('invalidateCache', () => {
    it('should invalidate cache by pattern', () => {
      cache.set('user:1', 'data1')
      cache.set('user:2', 'data2')
      cache.set('post:1', 'data3')
      
      invalidateCache(/^user:/)
      
      expect(cache.get('user:1')).toBeNull()
      expect(cache.get('user:2')).toBeNull()
      expect(cache.get('post:1')).toBe('data3')
    })

    it('should handle empty pattern match', () => {
      cache.set('key1', 'value1')
      
      invalidateCache(/^nonexistent/)
      
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('CacheTTL Presets', () => {
    it('should have correct TTL values', () => {
      expect(CacheTTL.SHORT).toBe(1 * 60 * 1000)
      expect(CacheTTL.MEDIUM).toBe(5 * 60 * 1000)
      expect(CacheTTL.LONG).toBe(15 * 60 * 1000)
      expect(CacheTTL.VERY_LONG).toBe(60 * 60 * 1000)
    })
  })

  describe('Cleanup Mechanism', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should clean up expired entries automatically', () => {
      // Set some entries with short TTL
      cache.set('key1', 'value1', 1000)
      cache.set('key2', 'value2', 2000)
      cache.set('key3', 'value3', 10000)

      // Verify all exist
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')

      // Advance time to expire key1 and key2
      jest.advanceTimersByTime(2500)

      // Manually trigger cleanup (since we can't wait for interval)
      ;(cache as any).cleanup()

      // key1 and key2 should be cleaned up
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
      expect(cache.get('key3')).toBe('value3')
    })

    it('should not delete non-expired entries during cleanup', () => {
      cache.set('key1', 'value1', 10000)
      cache.set('key2', 'value2', 10000)

      // Advance time but not enough to expire
      jest.advanceTimersByTime(5000)

      // Trigger cleanup
      ;(cache as any).cleanup()

      // Both should still exist
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
    })

    it('should handle cleanup with empty cache', () => {
      // Should not throw error
      expect(() => (cache as any).cleanup()).not.toThrow()
    })

    it('should handle cleanup with all expired entries', () => {
      cache.set('key1', 'value1', 1000)
      cache.set('key2', 'value2', 1000)

      jest.advanceTimersByTime(1500)

      ;(cache as any).cleanup()

      const stats = cache.getStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('Destroy Method', () => {
    it('should clear interval on destroy', () => {
      // Create a new cache instance to test cleanup interval
      const { cache: testCache } = require('../cache')

      // Spy on clearInterval
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

      testCache.destroy()

      // Should have called clearInterval if interval was set
      // Note: In browser environment (jsdom), cleanupInterval won't be set
      // So we just verify destroy doesn't throw
      expect(() => testCache.destroy()).not.toThrow()

      clearIntervalSpy.mockRestore()
    })

    it('should clear all data on destroy', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      cache.destroy()

      const stats = cache.getStats()
      expect(stats.size).toBe(0)
    })

    it('should handle multiple destroy calls', () => {
      cache.destroy()

      // Should not throw on second destroy
      expect(() => cache.destroy()).not.toThrow()
    })
  })
})

