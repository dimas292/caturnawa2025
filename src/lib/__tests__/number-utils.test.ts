import { parseCommaDecimal, formatCommaDecimal, isValidDecimalInput } from '../number-utils'

describe('Number Utils', () => {
  describe('parseCommaDecimal', () => {
    it('should parse number with comma as decimal separator', () => {
      expect(parseCommaDecimal('10,5')).toBe(10.5)
      expect(parseCommaDecimal('5,25')).toBe(5.25)
      expect(parseCommaDecimal('100,0')).toBe(100.0)
    })

    it('should parse number with dot as decimal separator', () => {
      expect(parseCommaDecimal('10.5')).toBe(10.5)
      expect(parseCommaDecimal('5.25')).toBe(5.25)
    })

    it('should parse integer numbers', () => {
      expect(parseCommaDecimal('10')).toBe(10)
      expect(parseCommaDecimal('100')).toBe(100)
    })

    it('should return 0 for empty or invalid input', () => {
      expect(parseCommaDecimal('')).toBe(0)
      expect(parseCommaDecimal('   ')).toBe(0)
      expect(parseCommaDecimal('abc')).toBe(0)
      expect(parseCommaDecimal('10,5,5')).toBe(10.5) // Takes first valid part
    })

    it('should handle negative numbers', () => {
      expect(parseCommaDecimal('-10,5')).toBe(-10.5)
      expect(parseCommaDecimal('-5.25')).toBe(-5.25)
    })
  })

  describe('formatCommaDecimal', () => {
    it('should format number with comma as decimal separator', () => {
      expect(formatCommaDecimal(10.5)).toBe('10,5')
      expect(formatCommaDecimal(5.25, 2)).toBe('5,25')
      expect(formatCommaDecimal(100.0)).toBe('100,0')
    })

    it('should respect decimal places parameter', () => {
      expect(formatCommaDecimal(10.5, 1)).toBe('10,5')
      expect(formatCommaDecimal(10.5, 2)).toBe('10,50')
      expect(formatCommaDecimal(10.5, 0)).toBe('11') // Rounds up
    })

    it('should return empty string for 0 or NaN', () => {
      expect(formatCommaDecimal(0)).toBe('')
      expect(formatCommaDecimal(NaN)).toBe('')
    })

    it('should handle negative numbers', () => {
      expect(formatCommaDecimal(-10.5)).toBe('-10,5')
      expect(formatCommaDecimal(-5.25, 2)).toBe('-5,25')
    })
  })

  describe('isValidDecimalInput', () => {
    it('should validate numbers within range', () => {
      expect(isValidDecimalInput('50', 0, 100)).toBe(true)
      expect(isValidDecimalInput('10,5', 0, 100)).toBe(true)
      expect(isValidDecimalInput('99.9', 0, 100)).toBe(true)
    })

    it('should reject numbers outside range', () => {
      expect(isValidDecimalInput('101', 0, 100)).toBe(false)
      expect(isValidDecimalInput('-1', 0, 100)).toBe(false)
      expect(isValidDecimalInput('150', 0, 100)).toBe(false)
    })

    it('should reject empty or invalid input', () => {
      expect(isValidDecimalInput('', 0, 100)).toBe(false)
      expect(isValidDecimalInput('   ', 0, 100)).toBe(false)
      expect(isValidDecimalInput('abc', 0, 100)).toBe(false)
    })

    it('should accept boundary values', () => {
      expect(isValidDecimalInput('0', 0, 100)).toBe(true)
      expect(isValidDecimalInput('100', 0, 100)).toBe(true)
    })

    it('should work with custom min/max ranges', () => {
      expect(isValidDecimalInput('50', 40, 60)).toBe(true)
      expect(isValidDecimalInput('30', 40, 60)).toBe(false)
      expect(isValidDecimalInput('70', 40, 60)).toBe(false)
    })
  })
})

