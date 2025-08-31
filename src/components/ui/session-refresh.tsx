"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "./button"
import { LoadingSpinner } from "./loading"

interface SessionRefreshProps {
  showWarning?: boolean
  className?: string
}

export function SessionRefresh({ showWarning = true, className = "" }: SessionRefreshProps) {
  const { remainingTime, isExpiringSoon, refreshSession } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showExpiryWarning, setShowExpiryWarning] = useState(false)

  // Show warning when session is expiring soon
  useEffect(() => {
    if (isExpiringSoon && showWarning) {
      setShowExpiryWarning(true)
      
      // Auto-hide warning after 10 seconds
      const timer = setTimeout(() => {
        setShowExpiryWarning(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [isExpiringSoon, showWarning])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
      setShowExpiryWarning(false)
    } catch (error) {
      console.error("Failed to refresh session:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Don't render anything if session is not expiring soon
  if (!isExpiringSoon && !showExpiryWarning) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {showExpiryWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Session Expiring Soon
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Your session will expire in {remainingTime} minutes. Click refresh to extend it.
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  size="sm"
                  variant="outline"
                  className="text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800/30"
                >
                  {isRefreshing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Refreshing...
                    </>
                  ) : (
                    "Refresh Session"
                  )}
                </Button>
                <Button
                  onClick={() => setShowExpiryWarning(false)}
                  size="sm"
                  variant="ghost"
                  className="text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800/30"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
