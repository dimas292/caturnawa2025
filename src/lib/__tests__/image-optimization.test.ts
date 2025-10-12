import {
  generateSrcSet,
  generateSizes,
  imageLoader,
  getBlurDataURL,
  supportsTransparency,
  getOptimalFormat,
  getAspectRatio,
  ImageSizes,
  ImageQuality,
  AspectRatios,
} from '../image-optimization'

describe('Image Optimization', () => {
  describe('generateSrcSet', () => {
    it('should generate srcset with default widths', () => {
      const srcset = generateSrcSet('/image.jpg')
      expect(srcset).toContain('/image.jpg?w=640 640w')
      expect(srcset).toContain('/image.jpg?w=750 750w')
      expect(srcset).toContain('/image.jpg?w=1200 1200w')
    })

    it('should generate srcset with custom widths', () => {
      const srcset = generateSrcSet('/image.jpg', [400, 800])
      expect(srcset).toBe('/image.jpg?w=400 400w, /image.jpg?w=800 800w')
    })
  })

  describe('generateSizes', () => {
    it('should generate sizes with default breakpoints', () => {
      const sizes = generateSizes()
      expect(sizes).toContain('(max-width: 640px) 100vw')
      expect(sizes).toContain('(max-width: 1024px) 50vw')
      expect(sizes).toContain('33vw')
    })

    it('should generate sizes with custom breakpoints', () => {
      const sizes = generateSizes({
        '(max-width: 768px)': '100vw',
        default: '50vw',
      })
      expect(sizes).toBe('(max-width: 768px) 100vw, 50vw')
    })
  })

  describe('imageLoader', () => {
    it('should generate image URL with width', () => {
      const url = imageLoader({ src: '/image.jpg', width: 800 })
      expect(url).toBe('/image.jpg?w=800')
    })

    it('should generate image URL with width and quality', () => {
      const url = imageLoader({ src: '/image.jpg', width: 800, quality: 90 })
      expect(url).toBe('/image.jpg?w=800&q=90')
    })

    it('should handle URLs with existing query params', () => {
      const url = imageLoader({ src: '/image.jpg', width: 800 })
      expect(url).toContain('w=800')
    })
  })

  describe('getBlurDataURL', () => {
    it('should generate blur data URL with default dimensions', () => {
      const dataURL = getBlurDataURL()
      expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/)
    })

    it('should generate blur data URL with custom dimensions', () => {
      const dataURL = getBlurDataURL(20, 20)
      expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/)
      
      // Decode and check dimensions
      const base64 = dataURL.split(',')[1]
      const svg = Buffer.from(base64, 'base64').toString()
      expect(svg).toContain('width="20"')
      expect(svg).toContain('height="20"')
    })
  })

  describe('supportsTransparency', () => {
    it('should return true for PNG', () => {
      expect(supportsTransparency('png')).toBe(true)
      expect(supportsTransparency('PNG')).toBe(true)
    })

    it('should return true for WebP', () => {
      expect(supportsTransparency('webp')).toBe(true)
      expect(supportsTransparency('WEBP')).toBe(true)
    })

    it('should return true for GIF', () => {
      expect(supportsTransparency('gif')).toBe(true)
    })

    it('should return false for JPEG', () => {
      expect(supportsTransparency('jpeg')).toBe(false)
      expect(supportsTransparency('jpg')).toBe(false)
    })
  })

  describe('getOptimalFormat', () => {
    it('should return webp for Chrome', () => {
      const format = getOptimalFormat('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(format).toBe('webp')
    })

    it('should return webp for Firefox', () => {
      const format = getOptimalFormat('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
      expect(format).toBe('webp')
    })

    it('should return webp for Edge', () => {
      const format = getOptimalFormat('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59')
      expect(format).toBe('webp')
    })

    it('should return webp for Opera', () => {
      const format = getOptimalFormat('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.203')
      expect(format).toBe('webp')
    })

    it('should return webp when no user agent provided', () => {
      const format = getOptimalFormat()
      expect(format).toBe('webp')
    })

    it('should return jpeg for unsupported browsers', () => {
      const format = getOptimalFormat('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)')
      expect(format).toBe('jpeg')
    })
  })

  describe('getAspectRatio', () => {
    it('should calculate aspect ratio for 16:9', () => {
      const ratio = getAspectRatio(1920, 1080)
      expect(ratio).toBeCloseTo(56.25, 2)
    })

    it('should calculate aspect ratio for 4:3', () => {
      const ratio = getAspectRatio(800, 600)
      expect(ratio).toBe(75)
    })

    it('should calculate aspect ratio for square', () => {
      const ratio = getAspectRatio(500, 500)
      expect(ratio).toBe(100)
    })
  })

  describe('ImageSizes', () => {
    it('should have avatar sizes', () => {
      expect(ImageSizes.avatar.small).toBe(32)
      expect(ImageSizes.avatar.medium).toBe(64)
      expect(ImageSizes.avatar.large).toBe(128)
    })

    it('should have thumbnail sizes', () => {
      expect(ImageSizes.thumbnail.small).toBe(150)
      expect(ImageSizes.thumbnail.medium).toBe(300)
      expect(ImageSizes.thumbnail.large).toBe(600)
    })

    it('should have card sizes', () => {
      expect(ImageSizes.card.small).toBe(400)
      expect(ImageSizes.card.medium).toBe(800)
      expect(ImageSizes.card.large).toBe(1200)
    })

    it('should have hero sizes', () => {
      expect(ImageSizes.hero.small).toBe(800)
      expect(ImageSizes.hero.medium).toBe(1200)
      expect(ImageSizes.hero.large).toBe(1920)
    })
  })

  describe('ImageQuality', () => {
    it('should have quality presets', () => {
      expect(ImageQuality.low).toBe(50)
      expect(ImageQuality.medium).toBe(75)
      expect(ImageQuality.high).toBe(90)
      expect(ImageQuality.max).toBe(100)
    })
  })

  describe('AspectRatios', () => {
    it('should have common aspect ratios', () => {
      expect(AspectRatios.square).toBe(1)
      expect(AspectRatios.landscape).toBeCloseTo(16/9, 2)
      expect(AspectRatios.portrait).toBeCloseTo(9/16, 2)
      expect(AspectRatios.wide).toBeCloseTo(21/9, 2)
      expect(AspectRatios.photo).toBeCloseTo(4/3, 2)
    })
  })
})

