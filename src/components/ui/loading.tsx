// src/components/ui/loading.tsx
import { clsx } from "clsx"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-2 border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white",
        sizes[size],
        className
      )}
    />
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-4"></div>
      <div className="space-y-3">
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-1/2"></div>
      </div>
    </div>
  )
}