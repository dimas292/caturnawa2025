/**
 * Input sanitization utilities
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * @param input - Raw string input
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Sanitize HTML by escaping dangerous characters
 * @param input - Raw HTML string
 * @returns Escaped HTML string
 */
export function sanitizeHTML(input: string): string {
  if (!input) return ''
  
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * Sanitize filename by removing path traversal attempts and dangerous characters
 * @param filename - Raw filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed'
  
  return filename
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove potentially dangerous characters
    .replace(/[<>:"|?*]/g, '')
    // Limit length
    .slice(0, 255)
    .trim() || 'unnamed'
}

/**
 * Sanitize email address
 * @param email - Raw email input
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  
  const sanitized = email.trim().toLowerCase()
  
  // Basic email validation regex
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize URL by validating protocol and structure
 * @param url - Raw URL input
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url) return ''
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    
    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Sanitize phone number by removing non-numeric characters
 * @param phone - Raw phone input
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-numeric characters except + at the start
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
}

/**
 * Sanitize numeric input
 * @param input - Raw numeric input
 * @param options - Validation options
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(
  input: string | number,
  options: {
    min?: number
    max?: number
    allowDecimals?: boolean
  } = {}
): number | null {
  const { min, max, allowDecimals = true } = options
  
  let num: number
  
  if (typeof input === 'string') {
    // Replace comma with dot for decimal separator
    const normalized = input.replace(',', '.')
    num = parseFloat(normalized)
  } else {
    num = input
  }
  
  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    return null
  }
  
  // Check if decimals are allowed
  if (!allowDecimals && num % 1 !== 0) {
    return null
  }
  
  // Check min/max bounds
  if (min !== undefined && num < min) {
    return null
  }
  
  if (max !== undefined && num > max) {
    return null
  }
  
  return num
}

/**
 * Sanitize object by applying sanitization to all string values
 * @param obj - Object to sanitize
 * @param deep - Whether to sanitize nested objects
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  deep: boolean = false
): T {
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (deep && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value, deep)
    } else if (deep && Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item, deep) :
        item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
}

/**
 * Validate and sanitize file upload
 * @param file - File object
 * @param options - Validation options
 * @returns Validation result
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): {
  valid: boolean
  error?: string
  sanitizedFilename?: string
} {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'],
  } = options
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    }
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    }
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`,
    }
  }
  
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name)
  
  return {
    valid: true,
    sanitizedFilename,
  }
}

