"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "./button"
import { Sparkles, X } from "lucide-react"
import { SplinePlaceholder } from "./spline-placeholder"

// Dynamic import with SSR disabled for Spline component
const SplineScene = dynamic(
  () => import("./spline").then((mod) => mod.SplineScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-900/50 rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary/50"></div>
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

const STORAGE_KEY = "caturnawa-enable-3d"

export function SplineLazy({ scene, className }: SplineLazyProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [userEnabled, setUserEnabled] = useState<boolean | null>(null)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load user preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      setUserEnabled(saved === "true")
    }
  }, [])

  // Handle 3D loading logic
  useEffect(() => {
    // If user hasn't made a choice yet, don't load
    if (userEnabled === null || userEnabled === false) {
      return
    }

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
            setShowPlaceholder(false)
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
  }, [userEnabled])

  // Handle user enabling 3D
  const handleEnable3D = () => {
    setUserEnabled(true)
    localStorage.setItem(STORAGE_KEY, "true")
  }

  // Handle user disabling 3D
  const handleDisable3D = () => {
    setUserEnabled(false)
    setShouldLoad(false)
    setShowPlaceholder(true)
    localStorage.setItem(STORAGE_KEY, "false")
  }

  return (
    <div ref={containerRef} className={className}>
      {/* Show placeholder with enable button if user hasn't enabled 3D */}
      {showPlaceholder && userEnabled !== true ? (
        <div className="relative w-full h-full">
          <SplinePlaceholder />

          {/* Enable 3D Button */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <Button
              onClick={handleEnable3D}
              size="lg"
              className="group shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              View Interactive 3D
              <span className="ml-2 text-xs opacity-70">(1.3 MB)</span>
            </Button>
          </div>

          {/* Info Badge */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-300">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                Lightweight mode
              </span>
            </div>
          </div>
        </div>
      ) : shouldLoad ? (
        <div className="relative w-full h-full">
          <SplineScene scene={scene} className="w-full h-full" />

          {/* Disable 3D Button */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              onClick={handleDisable3D}
              size="sm"
              variant="outline"
              className="bg-neutral-900/80 backdrop-blur-sm border-neutral-700 hover:bg-neutral-800"
            >
              <X className="mr-1 h-4 w-4" />
              Exit 3D
            </Button>
          </div>
        </div>
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
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-neutral-400">
                3D scene ready to load
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

