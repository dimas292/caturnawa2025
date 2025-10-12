/**
 * Rate limiting utility for API routes
 * Implements in-memory rate limiting with configurable limits
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitStore>()

/**
 * Rate limiter function
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining requests
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const now = Date.now()
  const tokenCount = rateLimitStore.get(identifier)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    const expiredKeys: string[] = []
    rateLimitStore.forEach((value, key) => {
      if (now > value.resetTime) {
        expiredKeys.push(key)
      }
    })
    expiredKeys.forEach(key => rateLimitStore.delete(key))
  }

  if (!tokenCount || now > tokenCount.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    })
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: now + config.interval,
    }
  }

  if (tokenCount.count >= config.uniqueTokenPerInterval) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: tokenCount.resetTime,
    }
  }

  // Increment count
  tokenCount.count++
  rateLimitStore.set(identifier, tokenCount)

  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - tokenCount.count,
    reset: tokenCount.resetTime,
  }
}

/**
 * Get client identifier from request
 * Uses IP address or forwarded IP
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Strict limit for authentication endpoints
  auth: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5, // 5 attempts per minute
  },
  // Moderate limit for API endpoints
  api: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30, // 30 requests per minute
  },
  // Lenient limit for file uploads
  upload: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 uploads per minute
  },
  // Very strict for admin operations
  admin: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 20, // 20 requests per minute
  },
}

