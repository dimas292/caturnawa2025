"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSystemStatus, getBannerId, isBannerDismissed, dismissBanner } from "@/lib/system-status"
import { SystemStatus } from "@/types/system-status"

const variantStyles = {
  info: {
    container: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-100",
    icon: "text-blue-600 dark:text-blue-400",
    button: "text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100",
  },
  warning: {
    container: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
    text: "text-orange-900 dark:text-orange-100",
    icon: "text-orange-600 dark:text-orange-400",
    button: "text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100",
  },
  error: {
    container: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    text: "text-red-900 dark:text-red-100",
    icon: "text-red-600 dark:text-red-400",
    button: "text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100",
  },
  success: {
    container: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
    text: "text-green-900 dark:text-green-100",
    icon: "text-green-600 dark:text-green-400",
    button: "text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100",
  },
}

const variantIcons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
}

export function SystemStatusBanner() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get current status
    const currentStatus = getSystemStatus()
    
    if (!currentStatus) {
      setIsVisible(false)
      return
    }

    // Check if banner has been dismissed
    const bannerId = getBannerId(currentStatus)
    const isDismissed = isBannerDismissed(bannerId)

    if (!isDismissed) {
      setStatus(currentStatus)
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    if (!status) return

    const bannerId = getBannerId(status)
    dismissBanner(bannerId)
    setIsVisible(false)
  }

  // Don't render anything until mounted (avoid hydration mismatch)
  if (!mounted || !isVisible || !status) {
    return null
  }

  const styles = variantStyles[status.variant]
  const Icon = variantIcons[status.variant]

  return (
    <div
      className={`border-b ${styles.container} animate-in slide-in-from-top duration-300`}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Message */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className={`h-5 w-5 flex-shrink-0 ${styles.icon}`} />
            <p className={`text-sm font-medium ${styles.text} flex-1`}>
              {status.message}
            </p>
          </div>

          {/* Right: Action Button + Close Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Action Button */}
            {status.actionLabel && status.actionUrl && (
              <Link href={status.actionUrl}>
                <Button
                  size="sm"
                  variant="outline"
                  className={`hidden sm:inline-flex ${styles.button} border-current`}
                >
                  {status.actionLabel}
                </Button>
              </Link>
            )}

            {/* Close Button */}
            {status.dismissible && (
              <button
                onClick={handleDismiss}
                className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${styles.button}`}
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Action Button */}
        {status.actionLabel && status.actionUrl && (
          <div className="mt-2 sm:hidden">
            <Link href={status.actionUrl}>
              <Button
                size="sm"
                variant="outline"
                className={`w-full ${styles.button} border-current`}
              >
                {status.actionLabel}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

