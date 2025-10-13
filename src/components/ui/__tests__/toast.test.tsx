import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { ToastProvider, useToast, toast } from '../toast'
import React from 'react'

describe('Toast Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <div>Test Content</div>
        </ToastProvider>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should provide toast context', () => {
      const TestComponent = () => {
        const { toasts } = useToast()
        return <div>Toasts: {toasts.length}</div>
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      expect(screen.getByText('Toasts: 0')).toBeInTheDocument()
    })

    it('should render toast container', () => {
      const { container } = render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      )

      const toastContainer = container.querySelector('.fixed.bottom-0.right-0')
      expect(toastContainer).toBeInTheDocument()
    })
  })

  describe('useToast Hook', () => {
    it('should throw error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const TestComponent = () => {
        useToast()
        return null
      }

      expect(() => render(<TestComponent />)).toThrow(
        'useToast must be used within ToastProvider'
      )

      consoleSpy.mockRestore()
    })

    it('should provide addToast function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      )

      const { result } = renderHook(() => useToast(), { wrapper })

      expect(result.current.addToast).toBeDefined()
      expect(typeof result.current.addToast).toBe('function')
    })

    it('should provide removeToast function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      )

      const { result } = renderHook(() => useToast(), { wrapper })

      expect(result.current.removeToast).toBeDefined()
      expect(typeof result.current.removeToast).toBe('function')
    })

    it('should provide toasts array', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      )

      const { result } = renderHook(() => useToast(), { wrapper })

      expect(result.current.toasts).toBeDefined()
      expect(Array.isArray(result.current.toasts)).toBe(true)
    })
  })

  describe('Toast Functionality', () => {
    it('should add toast', () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToast()
        return (
          <div>
            <button onClick={() => addToast({ title: 'Test Toast' })}>
              Add Toast
            </button>
            <div>Count: {toasts.length}</div>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      expect(screen.getByText('Count: 0')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Add Toast'))

      expect(screen.getByText('Count: 1')).toBeInTheDocument()
      expect(screen.getByText('Test Toast')).toBeInTheDocument()
    })

    it('should remove toast', () => {
      const TestComponent = () => {
        const { addToast, removeToast, toasts } = useToast()
        
        const handleAdd = () => {
          addToast({ title: 'Test Toast' })
        }

        return (
          <div>
            <button onClick={handleAdd}>Add Toast</button>
            {toasts.map((t) => (
              <button key={t.id} onClick={() => removeToast(t.id)}>
                Remove {t.id}
              </button>
            ))}
            <div>Count: {toasts.length}</div>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add Toast'))
      expect(screen.getByText('Count: 1')).toBeInTheDocument()

      const removeButton = screen.getByText(/Remove/)
      fireEvent.click(removeButton)

      expect(screen.getByText('Count: 0')).toBeInTheDocument()
    })

    it('should auto-remove toast after duration', async () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToast()
        return (
          <div>
            <button onClick={() => addToast({ title: 'Test', duration: 1000 })}>
              Add Toast
            </button>
            <div>Count: {toasts.length}</div>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add Toast'))
      expect(screen.getByText('Count: 1')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(screen.getByText('Count: 0')).toBeInTheDocument()
      })
    })

    it('should use default duration of 5000ms', async () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToast()
        return (
          <div>
            <button onClick={() => addToast({ title: 'Test' })}>
              Add Toast
            </button>
            <div>Count: {toasts.length}</div>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add Toast'))
      expect(screen.getByText('Count: 1')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(4999)
      })

      expect(screen.getByText('Count: 1')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(1)
      })

      await waitFor(() => {
        expect(screen.getByText('Count: 0')).toBeInTheDocument()
      })
    })
  })

  describe('Toast Variants', () => {
    it('should render default variant', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Default', variant: 'default' })}>
            Add
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('🔔')).toBeInTheDocument()
    })

    it('should render success variant', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Success', variant: 'success' })}>
            Add
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('✅')).toBeInTheDocument()
    })

    it('should render error variant', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Error', variant: 'error' })}>
            Add
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('❌')).toBeInTheDocument()
    })

    it('should render warning variant', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Warning', variant: 'warning' })}>
            Add
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })
  })

  describe('Toast Display', () => {
    it('should render toast with title', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Test Title' })}>
            Add
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render toast with description', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Title', description: 'Test Description' })}>
            Add
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('should render toast without description', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Only Title' })}>
            Add
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('Only Title')).toBeInTheDocument()
    })

    it('should have role="alert" for accessibility', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Alert' })}>
            Add
          </button>
        )
      }

      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))

      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
    })

    it('should render close button', () => {
      const TestComponent = () => {
        const { addToast } = useToast()
        return (
          <button onClick={() => addToast({ title: 'Test' })}>
            Add
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })

    it('should close toast when close button is clicked', () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToast()
        return (
          <div>
            <button onClick={() => addToast({ title: 'Test' })}>
              Add
            </button>
            <div>Count: {toasts.length}</div>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('Count: 1')).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Close'))
      expect(screen.getByText('Count: 0')).toBeInTheDocument()
    })

    it('should remove toast from list when close button is clicked', () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToast()
        return (
          <div>
            <button onClick={() => addToast({ title: 'Test' })}>
              Add
            </button>
            <div>Count: {toasts.length}</div>
            {toasts.map(t => (
              <div key={t.id}>Toast ID: {t.id}</div>
            ))}
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add'))
      expect(screen.getByText('Count: 1')).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Close'))
      expect(screen.getByText('Count: 0')).toBeInTheDocument()
    })
  })

  describe('Toast Positioning', () => {
    it('should position toast container at bottom-right', () => {
      const { container } = render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      )

      const toastContainer = container.querySelector('.fixed.bottom-0.right-0')
      expect(toastContainer).toBeInTheDocument()
      expect(toastContainer).toHaveClass('fixed', 'bottom-0', 'right-0')
    })

    it('should have correct z-index', () => {
      const { container } = render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      )

      const toastContainer = container.querySelector('.fixed.bottom-0.right-0')
      expect(toastContainer).toHaveClass('z-50')
    })

    it('should have spacing between toasts', () => {
      const { container } = render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      )

      const toastContainer = container.querySelector('.fixed.bottom-0.right-0')
      expect(toastContainer).toHaveClass('space-y-2')
    })
  })

  describe('Convenience Functions', () => {
    beforeEach(() => {
      // Mock window.dispatchEvent
      window.dispatchEvent = jest.fn()
    })

    it('should dispatch success toast event', () => {
      toast.success('Success Title', 'Success Description')

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toast',
          detail: {
            title: 'Success Title',
            description: 'Success Description',
            variant: 'success'
          }
        })
      )
    })

    it('should dispatch error toast event', () => {
      toast.error('Error Title', 'Error Description')

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toast',
          detail: {
            title: 'Error Title',
            description: 'Error Description',
            variant: 'error'
          }
        })
      )
    })

    it('should dispatch warning toast event', () => {
      toast.warning('Warning Title', 'Warning Description')

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toast',
          detail: {
            title: 'Warning Title',
            description: 'Warning Description',
            variant: 'warning'
          }
        })
      )
    })

    it('should dispatch info toast event', () => {
      toast.info('Info Title', 'Info Description')

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toast',
          detail: {
            title: 'Info Title',
            description: 'Info Description',
            variant: 'default'
          }
        })
      )
    })

    it('should handle toast without description', () => {
      toast.success('Success Title')

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toast',
          detail: {
            title: 'Success Title',
            description: undefined,
            variant: 'success'
          }
        })
      )
    })
  })

  describe('Multiple Toasts', () => {
    it('should render multiple toasts', () => {
      const TestComponent = () => {
        const { addToast, toasts } = useToast()
        return (
          <div>
            <button onClick={() => addToast({ title: 'Toast 1' })}>
              Add Toast 1
            </button>
            <button onClick={() => addToast({ title: 'Toast 2' })}>
              Add Toast 2
            </button>
            <div>Count: {toasts.length}</div>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Add Toast 1'))
      fireEvent.click(screen.getByText('Add Toast 2'))

      expect(screen.getByText('Count: 2')).toBeInTheDocument()
      expect(screen.getByText('Toast 1')).toBeInTheDocument()
      expect(screen.getByText('Toast 2')).toBeInTheDocument()
    })
  })
})

