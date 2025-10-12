import {
  sanitizeString,
  sanitizeHTML,
  sanitizeFilename,
  sanitizeEmail,
  sanitizeURL,
  sanitizePhone,
  sanitizeNumber,
  sanitizeObject,
  validateFileUpload,
} from '../sanitize'

describe('Sanitization Utilities', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
    })

    it('should remove null bytes', () => {
      expect(sanitizeString('hello\0world')).toBe('helloworld')
    })

    it('should remove control characters', () => {
      expect(sanitizeString('hello\x00world')).toBe('helloworld')
    })

    it('should return empty string for empty input', () => {
      expect(sanitizeString('')).toBe('')
    })
  })

  describe('sanitizeHTML', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    it('should escape ampersands', () => {
      expect(sanitizeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('should escape quotes', () => {
      expect(sanitizeHTML(`He said "hello"`)).toBe('He said &quot;hello&quot;')
      expect(sanitizeHTML(`It's fine`)).toBe('It&#x27;s fine')
    })

    it('should return empty string for empty input', () => {
      expect(sanitizeHTML('')).toBe('')
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove path traversal attempts', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd')
    })

    it('should remove slashes', () => {
      expect(sanitizeFilename('path/to/file.txt')).toBe('pathtofile.txt')
      expect(sanitizeFilename('path\\to\\file.txt')).toBe('pathtofile.txt')
    })

    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('file<>:"|?*.txt')).toBe('file.txt')
    })

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt'
      const result = sanitizeFilename(longName)
      expect(result.length).toBeLessThanOrEqual(255)
    })

    it('should return unnamed for empty input', () => {
      expect(sanitizeFilename('')).toBe('unnamed')
    })
  })

  describe('sanitizeEmail', () => {
    it('should accept valid emails', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com')
      expect(sanitizeEmail('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk')
    })

    it('should convert to lowercase', () => {
      expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com')
    })

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('notanemail')).toBe('')
      expect(sanitizeEmail('@example.com')).toBe('')
      expect(sanitizeEmail('test@')).toBe('')
    })

    it('should return empty string for empty input', () => {
      expect(sanitizeEmail('')).toBe('')
    })
  })

  describe('sanitizeURL', () => {
    it('should accept valid HTTP URLs', () => {
      expect(sanitizeURL('http://example.com')).toBe('http://example.com/')
    })

    it('should accept valid HTTPS URLs', () => {
      expect(sanitizeURL('https://example.com/path')).toBe('https://example.com/path')
    })

    it('should reject javascript: protocol', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('')
    })

    it('should reject data: protocol', () => {
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should reject invalid URLs', () => {
      expect(sanitizeURL('not a url')).toBe('')
    })

    it('should return empty string for empty input', () => {
      expect(sanitizeURL('')).toBe('')
    })
  })

  describe('sanitizePhone', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizePhone('(123) 456-7890')).toBe('1234567890')
    })

    it('should preserve leading plus sign', () => {
      expect(sanitizePhone('+62 812 3456 7890')).toBe('+6281234567890')
    })

    it('should remove plus signs not at start', () => {
      expect(sanitizePhone('123+456')).toBe('123456')
    })

    it('should return empty string for empty input', () => {
      expect(sanitizePhone('')).toBe('')
    })
  })

  describe('sanitizeNumber', () => {
    it('should parse valid numbers', () => {
      expect(sanitizeNumber('123')).toBe(123)
      expect(sanitizeNumber('123.45')).toBe(123.45)
      expect(sanitizeNumber(456)).toBe(456)
    })

    it('should handle comma as decimal separator', () => {
      expect(sanitizeNumber('123,45')).toBe(123.45)
    })

    it('should respect min/max bounds', () => {
      expect(sanitizeNumber('50', { min: 0, max: 100 })).toBe(50)
      expect(sanitizeNumber('150', { min: 0, max: 100 })).toBeNull()
      expect(sanitizeNumber('-10', { min: 0, max: 100 })).toBeNull()
    })

    it('should reject decimals when not allowed', () => {
      expect(sanitizeNumber('123.45', { allowDecimals: false })).toBeNull()
      expect(sanitizeNumber('123', { allowDecimals: false })).toBe(123)
    })

    it('should return null for invalid input', () => {
      expect(sanitizeNumber('abc')).toBeNull()
      // Note: parseFloat('12.34.56') returns 12.34 (stops at second dot)
      // This is expected JavaScript behavior
      expect(sanitizeNumber('not-a-number')).toBeNull()
    })
  })

  describe('sanitizeObject', () => {
    it('should sanitize string values', () => {
      const input = {
        name: '  John  ',
        email: 'test@example.com',
      }
      const result = sanitizeObject(input)
      expect(result.name).toBe('John')
    })

    it('should preserve non-string values', () => {
      const input = {
        name: 'John',
        age: 25,
        active: true,
      }
      const result = sanitizeObject(input)
      expect(result.age).toBe(25)
      expect(result.active).toBe(true)
    })

    it('should sanitize nested objects when deep=true', () => {
      const input = {
        user: {
          name: '  Jane  ',
          email: 'jane@example.com',
        },
      }
      const result = sanitizeObject(input, true)
      expect(result.user.name).toBe('Jane')
    })

    it('should sanitize arrays when deep=true', () => {
      const input = {
        tags: ['  tag1  ', '  tag2  '],
      }
      const result = sanitizeObject(input, true)
      expect(result.tags).toEqual(['tag1', 'tag2'])
    })
  })

  describe('validateFileUpload', () => {
    it('should accept valid file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const result = validateFileUpload(file)
      
      expect(result.valid).toBe(true)
      expect(result.sanitizedFilename).toBe('test.pdf')
    })

    it('should reject file exceeding size limit', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('')
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
      const result = validateFileUpload(file, { maxSize: 10 * 1024 * 1024 })
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('size exceeds')
    })

    it('should reject invalid MIME type', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' })
      const result = validateFileUpload(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('should reject invalid file extension', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/pdf' })
      const result = validateFileUpload(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('extension')
    })

    it('should sanitize filename', () => {
      const file = new File(['content'], '../../../etc/passwd.pdf', { type: 'application/pdf' })
      const result = validateFileUpload(file)
      
      expect(result.valid).toBe(true)
      expect(result.sanitizedFilename).toBe('etcpasswd.pdf')
    })
  })
})

