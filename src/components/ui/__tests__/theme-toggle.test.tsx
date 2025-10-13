import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Moon: ({ className, strokeWidth }: any) => (
    <div data-testid="moon-icon" className={className} data-stroke-width={strokeWidth}>Moon</div>
  ),
  Sun: ({ className, strokeWidth }: any) => (
    <div data-testid="sun-icon" className={className} data-stroke-width={strokeWidth}>Sun</div>
  ),
  ArrowUp: ({ className }: any) => (
    <div data-testid="arrow-up-icon" className={className}>ArrowUp</div>
  )
}))

describe('ThemeToggle Component', () => {
  const mockSetTheme = jest.fn()
  const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window.scroll
    window.scroll = jest.fn()
    
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
    it('should render theme toggle component', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByLabelText('Switch to light theme')).toBeInTheDocument()
      expect(screen.getByLabelText('Switch to dark theme')).toBeInTheDocument()
      expect(screen.getByLabelText('Scroll to top')).toBeInTheDocument()
    })

    it('should render Sun icon', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })

    it('should render Moon icon', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })

    it('should render ArrowUp icon', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()
    })

    it('should render three buttons', () => {
      const { container } = render(<ThemeToggle />)
      
      const buttons = container.querySelectorAll('button')
      expect(buttons).toHaveLength(3)
    })

    it('should render with correct structure', () => {
      const { container } = render(<ThemeToggle />)
      
      const wrapper = container.querySelector('.flex.items-center.justify-center')
      expect(wrapper).toBeInTheDocument()
      
      const buttonContainer = container.querySelector('.rounded-full.border.border-dotted')
      expect(buttonContainer).toBeInTheDocument()
    })
  })

  describe('Theme Switching', () => {
    it('should call setTheme with "light" when light button is clicked', () => {
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      fireEvent.click(lightButton)
      
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should call setTheme with "dark" when dark button is clicked', () => {
      render(<ThemeToggle />)
      
      const darkButton = screen.getByLabelText('Switch to dark theme')
      fireEvent.click(darkButton)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should highlight light button when theme is light', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'light',
        resolvedTheme: 'light'
      })
      
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      expect(lightButton).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('should highlight dark button when theme is dark', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'dark',
        resolvedTheme: 'dark'
      })
      
      render(<ThemeToggle />)
      
      const darkButton = screen.getByLabelText('Switch to dark theme')
      expect(darkButton).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('should not highlight light button when theme is dark', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'dark',
        resolvedTheme: 'dark'
      })
      
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      expect(lightButton).not.toHaveClass('bg-primary')
      expect(lightButton).toHaveClass('hover:bg-muted')
    })

    it('should not highlight dark button when theme is light', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'light',
        resolvedTheme: 'light'
      })
      
      render(<ThemeToggle />)
      
      const darkButton = screen.getByLabelText('Switch to dark theme')
      expect(darkButton).not.toHaveClass('bg-primary')
      expect(darkButton).toHaveClass('hover:bg-muted')
    })
  })

  describe('Scroll to Top', () => {
    it('should call window.scroll when scroll button is clicked', () => {
      render(<ThemeToggle />)
      
      const scrollButton = screen.getByLabelText('Scroll to top')
      fireEvent.click(scrollButton)
      
      expect(window.scroll).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      })
    })

    it('should have correct button type for scroll button', () => {
      render(<ThemeToggle />)
      
      const scrollButton = screen.getByLabelText('Scroll to top')
      expect(scrollButton).toHaveAttribute('type', 'button')
    })

    it('should have hover styles on scroll button', () => {
      render(<ThemeToggle />)
      
      const scrollButton = screen.getByLabelText('Scroll to top')
      expect(scrollButton).toHaveClass('hover:bg-muted')
    })
  })

  describe('Styling', () => {
    it('should apply transition classes to theme buttons', () => {
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      const darkButton = screen.getByLabelText('Switch to dark theme')
      
      expect(lightButton).toHaveClass('transition-colors')
      expect(darkButton).toHaveClass('transition-colors')
    })

    it('should apply rounded-full class to buttons', () => {
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      const darkButton = screen.getByLabelText('Switch to dark theme')
      const scrollButton = screen.getByLabelText('Scroll to top')
      
      expect(lightButton).toHaveClass('rounded-full')
      expect(darkButton).toHaveClass('rounded-full')
      expect(scrollButton).toHaveClass('rounded-full')
    })

    it('should apply padding to buttons', () => {
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      const darkButton = screen.getByLabelText('Switch to dark theme')
      const scrollButton = screen.getByLabelText('Scroll to top')
      
      expect(lightButton).toHaveClass('p-2')
      expect(darkButton).toHaveClass('p-2')
      expect(scrollButton).toHaveClass('p-2')
    })

    it('should have correct icon sizes', () => {
      render(<ThemeToggle />)
      
      const sunIcon = screen.getByTestId('sun-icon')
      const moonIcon = screen.getByTestId('moon-icon')
      const arrowIcon = screen.getByTestId('arrow-up-icon')
      
      expect(sunIcon).toHaveClass('h-5', 'w-5')
      expect(moonIcon).toHaveClass('h-5', 'w-5')
      expect(arrowIcon).toHaveClass('h-4', 'w-4')
    })

    it('should have correct stroke width for theme icons', () => {
      render(<ThemeToggle />)
      
      const sunIcon = screen.getByTestId('sun-icon')
      const moonIcon = screen.getByTestId('moon-icon')
      
      expect(sunIcon).toHaveAttribute('data-stroke-width', '1.5')
      expect(moonIcon).toHaveAttribute('data-stroke-width', '1.5')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for light theme button', () => {
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      expect(lightButton).toHaveAttribute('aria-label', 'Switch to light theme')
    })

    it('should have aria-label for dark theme button', () => {
      render(<ThemeToggle />)
      
      const darkButton = screen.getByLabelText('Switch to dark theme')
      expect(darkButton).toHaveAttribute('aria-label', 'Switch to dark theme')
    })

    it('should have aria-label for scroll button', () => {
      render(<ThemeToggle />)
      
      const scrollButton = screen.getByLabelText('Scroll to top')
      expect(scrollButton).toHaveAttribute('aria-label', 'Scroll to top')
    })

    it('should be keyboard accessible', () => {
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      const darkButton = screen.getByLabelText('Switch to dark theme')
      
      expect(lightButton.tagName).toBe('BUTTON')
      expect(darkButton.tagName).toBe('BUTTON')
    })
  })

  describe('Edge Cases', () => {
    it('should render without errors', () => {
      expect(() => render(<ThemeToggle />)).not.toThrow()
    })

    it('should handle undefined theme', () => {
      mockUseTheme.mockReturnValue({
        theme: undefined,
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'light',
        resolvedTheme: 'light'
      })
      
      expect(() => render(<ThemeToggle />)).not.toThrow()
    })

    it('should handle multiple clicks', () => {
      render(<ThemeToggle />)
      
      const lightButton = screen.getByLabelText('Switch to light theme')
      
      fireEvent.click(lightButton)
      fireEvent.click(lightButton)
      fireEvent.click(lightButton)
      
      expect(mockSetTheme).toHaveBeenCalledTimes(3)
    })
  })
})

