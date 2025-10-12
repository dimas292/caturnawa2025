/**
 * Image optimization utilities
 * Provides helpers for optimizing images in Next.js
 */

/**
 * Generate srcset for responsive images
 * @param src - Image source URL
 * @param widths - Array of widths to generate
 * @returns srcset string
 */
export function generateSrcSet(src: string, widths: number[] = [640, 750, 828, 1080, 1200]): string {
  return widths
    .map(width => `${src}?w=${width} ${width}w`)
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints - Object mapping breakpoints to sizes
 * @returns sizes string
 */
export function generateSizes(breakpoints: Record<string, string> = {
  '(max-width: 640px)': '100vw',
  '(max-width: 1024px)': '50vw',
  default: '33vw',
}): string {
  const entries = Object.entries(breakpoints)
  const mediaQueries = entries
    .filter(([key]) => key !== 'default')
    .map(([query, size]) => `${query} ${size}`)
  
  const defaultSize = breakpoints.default || '100vw'
  
  return [...mediaQueries, defaultSize].join(', ')
}

/**
 * Image loader configuration for Next.js Image component
 */
export const imageLoader = ({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}) => {
  const params = new URLSearchParams()
  params.set('w', width.toString())
  if (quality) {
    params.set('q', quality.toString())
  }
  return `${src}?${params.toString()}`
}

/**
 * Blur data URL for placeholder
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @returns Base64 encoded blur placeholder
 */
export function getBlurDataURL(width: number = 10, height: number = 10): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#e5e7eb"/>
    </svg>
  `
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * Recommended image sizes for different use cases
 */
export const ImageSizes = {
  avatar: {
    small: 32,
    medium: 64,
    large: 128,
  },
  thumbnail: {
    small: 150,
    medium: 300,
    large: 600,
  },
  card: {
    small: 400,
    medium: 800,
    large: 1200,
  },
  hero: {
    small: 800,
    medium: 1200,
    large: 1920,
  },
}

/**
 * Image quality presets
 */
export const ImageQuality = {
  low: 50,
  medium: 75,
  high: 90,
  max: 100,
}

/**
 * Check if image format supports transparency
 * @param format - Image format
 * @returns true if format supports transparency
 */
export function supportsTransparency(format: string): boolean {
  return ['png', 'webp', 'gif'].includes(format.toLowerCase())
}

/**
 * Get optimal image format based on browser support
 * @param userAgent - User agent string
 * @returns Optimal image format
 */
export function getOptimalFormat(userAgent?: string): 'webp' | 'jpeg' {
  if (!userAgent) return 'webp'
  
  // Check for WebP support
  const supportsWebP = /Chrome|Edge|Firefox|Opera/.test(userAgent)
  return supportsWebP ? 'webp' : 'jpeg'
}

/**
 * Calculate aspect ratio
 * @param width - Image width
 * @param height - Image height
 * @returns Aspect ratio as percentage
 */
export function getAspectRatio(width: number, height: number): number {
  return (height / width) * 100
}

/**
 * Common aspect ratios
 */
export const AspectRatios = {
  square: 1,        // 1:1
  landscape: 16/9,  // 16:9
  portrait: 9/16,   // 9:16
  wide: 21/9,       // 21:9
  photo: 4/3,       // 4:3
}

