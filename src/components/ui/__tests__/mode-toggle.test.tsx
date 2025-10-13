import { render, screen, fireEvent } from '@testing-library/react'
import { ModeToggle } from '../mode-toggle'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      {...props}
    >
      {children}
    </button>
  )
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Moon: ({ className }: any) => (
    <div data-testid="moon-icon" className={className}>Moon</div>
  ),
  Sun: ({ className }: any) => (
    <div data-testid="sun-icon" className={className}>Sun</div>
  )
}))

describe('ModeToggle Component', () => {
  const mockSetTheme = jest.fn()
  const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default theme mock
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      themes: ['light', 'dark'],
      systemTheme: 'light',
      resolvedTheme: 'light'
    })
  })

  describe('Rendering', () => {
    it('should render mode toggle button', () => {
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should render Sun icon', () => {
      render(<ModeToggle />)
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })

    it('should render Moon icon', () => {
      render(<ModeToggle />)
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })

    it('should render with outline variant', () => {
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('data-variant', 'outline')
    })

    it('should render with icon size', () => {
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('data-size', 'icon')
    })

    it('should render sr-only text for accessibility', () => {
      render(<ModeToggle />)
      
      expect(screen.getByText('Toggle theme')).toBeInTheDocument()
    })

    it('should have sr-only class on accessibility text', () => {
      const { container } = render(<ModeToggle />)
      
      const srText = container.querySelector('.sr-only')
      expect(srText).toBeInTheDocument()
      expect(srText).toHaveTextContent('Toggle theme')
    })
  })

  describe('Theme Switching', () => {
    it('should toggle from light to dark when clicked', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'light',
        resolvedTheme: 'light'
      })
      
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      fireEvent.click(button!)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should toggle from dark to light when clicked', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'dark',
        resolvedTheme: 'dark'
      })
      
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      fireEvent.click(button!)
      
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should call setTheme when button is clicked', () => {
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      fireEvent.click(button!)
      
      expect(mockSetTheme).toHaveBeenCalled()
    })

    it('should handle multiple clicks', () => {
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      
      fireEvent.click(button!)
      fireEvent.click(button!)
      fireEvent.click(button!)
      
      expect(mockSetTheme).toHaveBeenCalledTimes(3)
    })
  })

  describe('Icon Styling', () => {
    it('should apply correct classes to Sun icon', () => {
      render(<ModeToggle />)
      
      const sunIcon = screen.getByTestId('sun-icon')
      expect(sunIcon).toHaveClass(
        'h-[1.2rem]',
        'w-[1.2rem]',
        'rotate-0',
        'scale-100',
        'transition-all',
        'dark:-rotate-90',
        'dark:scale-0'
      )
    })

    it('should apply correct classes to Moon icon', () => {
      render(<ModeToggle />)
      
      const moonIcon = screen.getByTestId('moon-icon')
      expect(moonIcon).toHaveClass(
        'absolute',
        'h-[1.2rem]',
        'w-[1.2rem]',
        'rotate-90',
        'scale-0',
        'transition-all',
        'dark:rotate-0',
        'dark:scale-100'
      )
    })

    it('should have transition-all on both icons', () => {
      render(<ModeToggle />)
      
      const sunIcon = screen.getByTestId('sun-icon')
      const moonIcon = screen.getByTestId('moon-icon')
      
      expect(sunIcon).toHaveClass('transition-all')
      expect(moonIcon).toHaveClass('transition-all')
    })

    it('should have same size for both icons', () => {
      render(<ModeToggle />)
      
      const sunIcon = screen.getByTestId('sun-icon')
      const moonIcon = screen.getByTestId('moon-icon')
      
      expect(sunIcon).toHaveClass('h-[1.2rem]', 'w-[1.2rem]')
      expect(moonIcon).toHaveClass('h-[1.2rem]', 'w-[1.2rem]')
    })

    it('should position Moon icon absolutely', () => {
      render(<ModeToggle />)
      
      const moonIcon = screen.getByTestId('moon-icon')
      expect(moonIcon).toHaveClass('absolute')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      expect(button?.tagName).toBe('BUTTON')
    })

    it('should have screen reader text', () => {
      render(<ModeToggle />)
      
      const srText = screen.getByText('Toggle theme')
      expect(srText).toBeInTheDocument()
    })

    it('should hide theme text visually but keep for screen readers', () => {
      const { container } = render(<ModeToggle />)
      
      const srText = container.querySelector('.sr-only')
      expect(srText).toHaveClass('sr-only')
    })
  })

  describe('Edge Cases', () => {
    it('should render without errors', () => {
      expect(() => render(<ModeToggle />)).not.toThrow()
    })

    it('should handle undefined theme', () => {
      mockUseTheme.mockReturnValue({
        theme: undefined,
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'light',
        resolvedTheme: 'light'
      })
      
      const { container } = render(<ModeToggle />)
      const button = container.querySelector('button')
      
      fireEvent.click(button!)
      
      // When theme is undefined, it should toggle to 'light' (since undefined !== 'light')
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should handle system theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
        systemTheme: 'light',
        resolvedTheme: 'light'
      })
      
      const { container } = render(<ModeToggle />)
      const button = container.querySelector('button')
      
      fireEvent.click(button!)
      
      // When theme is 'system', it should toggle to 'light' (since 'system' !== 'light')
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should render both icons simultaneously', () => {
      render(<ModeToggle />)
      
      const sunIcon = screen.getByTestId('sun-icon')
      const moonIcon = screen.getByTestId('moon-icon')
      
      expect(sunIcon).toBeInTheDocument()
      expect(moonIcon).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should use Button component with correct props', () => {
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('data-variant', 'outline')
      expect(button).toHaveAttribute('data-size', 'icon')
    })

    it('should integrate with useTheme hook', () => {
      render(<ModeToggle />)
      
      expect(mockUseTheme).toHaveBeenCalled()
    })

    it('should call setTheme from useTheme hook', () => {
      const { container } = render(<ModeToggle />)
      
      const button = container.querySelector('button')
      fireEvent.click(button!)
      
      expect(mockSetTheme).toHaveBeenCalled()
    })
  })
})

