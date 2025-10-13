okei gimport { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignInPage from '../page'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  CheckCircle2: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  Loader2: ({ className }: any) => <div data-testid="loader-icon" className={className}>Loader</div>
}))

// Mock fetch
global.fetch = jest.fn()

describe('SignInPage', () => {
  const mockPush = jest.fn()
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
  const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  // Store original location
  const originalLocation = window.location

  beforeAll(() => {
    // Mock window.location once for all tests
    delete (window as any).location
    window.location = { href: '' } as any
  })

  afterAll(() => {
    // Restore original location
    window.location = originalLocation
  })

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset location href
    window.location.href = ''

    // Mock router
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    } as any)

    // Mock search params (no params by default)
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null)
    } as any)
  })

  describe('Rendering', () => {
    it('should render sign-in form', () => {
      render(<SignInPage />)
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })

    it('should render email input field', () => {
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address')
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('name', 'email')
      expect(emailInput).toBeRequired()
    })

    it('should render password input field', () => {
      render(<SignInPage />)
      
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('name', 'password')
      expect(passwordInput).toBeRequired()
    })

    it('should render submit button', () => {
      render(<SignInPage />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should render remember me checkbox', () => {
      render(<SignInPage />)
      
      const checkbox = screen.getByRole('checkbox', { name: /keep me signed in/i })
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('name', 'rememberMe')
    })

    it('should render forgot password link', () => {
      render(<SignInPage />)
      
      const forgotLink = screen.getByText('Forgot password?')
      expect(forgotLink).toBeInTheDocument()
      expect(forgotLink.closest('a')).toHaveAttribute('href', '/auth/forgot-password')
    })

    it('should render create account link', () => {
      render(<SignInPage />)
      
      const createLink = screen.getByText('Create Account')
      expect(createLink).toBeInTheDocument()
      expect(createLink.closest('a')).toHaveAttribute('href', '/auth/signup')
    })

    it('should render home link on logo', () => {
      render(<SignInPage />)
      
      const homeLink = screen.getByText('Welcome Back').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should render description text', () => {
      render(<SignInPage />)
      
      expect(screen.getByText(/Sign in to access your Caturnawa account/i)).toBeInTheDocument()
    })
  })

  describe('Form Interaction', () => {
    it('should update email field on input', () => {
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address') as HTMLInputElement
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      
      expect(emailInput.value).toBe('test@example.com')
    })

    it('should update password field on input', () => {
      render(<SignInPage />)
      
      const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(passwordInput.value).toBe('password123')
    })

    it('should toggle password visibility', () => {
      render(<SignInPage />)
      
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const toggleButton = screen.getByTestId('eye-icon').closest('button')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      fireEvent.click(toggleButton!)
      
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
    })

    it('should toggle password visibility back to hidden', () => {
      render(<SignInPage />)
      
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const toggleButton = screen.getByTestId('eye-icon').closest('button')
      
      // Show password
      fireEvent.click(toggleButton!)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Hide password
      const hideButton = screen.getByTestId('eye-off-icon').closest('button')
      fireEvent.click(hideButton!)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Submission', () => {
    it('should call signIn on form submit', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any)
      mockFetch.mockResolvedValue({
        json: async () => ({ user: { role: 'participant' } })
      } as any)
      
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false
        })
      })
    })

    it('should show loading state during submission', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
      })
    })

    it('should disable submit button during loading', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message on failed sign-in', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' } as any)
      
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Email or password is incorrect')).toBeInTheDocument()
      })
    })

    it('should display error icon on error', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' } as any)
      
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const alertIcons = screen.getAllByTestId('alert-circle-icon')
        expect(alertIcons.length).toBeGreaterThan(0)
      })
    })

    it('should handle network errors', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'))
      
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument()
      })
    })

    it('should clear error on new submission', async () => {
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'Invalid credentials' } as any)
      
      render(<SignInPage />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // First submission with error
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Email or password is incorrect')).toBeInTheDocument()
      })
      
      // Second submission should clear error
      mockSignIn.mockResolvedValueOnce({ ok: true, error: null } as any)
      mockFetch.mockResolvedValue({
        json: async () => ({ user: { role: 'participant' } })
      } as any)
      
      fireEvent.change(passwordInput, { target: { value: 'correctpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Email or password is incorrect')).not.toBeInTheDocument()
      })
    })
  })

  describe('URL Messages', () => {
    it('should display registration success message', () => {
      mockUseSearchParams.mockReturnValue({
        get: jest.fn((key) => key === 'message' ? 'registration-success' : null)
      } as any)

      render(<SignInPage />)

      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument()
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
    })

    it('should display account deleted message', () => {
      mockUseSearchParams.mockReturnValue({
        get: jest.fn((key) => key === 'message' ? 'account-deleted' : null)
      } as any)

      render(<SignInPage />)

      expect(screen.getByText(/Your account has been deleted/i)).toBeInTheDocument()
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
    })

    it('should display session invalid message', () => {
      mockUseSearchParams.mockReturnValue({
        get: jest.fn((key) => key === 'message' ? 'session-invalid' : null)
      } as any)

      render(<SignInPage />)

      expect(screen.getByText(/Your session has expired/i)).toBeInTheDocument()
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
    })

    it('should not display messages when no message param', () => {
      mockUseSearchParams.mockReturnValue({
        get: jest.fn().mockReturnValue(null)
      } as any)

      render(<SignInPage />)

      expect(screen.queryByText(/Registration successful/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Your account has been deleted/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Your session has expired/i)).not.toBeInTheDocument()
    })
  })

  describe('Role-Based Redirects', () => {
    it('should fetch session after successful sign-in for admin', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any)
      mockFetch.mockResolvedValue({
        json: async () => ({ user: { role: 'admin' } })
      } as any)

      render(<SignInPage />)

      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/session')
      })
    })

    it('should fetch session after successful sign-in for judge', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any)
      mockFetch.mockResolvedValue({
        json: async () => ({ user: { role: 'judge' } })
      } as any)

      render(<SignInPage />)

      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'judge@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/session')
      })
    })

    it('should fetch session after successful sign-in for participant', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any)
      mockFetch.mockResolvedValue({
        json: async () => ({ user: { role: 'participant' } })
      } as any)

      render(<SignInPage />)

      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'participant@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/session')
      })
    })

    it('should handle successful sign-in with callback URL', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any)
      mockFetch.mockResolvedValue({
        json: async () => ({ user: { role: 'unknown' } })
      } as any)
      mockUseSearchParams.mockReturnValue({
        get: jest.fn((key) => key === 'from' ? '/competitions' : null)
      } as any)

      render(<SignInPage />)

      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/session')
      })
    })

    it('should handle successful sign-in without session role', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any)
      mockFetch.mockResolvedValue({
        json: async () => ({ user: {} })
      } as any)

      render(<SignInPage />)

      const emailInput = screen.getByPlaceholderText('Enter your email address')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/session')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have required attribute on email input', () => {
      render(<SignInPage />)

      const emailInput = screen.getByPlaceholderText('Enter your email address')
      expect(emailInput).toBeRequired()
    })

    it('should have required attribute on password input', () => {
      render(<SignInPage />)

      const passwordInput = screen.getByPlaceholderText('Enter your password')
      expect(passwordInput).toBeRequired()
    })

    it('should have proper labels for inputs', () => {
      render(<SignInPage />)

      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('Password')).toBeInTheDocument()
    })

    it('should have proper button type for password toggle', () => {
      render(<SignInPage />)

      const toggleButton = screen.getByTestId('eye-icon').closest('button')
      expect(toggleButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Suspense Fallback', () => {
    it('should render without errors', () => {
      expect(() => render(<SignInPage />)).not.toThrow()
    })
  })
})

