import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Session refresh utilities
export async function refreshSessionToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (response.ok) {
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to refresh session token:', error)
    return false
  }
}

export function isTokenExpiringSoon(exp: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = exp - now
  const oneHour = 60 * 60 // 1 hour in seconds
  
  return timeUntilExpiry < oneHour && timeUntilExpiry > 0
}

export function getTokenRemainingTime(exp: number): number {
  const now = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = exp - now
  
  return Math.max(0, Math.floor(timeUntilExpiry / 60)) // Convert to minutes
}
