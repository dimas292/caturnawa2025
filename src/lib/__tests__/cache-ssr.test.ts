/**
 * @jest-environment node
 * 
 * SSR (Server-Side Rendering) tests for cache utility
 * Tests cache behavior in Node environment (SSR)
 */

describe('Cache SSR Tests', () => {
  it('should initialize cleanup interval in Node environment', () => {
    // In Node environment (typeof window === 'undefined'), cleanup interval should be set
    jest.useFakeTimers()
    
    // Clear module cache to get fresh instance
    jest.resetModules()
    
    // Import cache in Node environment
    const { cache } = require('../cache')
    
    // Verify cache is created
    expect(cache).toBeDefined()
    
    // Set some data
    cache.set('test-key', 'test-value', 1000)
    expect(cache.get('test-key')).toBe('test-value')
    
    // Advance time to trigger cleanup interval (5 minutes)
    jest.advanceTimersByTime(5 * 60 * 1000 + 1000)
    
    // The cleanup should have run and removed expired entry
    expect(cache.get('test-key')).toBeNull()
    
    // Cleanup
    cache.destroy()
    jest.useRealTimers()
  })

  it('should clean up interval on destroy in Node environment', () => {
    jest.resetModules()
    
    const { cache } = require('../cache')
    
    // Spy on clearInterval
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    
    // Destroy should clear the interval
    cache.destroy()
    
    // In Node environment, cleanupInterval should be set, so clearInterval should be called
    expect(clearIntervalSpy).toHaveBeenCalled()
    
    clearIntervalSpy.mockRestore()
  })

  it('should handle multiple operations in Node environment', () => {
    jest.resetModules()
    
    const { cache, getCached, invalidateCache, CacheTTL } = require('../cache')
    
    // Test basic operations
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
    
    // Test getCached
    const fetcher = jest.fn().mockResolvedValue('fetched')
    getCached('key2', fetcher, CacheTTL.SHORT).then(result => {
      expect(result).toBe('fetched')
    })
    
    // Test invalidateCache
    cache.set('user:1', 'data1')
    cache.set('user:2', 'data2')
    invalidateCache(/^user:/)
    
    expect(cache.get('user:1')).toBeNull()
    expect(cache.get('user:2')).toBeNull()
    
    // Cleanup
    cache.destroy()
  })
})

