import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingPage, LoadingCard } from '../loading'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img 
      src={typeof src === 'string' ? src : src.src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
      data-testid="next-image"
    />
  )
}))

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    describe('Rendering', () => {
      it('should render loading spinner', () => {
        const { container } = render(<LoadingSpinner />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
      })

      it('should have rounded-full class', () => {
        const { container } = render(<LoadingSpinner />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('rounded-full')
      })

      it('should have border classes', () => {
        const { container } = render(<LoadingSpinner />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('border-2')
      })
    })

    describe('Sizes', () => {
      it('should render with default medium size', () => {
        const { container } = render(<LoadingSpinner />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('h-8', 'w-8')
      })

      it('should render with small size', () => {
        const { container } = render(<LoadingSpinner size="sm" />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('h-4', 'w-4')
      })

      it('should render with medium size', () => {
        const { container } = render(<LoadingSpinner size="md" />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('h-8', 'w-8')
      })

      it('should render with large size', () => {
        const { container } = render(<LoadingSpinner size="lg" />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('h-12', 'w-12')
      })
    })

    describe('Custom Styling', () => {
      it('should accept custom className', () => {
        const { container } = render(<LoadingSpinner className="custom-spinner" />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('custom-spinner')
      })

      it('should merge custom className with default classes', () => {
        const { container } = render(<LoadingSpinner className="custom-class" />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('custom-class')
        expect(spinner).toHaveClass('animate-spin')
        expect(spinner).toHaveClass('rounded-full')
      })

      it('should apply dark mode border classes', () => {
        const { container } = render(<LoadingSpinner />)
        
        const spinner = container.querySelector('.animate-spin')
        const classString = spinner?.getAttribute('class') || ''
        expect(classString).toContain('dark:border-gray-600')
        expect(classString).toContain('dark:border-t-white')
      })

      it('should apply light mode border classes', () => {
        const { container } = render(<LoadingSpinner />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('border-gray-300', 'border-t-black')
      })
    })

    describe('Edge Cases', () => {
      it('should render without errors', () => {
        expect(() => render(<LoadingSpinner />)).not.toThrow()
      })

      it('should render without props', () => {
        expect(() => render(<LoadingSpinner />)).not.toThrow()
      })

      it('should handle empty className', () => {
        const { container } = render(<LoadingSpinner className="" />)
        
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
      })
    })
  })

  describe('LoadingPage', () => {
    describe('Rendering', () => {
      it('should render loading page', () => {
        const { container } = render(<LoadingPage />)
        
        const page = container.querySelector('.min-h-screen')
        expect(page).toBeInTheDocument()
      })

      it('should render UNAS FEST logo', () => {
        render(<LoadingPage />)
        
        const image = screen.getByTestId('next-image')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('alt', 'UNAS FEST 2025')
      })

      it('should render loading text', () => {
        render(<LoadingPage />)
        
        expect(screen.getByText('Loading....')).toBeInTheDocument()
      })

      it('should have correct image dimensions', () => {
        render(<LoadingPage />)
        
        const image = screen.getByTestId('next-image')
        expect(image).toHaveAttribute('width', '380')
        expect(image).toHaveAttribute('height', '380')
      })
    })

    describe('Styling', () => {
      it('should have full screen height', () => {
        const { container } = render(<LoadingPage />)
        
        const page = container.querySelector('.min-h-screen')
        expect(page).toHaveClass('min-h-screen')
      })

      it('should center content', () => {
        const { container } = render(<LoadingPage />)
        
        const page = container.querySelector('.min-h-screen')
        expect(page).toHaveClass('flex', 'items-center', 'justify-center')
      })

      it('should have background colors for light and dark mode', () => {
        const { container } = render(<LoadingPage />)
        
        const page = container.querySelector('.min-h-screen')
        expect(page).toHaveClass('bg-white')
        const classString = page?.getAttribute('class') || ''
        expect(classString).toContain('dark:bg-black')
      })

      it('should center text', () => {
        const { container } = render(<LoadingPage />)
        
        const textContainer = container.querySelector('.text-center')
        expect(textContainer).toBeInTheDocument()
      })

      it('should have correct text styling', () => {
        render(<LoadingPage />)
        
        const text = screen.getByText('Loading....')
        expect(text).toHaveClass('text-2xl')
        expect(text).toHaveClass('text-gray-600')
        const classString = text.getAttribute('class') || ''
        expect(classString).toContain('dark:text-gray-300')
      })

      it('should center image horizontally', () => {
        render(<LoadingPage />)
        
        const image = screen.getByTestId('next-image')
        expect(image).toHaveClass('mx-auto')
      })
    })

    describe('Edge Cases', () => {
      it('should render without errors', () => {
        expect(() => render(<LoadingPage />)).not.toThrow()
      })
    })
  })

  describe('LoadingCard', () => {
    describe('Rendering', () => {
      it('should render loading card', () => {
        const { container } = render(<LoadingCard />)
        
        const card = container.querySelector('.animate-pulse')
        expect(card).toBeInTheDocument()
      })

      it('should render card placeholder', () => {
        const { container } = render(<LoadingCard />)
        
        const cardPlaceholder = container.querySelector('.rounded-lg')
        expect(cardPlaceholder).toBeInTheDocument()
      })

      it('should render text placeholders', () => {
        const { container } = render(<LoadingCard />)
        
        const textPlaceholders = container.querySelectorAll('.space-y-3 > div')
        expect(textPlaceholders.length).toBeGreaterThan(0)
      })
    })

    describe('Styling', () => {
      it('should have pulse animation', () => {
        const { container } = render(<LoadingCard />)
        
        const card = container.querySelector('.animate-pulse')
        expect(card).toHaveClass('animate-pulse')
      })

      it('should have correct card placeholder height', () => {
        const { container } = render(<LoadingCard />)
        
        const cardPlaceholder = container.querySelector('.rounded-lg')
        expect(cardPlaceholder).toHaveClass('h-32')
      })

      it('should have rounded corners on card placeholder', () => {
        const { container } = render(<LoadingCard />)
        
        const cardPlaceholder = container.querySelector('.rounded-lg')
        expect(cardPlaceholder).toHaveClass('rounded-lg')
      })

      it('should have background colors for light and dark mode', () => {
        const { container } = render(<LoadingCard />)
        
        const cardPlaceholder = container.querySelector('.rounded-lg')
        expect(cardPlaceholder).toHaveClass('bg-gray-200')
        const classString = cardPlaceholder?.getAttribute('class') || ''
        expect(classString).toContain('dark:bg-gray-700')
      })

      it('should have spacing between text placeholders', () => {
        const { container } = render(<LoadingCard />)
        
        const textContainer = container.querySelector('.space-y-3')
        expect(textContainer).toHaveClass('space-y-3')
      })

      it('should have different widths for text placeholders', () => {
        const { container } = render(<LoadingCard />)
        
        const textPlaceholders = container.querySelectorAll('.space-y-3 > div')
        const firstPlaceholder = textPlaceholders[0]
        const secondPlaceholder = textPlaceholders[1]
        
        expect(firstPlaceholder).toHaveClass('w-3/4')
        expect(secondPlaceholder).toHaveClass('w-1/2')
      })

      it('should have margin bottom on card placeholder', () => {
        const { container } = render(<LoadingCard />)
        
        const cardPlaceholder = container.querySelector('.rounded-lg')
        expect(cardPlaceholder).toHaveClass('mb-4')
      })
    })

    describe('Edge Cases', () => {
      it('should render without errors', () => {
        expect(() => render(<LoadingCard />)).not.toThrow()
      })
    })
  })
})

