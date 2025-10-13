'use client'

import { Suspense, lazy, useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

const Spline = lazy(() => import('@splinetool/react-spline').catch(() => {
  // Fallback if Spline fails to load
  return {
    default: () => null
  }
}))

interface SplineSceneProps {
  scene: string
  className?: string
}

function SplineErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-900/50 rounded-lg border border-neutral-800">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
          <p className="text-sm text-neutral-400">3D Scene unavailable</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-900/50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
      </div>
    )
  }

  return (
    <SplineErrorBoundary>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-neutral-900/50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
          </div>
        }
      >
        <Spline
          scene={scene}
          className={className}
        />
      </Suspense>
    </SplineErrorBoundary>
  )
}

