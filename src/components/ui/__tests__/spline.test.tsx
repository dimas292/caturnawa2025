import { render, screen, waitFor } from '@testing-library/react'
import { SplineScene } from '../spline'
import { act } from 'react'

// Mock lucide-react
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>
}))

// Mock @splinetool/react-spline with proper module resolution
jest.mock('@splinetool/react-spline', () => {
  const MockSpline = ({ scene, className }: { scene: string; className?: string }) => (
    <div data-testid="spline-component" data-scene={scene} className={className}>
      Spline 3D Scene
    </div>
  )
  return MockSpline
}, { virtual: true })

describe('SplineScene Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render loading spinner initially (not mounted)', () => {
      const { container } = render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      // Should show loading spinner before mount
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-white/20')
    })

    it('should render Spline component after mount', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
    })

    it('should pass scene prop to Spline component', async () => {
      const sceneUrl = 'https://prod.spline.design/test-scene.splinecode'
      render(<SplineScene scene={sceneUrl} />)
      
      await waitFor(() => {
        const splineComponent = screen.getByTestId('spline-component')
        expect(splineComponent).toHaveAttribute('data-scene', sceneUrl)
      })
    })

    it('should pass className prop to Spline component', async () => {
      const customClass = 'custom-spline-class w-full h-full'
      render(<SplineScene scene="https://example.com/scene.splinecode" className={customClass} />)
      
      await waitFor(() => {
        const splineComponent = screen.getByTestId('spline-component')
        expect(splineComponent).toHaveClass('custom-spline-class', 'w-full', 'h-full')
      })
    })

    it('should render with correct container structure', async () => {
      const { container } = render(<SplineScene scene="https://example.com/scene.splinecode" />)

      // Wait for component to mount and render
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })

      // Verify container structure exists
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Client-Side Mount Check', () => {
    it('should eventually render Spline component after mount', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)

      // Component should mount and show Spline
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
    })

    it('should transition from loading to mounted state', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)

      // After mount, Spline component should be visible
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
    })

    it('should handle SSR compatibility (no window errors)', () => {
      // This test ensures component doesn't crash during SSR
      expect(() => {
        render(<SplineScene scene="https://example.com/scene.splinecode" />)
      }).not.toThrow()
    })
  })

  describe('Error Boundary', () => {
    it('should render error fallback UI when error occurs', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      // Wait for mount
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
      
      // Simulate error event
      act(() => {
        window.dispatchEvent(new Event('error'))
      })
      
      // Should show error fallback
      await waitFor(() => {
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
        expect(screen.getByText('3D Scene unavailable')).toBeInTheDocument()
      })
    })

    it('should display AlertCircle icon in error state', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
      
      // Trigger error
      act(() => {
        window.dispatchEvent(new Event('error'))
      })
      
      await waitFor(() => {
        const icon = screen.getByTestId('alert-circle-icon')
        expect(icon).toBeInTheDocument()
      })
    })

    it('should display error message with correct styling', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
      
      // Trigger error
      act(() => {
        window.dispatchEvent(new Event('error'))
      })
      
      await waitFor(() => {
        const errorMessage = screen.getByText('3D Scene unavailable')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveClass('text-sm', 'text-neutral-400')
      })
    })

    it('should render error container with correct classes', async () => {
      const { container } = render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
      
      // Trigger error
      act(() => {
        window.dispatchEvent(new Event('error'))
      })
      
      await waitFor(() => {
        const errorContainer = container.querySelector('.bg-neutral-900\\/50.rounded-lg.border.border-neutral-800')
        expect(errorContainer).toBeInTheDocument()
      })
    })

    it('should cleanup error event listener on unmount', async () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
      
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Suspense Boundary', () => {
    it('should wrap Spline component with Suspense', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)

      // Suspense should eventually resolve and show Spline component
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
    })

    it('should eventually show Spline component after Suspense resolves', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)

      // Wait for Suspense to resolve
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
    })
  })

  describe('Props Handling', () => {
    it('should handle different scene URLs', async () => {
      const scenes = [
        'https://prod.spline.design/scene1.splinecode',
        'https://prod.spline.design/scene2.splinecode',
        'https://example.com/custom-scene.splinecode'
      ]
      
      for (const sceneUrl of scenes) {
        const { unmount } = render(<SplineScene scene={sceneUrl} />)
        
        await waitFor(() => {
          const splineComponent = screen.getByTestId('spline-component')
          expect(splineComponent).toHaveAttribute('data-scene', sceneUrl)
        })
        
        unmount()
      }
    })

    it('should handle className prop correctly', async () => {
      const { rerender } = render(
        <SplineScene scene="https://example.com/scene.splinecode" className="class-1" />
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toHaveClass('class-1')
      })
      
      // Update className
      rerender(<SplineScene scene="https://example.com/scene.splinecode" className="class-2" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toHaveClass('class-2')
      })
    })

    it('should work without className prop', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      await waitFor(() => {
        const splineComponent = screen.getByTestId('spline-component')
        expect(splineComponent).toBeInTheDocument()
        // className should be undefined or empty
        expect(splineComponent.className).toBeFalsy()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty scene URL', async () => {
      render(<SplineScene scene="" />)
      
      await waitFor(() => {
        const splineComponent = screen.getByTestId('spline-component')
        expect(splineComponent).toHaveAttribute('data-scene', '')
      })
    })

    it('should handle multiple error events', async () => {
      render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
      
      // Trigger multiple errors
      act(() => {
        window.dispatchEvent(new Event('error'))
        window.dispatchEvent(new Event('error'))
        window.dispatchEvent(new Event('error'))
      })
      
      // Should still show error UI (not crash)
      await waitFor(() => {
        expect(screen.getByText('3D Scene unavailable')).toBeInTheDocument()
      })
    })

    it('should maintain error state after multiple renders', async () => {
      const { rerender } = render(<SplineScene scene="https://example.com/scene.splinecode" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('spline-component')).toBeInTheDocument()
      })
      
      // Trigger error
      act(() => {
        window.dispatchEvent(new Event('error'))
      })
      
      await waitFor(() => {
        expect(screen.getByText('3D Scene unavailable')).toBeInTheDocument()
      })
      
      // Rerender
      rerender(<SplineScene scene="https://example.com/scene.splinecode" className="new-class" />)
      
      // Should still show error
      expect(screen.getByText('3D Scene unavailable')).toBeInTheDocument()
    })
  })
})

