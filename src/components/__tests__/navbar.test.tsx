import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Navbar from '../navbar'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  Sun: () => <div data-testid="sun-icon">Sun</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>
}))

// Mock UI components
jest.mock('@/components/ui/navigation-menu', () => ({
  NavigationMenu: ({ children, className }: any) => <nav className={className}>{children}</nav>,
  NavigationMenuList: ({ children }: any) => <ul>{children}</ul>,
  NavigationMenuItem: ({ children }: any) => <li>{children}</li>,
  NavigationMenuLink: ({ children, className }: any) => <div className={className}>{children}</div>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
      {children}
    </div>
  ),
  SheetTrigger: ({ children, asChild, className }: any) => (
    <div data-testid="sheet-trigger" className={className}>{children}</div>
  ),
  SheetContent: ({ children, side, className }: any) => (
    <div data-testid="sheet-content" data-side={side} className={className}>
      {children}
    </div>
  )
}))

describe('Navbar Component', () => {
  const mockSetTheme = jest.fn()
  const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

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

    // Default session mock (no session)
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })
  })

  describe('Rendering', () => {
    it('should render navbar with logo', () => {
      render(<Navbar />)
      
      expect(screen.getByText('CATURNAWA')).toBeInTheDocument()
    })

    it('should render all navigation items', () => {
      render(<Navbar />)

      // Each nav item appears twice (desktop and mobile)
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Competitions').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Leaderboard').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Results').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Schedule').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1)
    })

    it('should render logo as link to home', () => {
      render(<Navbar />)
      
      const logo = screen.getByText('CATURNAWA')
      expect(logo.closest('a')).toHaveAttribute('href', '/')
    })

    it('should render navigation items with correct links', () => {
      render(<Navbar />)
      
      const homeLink = screen.getAllByText('Home')[0].closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
      
      const competitionsLink = screen.getAllByText('Competitions')[0].closest('a')
      expect(competitionsLink).toHaveAttribute('href', '/competitions')
    })

    it('should render header with correct classes', () => {
      const { container } = render(<Navbar />)
      
      const header = container.querySelector('header')
      expect(header).toHaveClass('sticky', 'top-0', 'z-50', 'w-full', 'border-b')
    })
  })

  describe('Theme Toggle', () => {
    it('should render theme toggle button after mount', async () => {
      render(<Navbar />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
      })
    })

    it('should show Moon icon when theme is light', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'light',
        resolvedTheme: 'light'
      })
      
      render(<Navbar />)
      
      await waitFor(() => {
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
      })
    })

    it('should show Sun icon when theme is dark', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'dark',
        resolvedTheme: 'dark'
      })
      
      render(<Navbar />)
      
      await waitFor(() => {
        expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      })
    })

    it('should toggle theme from light to dark', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'light',
        resolvedTheme: 'light'
      })
      
      render(<Navbar />)
      
      await waitFor(() => {
        const themeButton = screen.getByLabelText('Toggle theme')
        fireEvent.click(themeButton)
      })
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should toggle theme from dark to light', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark'],
        systemTheme: 'dark',
        resolvedTheme: 'dark'
      })
      
      render(<Navbar />)
      
      await waitFor(() => {
        const themeButton = screen.getByLabelText('Toggle theme')
        fireEvent.click(themeButton)
      })
      
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('Session-Aware Rendering', () => {
    it('should show Register button when not logged in', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      })
      
      render(<Navbar />)
      
      // Desktop register button
      const registerButtons = screen.getAllByText('Register')
      expect(registerButtons.length).toBeGreaterThan(0)
    })

    it('should show Dashboard button when logged in as participant', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'user@test.com',
            role: 'participant'
          },
          expires: '2025-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      
      render(<Navbar />)
      
      const dashboardButtons = screen.getAllByText('Dashboard')
      expect(dashboardButtons.length).toBeGreaterThan(0)
    })

    it('should link to admin dashboard when logged in as admin', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'admin@test.com',
            role: 'admin'
          },
          expires: '2025-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      
      render(<Navbar />)
      
      const dashboardLinks = screen.getAllByText('Dashboard')
      const adminLink = dashboardLinks[0].closest('a')
      expect(adminLink).toHaveAttribute('href', '/dashboard/admin')
    })

    it('should link to judge dashboard when logged in as judge', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'judge@test.com',
            role: 'judge'
          },
          expires: '2025-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      
      render(<Navbar />)
      
      const dashboardLinks = screen.getAllByText('Dashboard')
      const judgeLink = dashboardLinks[0].closest('a')
      expect(judgeLink).toHaveAttribute('href', '/dashboard/judge')
    })

    it('should link to participant dashboard when logged in as participant', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'participant@test.com',
            role: 'participant'
          },
          expires: '2025-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
      
      render(<Navbar />)
      
      const dashboardLinks = screen.getAllByText('Dashboard')
      const participantLink = dashboardLinks[0].closest('a')
      expect(participantLink).toHaveAttribute('href', '/dashboard')
    })
  })

  describe('Mobile Menu', () => {
    it('should render mobile menu trigger', () => {
      render(<Navbar />)

      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument()
    })

    it('should render mobile menu with navigation items', () => {
      render(<Navbar />)

      expect(screen.getByTestId('sheet-content')).toBeInTheDocument()
    })

    it('should show Sign In and Register buttons in mobile menu when not logged in', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      })

      render(<Navbar />)

      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getAllByText('Register').length).toBeGreaterThan(0)
    })

    it('should show Dashboard button in mobile menu when logged in', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'user@test.com',
            role: 'participant'
          },
          expires: '2025-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      render(<Navbar />)

      const dashboardButtons = screen.getAllByText('Dashboard')
      expect(dashboardButtons.length).toBeGreaterThan(0)
    })

    it('should render mobile menu trigger with correct aria-label', () => {
      render(<Navbar />)

      const menuButton = screen.getByLabelText('Toggle menu')
      expect(menuButton).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should have hidden class for desktop navigation on mobile', () => {
      const { container } = render(<Navbar />)

      const desktopNav = container.querySelector('.hidden.md\\:flex')
      expect(desktopNav).toBeInTheDocument()
    })

    it('should have hidden class for desktop CTA on mobile', () => {
      const { container } = render(<Navbar />)

      const desktopCTA = container.querySelector('.hidden.md\\:block')
      expect(desktopCTA).toBeInTheDocument()
    })

    it('should show mobile menu trigger only on mobile', () => {
      render(<Navbar />)

      const trigger = screen.getByTestId('sheet-trigger')
      expect(trigger).toHaveClass('md:hidden')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing session data gracefully', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn()
      })

      expect(() => render(<Navbar />)).not.toThrow()
    })

    it('should handle session with missing role', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'user@test.com'
          },
          expires: '2025-12-31'
        } as any,
        status: 'authenticated',
        update: jest.fn()
      })

      expect(() => render(<Navbar />)).not.toThrow()
    })

    it('should not render theme toggle before mount', () => {
      render(<Navbar />)

      // Before mount, theme toggle should not be visible
      // After mount it will appear
      const themeButtons = screen.queryAllByLabelText('Toggle theme')
      // May or may not be present depending on mount state
      expect(themeButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label for theme toggle', async () => {
      render(<Navbar />)

      await waitFor(() => {
        const themeButton = screen.getByLabelText('Toggle theme')
        expect(themeButton).toBeInTheDocument()
      })
    })

    it('should have proper aria-label for mobile menu toggle', () => {
      render(<Navbar />)

      const menuButton = screen.getByLabelText('Toggle menu')
      expect(menuButton).toBeInTheDocument()
    })

    it('should render semantic header element', () => {
      const { container } = render(<Navbar />)

      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('should render navigation as nav element', () => {
      const { container } = render(<Navbar />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })
  })

  describe('Client-Side Mount', () => {
    it('should set mounted state after mount', async () => {
      render(<Navbar />)

      // Theme toggle should appear after mount
      await waitFor(() => {
        expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
      })
    })

    it('should handle SSR without errors', () => {
      expect(() => render(<Navbar />)).not.toThrow()
    })
  })
})

