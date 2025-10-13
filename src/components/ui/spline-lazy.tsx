"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"

// Dynamic import with SSR disabled for Spline component
const SplineScene = dynamic(
  () => import("./spline").then((mod) => mod.SplineScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-900/50 rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
          <p className="text-sm text-neutral-400">Loading 3D scene...</p>
        </div>
      </div>
    ),
  }
)

interface SplineLazyProps {
  scene: string
  className?: string
}

export function SplineLazy({ scene, className }: SplineLazyProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // Check connection quality (if available)
    const connection = (navigator as any).connection
    const isSlowConnection =
      connection &&
      (connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g")

    // Don't load 3D on slow connections or if user prefers reduced motion
    if (prefersReducedMotion || isSlowConnection) {
      return
    }

    // Intersection Observer to detect when component is near viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Add small delay before loading to ensure smooth scroll
          setTimeout(() => {
            setShouldLoad(true)
          }, 100)
          observer.disconnect()
        }
      },
      {
        // Start loading 200px before the element enters viewport
        rootMargin: "200px",
        threshold: 0.1,
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <SplineScene scene={scene} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-900/50 rounded-lg border border-neutral-800">
          {isVisible ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary/50"></div>
              <p className="text-sm text-neutral-400">Preparing 3D scene...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className="h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-400">
                3D scene will load when visible
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

