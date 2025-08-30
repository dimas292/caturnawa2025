// src/lib/session-utils.ts
import { signOut } from "next-auth/react"
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
    
    console.log(`Cleared sessions for user ${userId}`)
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