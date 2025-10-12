import { cn } from '../utils'

describe('Utils', () => {
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
  })
})

