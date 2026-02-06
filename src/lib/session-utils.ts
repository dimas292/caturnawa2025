// src/lib/session-utils.ts
import { signOut, getSession } from "next-auth/react"
import { prisma } from "./prisma"

/**
 * Clear all sessions for a deleted user
 * This should be called when a user account is deleted
 */
export async function clearUserSessions(userId: string) {
  try {
    // Delete all sessions for this user from the database
    await prisma.session.deleteMany({
      where: { userId }
    })
    
    
  } catch (error) {
    console.error("Error clearing user sessions:", error)
  }
}

/**
 * Invalidate current user session on the client side
 * This will force a sign out and redirect to signin page
 */
export function invalidateCurrentSession(reason?: string) {
  const message = reason === "deleted" ? "account-deleted" : "session-invalid"
  return signOut({ 
    callbackUrl: `/auth/signin?message=${message}`,
    redirect: true 
  })
}

/**
 * Check if user account still exists and is valid
 * Returns true if valid, false if account was deleted
 */
export async function validateUserExists(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    return !!user
  } catch (error) {
    console.error("Error validating user existence:", error)
    return false
  }
}

/**
 * Refresh the current session to extend its lifetime
 * This should be called periodically to prevent session expiration
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const session = await getSession()
    if (session) {
      // Trigger a session update by making a request to the API
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error refreshing session:', error)
    return false
  }
}

/**
 * Check if session is about to expire (within 1 hour)
 */
export function isSessionExpiringSoon(session: any): boolean {
  if (!session?.expires) return false
  
  const expiresAt = new Date(session.expires)
  const now = new Date()
  const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
  
  return (expiresAt.getTime() - now.getTime()) < oneHour
}

/**
 * Get remaining session time in minutes
 */
export function getRemainingSessionTime(session: any): number {
  if (!session?.expires) return 0
  
  const expiresAt = new Date(session.expires)
  const now = new Date()
  const remainingMs = expiresAt.getTime() - now.getTime()
  
  return Math.max(0, Math.floor(remainingMs / (60 * 1000))) // Convert to minutes
}