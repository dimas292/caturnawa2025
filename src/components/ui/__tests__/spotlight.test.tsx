import { render } from '@testing-library/react'
import { Spotlight } from '../spotlight'

describe('Spotlight Component', () => {
  describe('Rendering', () => {
    it('should render spotlight SVG element', () => {
      const { container } = render(<Spotlight />)
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render with correct SVG attributes', () => {
      const { container } = render(<Spotlight />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 3787 2842')
      expect(svg).toHaveAttribute('fill', 'none')
    })

    it('should render ellipse element', () => {
      const { container } = render(<Spotlight />)
      
      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toBeInTheDocument()
    })

    it('should render filter definition', () => {
      const { container } = render(<Spotlight />)
      
      const filter = container.querySelector('filter')
      expect(filter).toBeInTheDocument()
      expect(filter).toHaveAttribute('id', 'filter')
    })

    it('should render defs element', () => {
      const { container } = render(<Spotlight />)
      
      const defs = container.querySelector('defs')
      expect(defs).toBeInTheDocument()
    })
  })

  describe('Styling and Classes', () => {
    it('should apply default classes', () => {
      const { container } = render(<Spotlight />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('animate-spotlight')
      expect(svg).toHaveClass('pointer-events-none')
      expect(svg).toHaveClass('absolute')
      expect(svg).toHaveClass('z-[1]')
      expect(svg).toHaveClass('opacity-0')
    })

    it('should apply responsive width classes', () => {
      const { container } = render(<Spotlight />)

      const svg = container.querySelector('svg')
      const classString = svg?.getAttribute('class') || ''
      expect(classString).toContain('w-[138%]')
      expect(classString).toContain('lg:w-[84%]')
    })

    it('should apply height class', () => {
      const { container } = render(<Spotlight />)

      const svg = container.querySelector('svg')
      const classString = svg?.getAttribute('class') || ''
      expect(classString).toContain('h-[169%]')
    })

    it('should accept custom className', () => {
      const { container } = render(<Spotlight className="custom-spotlight" />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('custom-spotlight')
    })

    it('should merge custom className with default classes', () => {
      const { container } = render(<Spotlight className="custom-class" />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('custom-class')
      expect(svg).toHaveClass('animate-spotlight')
      expect(svg).toHaveClass('absolute')
    })
  })

  describe('Fill Prop', () => {
    it('should use white as default fill color', () => {
      const { container } = render(<Spotlight />)
      
      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toHaveAttribute('fill', 'white')
    })

    it('should accept custom fill color', () => {
      const { container } = render(<Spotlight fill="blue" />)
      
      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toHaveAttribute('fill', 'blue')
    })

    it('should accept hex color as fill', () => {
      const { container } = render(<Spotlight fill="#FF5733" />)
      
      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toHaveAttribute('fill', '#FF5733')
    })

    it('should accept RGB color as fill', () => {
      const { container } = render(<Spotlight fill="rgb(255, 87, 51)" />)
      
      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toHaveAttribute('fill', 'rgb(255, 87, 51)')
    })

    it('should have correct fill opacity', () => {
      const { container } = render(<Spotlight />)

      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toHaveAttribute('fill-opacity', '0.21')
    })
  })

  describe('SVG Structure', () => {
    it('should have correct ellipse transform', () => {
      const { container } = render(<Spotlight />)
      
      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toHaveAttribute('transform', 'matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)')
    })

    it('should have correct ellipse dimensions', () => {
      const { container } = render(<Spotlight />)
      
      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toHaveAttribute('cx', '1924.71')
      expect(ellipse).toHaveAttribute('cy', '273.501')
      expect(ellipse).toHaveAttribute('rx', '1924.71')
      expect(ellipse).toHaveAttribute('ry', '273.501')
    })

    it('should have filter with correct attributes', () => {
      const { container } = render(<Spotlight />)

      const filter = container.querySelector('filter')
      expect(filter).toHaveAttribute('x', '0.860352')
      expect(filter).toHaveAttribute('y', '0.838989')
      expect(filter).toHaveAttribute('width', '3785.16')
      expect(filter).toHaveAttribute('height', '2840.26')
      expect(filter).toHaveAttribute('filterUnits', 'userSpaceOnUse')
      expect(filter).toHaveAttribute('color-interpolation-filters', 'sRGB')
    })

    it('should have feGaussianBlur with correct stdDeviation', () => {
      const { container } = render(<Spotlight />)

      const blur = container.querySelector('feGaussianBlur')
      expect(blur).toBeInTheDocument()
      expect(blur).toHaveAttribute('stdDeviation', '151')
      expect(blur).toHaveAttribute('result', 'effect1_foregroundBlur_1065_8')
    })

    it('should have feBlend element', () => {
      const { container } = render(<Spotlight />)
      
      const blend = container.querySelector('feBlend')
      expect(blend).toBeInTheDocument()
      expect(blend).toHaveAttribute('mode', 'normal')
    })

    it('should have feFlood element', () => {
      const { container } = render(<Spotlight />)

      const flood = container.querySelector('feFlood')
      expect(flood).toBeInTheDocument()
      expect(flood).toHaveAttribute('flood-opacity', '0')
      expect(flood).toHaveAttribute('result', 'BackgroundImageFix')
    })
  })

  describe('Edge Cases', () => {
    it('should render without props', () => {
      expect(() => render(<Spotlight />)).not.toThrow()
    })

    it('should handle empty string as fill', () => {
      const { container } = render(<Spotlight fill="" />)
      
      const ellipse = container.querySelector('ellipse')
      expect(ellipse).toHaveAttribute('fill', 'white')
    })

    it('should handle empty string as className', () => {
      const { container } = render(<Spotlight className="" />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('animate-spotlight')
    })

    it('should handle multiple custom classes', () => {
      const { container } = render(<Spotlight className="class1 class2 class3" />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('class1')
      expect(svg).toHaveClass('class2')
      expect(svg).toHaveClass('class3')
    })
  })

  describe('Accessibility', () => {
    it('should have pointer-events-none for accessibility', () => {
      const { container } = render(<Spotlight />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('pointer-events-none')
    })

    it('should be positioned absolutely', () => {
      const { container } = render(<Spotlight />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('absolute')
    })

    it('should have correct z-index', () => {
      const { container } = render(<Spotlight />)
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('z-[1]')
    })
  })
})

