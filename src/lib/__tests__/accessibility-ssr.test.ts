/**
 * @jest-environment node
 *
 * SSR (Server-Side Rendering) tests for accessibility utilities
 * These tests verify that functions handle undefined window gracefully
 *
 * Using Node environment (no jsdom) to simulate SSR
 */

import {
  announceToScreenReader,
  prefersReducedMotion,
  prefersDarkMode,
  LiveRegion,
} from '../accessibility'

describe('Accessibility SSR Tests', () => {
  describe('announceToScreenReader', () => {
    it('should return early when window is undefined (Node environment)', () => {
      // In Node environment, window is undefined
      // Should not throw error
      expect(() => announceToScreenReader('Test message')).not.toThrow()
      expect(() => announceToScreenReader('Test', 'assertive')).not.toThrow()
    })
  })

  describe('prefersReducedMotion', () => {
    it('should return false when window is undefined (Node environment)', () => {
      // In Node environment, window is undefined
      expect(prefersReducedMotion()).toBe(false)
    })
  })

  describe('prefersDarkMode', () => {
    it('should return false when window is undefined (Node environment)', () => {
      // In Node environment, window is undefined
      expect(prefersDarkMode()).toBe(false)
    })
  })

  describe('LiveRegion', () => {
    it('should handle construction when window is undefined (Node environment)', () => {
      // In Node environment, window is undefined
      // Should not throw error
      expect(() => new LiveRegion()).not.toThrow()
      expect(() => new LiveRegion('assertive')).not.toThrow()
    })

    it('should handle announce when window is undefined', () => {
      const region = new LiveRegion()

      // Should not throw error when window is undefined
      expect(() => region.announce('Test')).not.toThrow()
    })

    it('should handle destroy when window is undefined', () => {
      const region = new LiveRegion()

      // Should not throw error when window is undefined
      expect(() => region.destroy()).not.toThrow()
    })
  })
})

