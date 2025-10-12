/**
 * Lazy loading utilities for code splitting
 * Provides helpers for dynamic imports and lazy loading components
 */

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

/**
 * Loading component for lazy loaded components
 */
export const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

/**
 * Error component for lazy loaded components
 */
export const DefaultErrorComponent = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center p-8 text-destructive">
    <p>Failed to load component: {error.message}</p>
  </div>
)

/**
 * Create a lazy loaded component with loading and error states
 * @param importFn - Dynamic import function
 * @param options - Loading and error components
 * @returns Lazy loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: ComponentType
    error?: ComponentType<{ error: Error }>
  } = {}
) {
  return dynamic(importFn, {
    loading: options.loading || DefaultLoadingComponent,
    ssr: false,
  })
}

/**
 * Preload a dynamic component
 * @param importFn - Dynamic import function
 */
export async function preloadComponent<T>(
  importFn: () => Promise<{ default: T }>
): Promise<void> {
  try {
    await importFn()
  } catch (error) {
    console.error('Failed to preload component:', error)
  }
}

/**
 * Lazy load with retry logic
 * @param importFn - Dynamic import function
 * @param retries - Number of retries
 * @returns Promise with component
 */
export async function lazyLoadWithRetry<T>(
  importFn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      return await importFn()
    } catch (error) {
      lastError = error as Error
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }

  throw lastError || new Error('Failed to load component after retries')
}

/**
 * Intersection Observer based lazy loading
 * @param callback - Callback to execute when element is visible
 * @param options - Intersection Observer options
 * @returns Cleanup function
 */
export function observeIntersection(
  element: Element,
  callback: () => void,
  options: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.01,
  }
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: execute immediately if IntersectionObserver is not supported
    callback()
    return () => {}
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback()
        observer.disconnect()
      }
    })
  }, options)

  observer.observe(element)

  return () => observer.disconnect()
}

/**
 * Prefetch route on hover
 * @param href - Route to prefetch
 */
export function prefetchOnHover(href: string): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Lazy load image with Intersection Observer
 * @param img - Image element
 * @param src - Image source
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): () => void {
  return observeIntersection(img, () => {
    img.src = src
    img.classList.add('loaded')
  })
}

/**
 * Route-based code splitting hints
 * Defines which routes should be lazy loaded
 */
export const LazyRoutes = {
  // Admin routes - lazy load (not frequently accessed)
  admin: {
    dashboard: () => import('@/app/dashboard/admin/page'),
    participants: () => import('@/app/dashboard/admin/participants/page'),
  },
  
  // Judge routes - lazy load
  judge: {
    dashboard: () => import('@/app/dashboard/judge/page'),
    scoring: () => import('@/app/dashboard/judge/scoring/page'),
  },
  
  // Participant routes - lazy load
  participant: {
    dashboard: () => import('@/app/dashboard/participant/page'),
    upload: () => import('@/app/dashboard/participant/upload/page'),
  },
  
  // Public routes - eager load (frequently accessed)
  public: {
    home: () => import('@/app/page'),
    register: () => import('@/app/register/page'),
    login: () => import('@/app/login/page'),
  },
}

/**
 * Component-based code splitting hints
 * Defines which components should be lazy loaded
 */
export const LazyComponents = {
  // Heavy components - lazy load
  charts: () => import('@/components/charts'),
  editor: () => import('@/components/editor'),
  
  // UI components - eager load
  button: () => import('@/components/ui/button'),
  input: () => import('@/components/ui/input'),
  
  // Feature components - lazy load based on usage
  registration: {
    form: () => import('@/components/registration/team-data-form'),
    payment: () => import('@/components/registration/payment-form'),
  },
}

