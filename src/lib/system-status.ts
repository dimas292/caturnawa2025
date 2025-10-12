// src/lib/system-status.ts

import { SystemStatus, SystemStatusType } from "@/types/system-status"

// Configuration
const REGISTRATION_DEADLINE = new Date("2025-10-10T23:59:59")
const REGISTRATION_WARNING_DAYS = 3 // Show warning 3 days before deadline

// Manual override - set to null for auto-detect, or set custom status
const MANUAL_OVERRIDE: SystemStatus | null = null
// Example manual override:
// const MANUAL_OVERRIDE: SystemStatus = {
//   type: "maintenance",
//   variant: "error",
//   message: "Sistem sedang dalam maintenance. Akan kembali normal dalam 2 jam.",
//   dismissible: false,
// }

/**
 * Calculate days remaining until deadline
 */
function getDaysRemaining(deadline: Date): number {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Get current system status based on date and configuration
 */
export function getSystemStatus(): SystemStatus | null {
  // Check manual override first
  if (MANUAL_OVERRIDE) {
    return MANUAL_OVERRIDE
  }

  const now = new Date()
  const daysRemaining = getDaysRemaining(REGISTRATION_DEADLINE)

  // Registration closed
  if (now > REGISTRATION_DEADLINE) {
    return {
      type: "registration-closed",
      variant: "error",
      message: "Pendaftaran telah ditutup. Terima kasih atas partisipasi Anda!",
      dismissible: true,
    }
  }

  // Registration closing soon (within warning period)
  if (daysRemaining <= REGISTRATION_WARNING_DAYS && daysRemaining > 0) {
    return {
      type: "registration-closing-soon",
      variant: "warning",
      message: `⏰ Pendaftaran akan ditutup dalam ${daysRemaining} hari! Segera daftar sebelum ${REGISTRATION_DEADLINE.toLocaleDateString("id-ID", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })}.`,
      dismissible: true,
      actionLabel: "Daftar Sekarang",
      actionUrl: "/register",
    }
  }

  // Registration open
  if (daysRemaining > REGISTRATION_WARNING_DAYS) {
    return {
      type: "registration-open",
      variant: "info",
      message: `🎉 Pendaftaran dibuka! Daftar sebelum ${REGISTRATION_DEADLINE.toLocaleDateString("id-ID", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })}.`,
      dismissible: true,
      actionLabel: "Daftar Sekarang",
      actionUrl: "/register",
    }
  }

  // Default: no banner
  return null
}

/**
 * Get banner ID for localStorage tracking
 */
export function getBannerId(status: SystemStatus): string {
  return `banner-dismissed-${status.type}-${REGISTRATION_DEADLINE.getTime()}`
}

/**
 * Check if banner has been dismissed
 */
export function isBannerDismissed(bannerId: string): boolean {
  if (typeof window === "undefined") return false
  
  try {
    const dismissed = localStorage.getItem(bannerId)
    if (!dismissed) return false

    const dismissedAt = new Date(dismissed)
    const now = new Date()
    
    // Banner dismissal expires after 24 hours
    const hoursSinceDismissed = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceDismissed > 24) {
      localStorage.removeItem(bannerId)
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking banner dismissed state:", error)
    return false
  }
}

/**
 * Mark banner as dismissed
 */
export function dismissBanner(bannerId: string): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(bannerId, new Date().toISOString())
  } catch (error) {
    console.error("Error dismissing banner:", error)
  }
}

/**
 * Clear all dismissed banners (for testing)
 */
export function clearDismissedBanners(): void {
  if (typeof window === "undefined") return
  
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith("banner-dismissed-")) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Error clearing dismissed banners:", error)
  }
}

