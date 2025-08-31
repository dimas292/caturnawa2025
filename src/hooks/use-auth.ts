// src/hooks/use-auth.ts
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useRef } from "react"
import { refreshSession, isSessionExpiringSoon, getRemainingSessionTime } from "@/lib/session-utils"

export function useAuth(redirectTo?: string) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(0)

  // Function to refresh session
  const handleSessionRefresh = useCallback(async () => {
    if (!session) return

    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshRef.current
    const minRefreshInterval = 5 * 60 * 1000 // 5 minutes minimum between refreshes

    // Only refresh if enough time has passed since last refresh
    if (timeSinceLastRefresh < minRefreshInterval) return

    try {
      const success = await refreshSession()
      if (success) {
        lastRefreshRef.current = now
        // Force session update
        await update()
        console.log('Session refreshed automatically')
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }, [session, update])

  // Set up automatic session refresh
  useEffect(() => {
    if (status === "loading" || !session) return

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Set up refresh interval (check every 10 minutes)
    refreshIntervalRef.current = setInterval(() => {
      if (session && isSessionExpiringSoon(session)) {
        handleSessionRefresh()
      }
    }, 10 * 60 * 1000) // 10 minutes

    // Also refresh immediately if session is expiring soon
    if (isSessionExpiringSoon(session)) {
      handleSessionRefresh()
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [session, status, handleSessionRefresh])

  useEffect(() => {
    if (status === "loading") return // Still loading

    // If session exists but user is null, the account was deleted - clear session
    if (session && (!session.user || !session.user.id)) {
      console.log("Invalid session detected - user account may have been deleted")
      signOut({ callbackUrl: "/auth/signin?message=account-deleted", redirect: true })
      return
    }

    if (!session && redirectTo) {
      router.push(redirectTo)
    }
  }, [session, status, router, redirectTo])

  // Function to manually refresh session
  const manualRefresh = useCallback(async () => {
    if (session) {
      await handleSessionRefresh()
    }
  }, [session, handleSessionRefresh])

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session && !!session.user,
    refreshSession: manualRefresh,
    remainingTime: session ? getRemainingSessionTime(session) : 0,
    isExpiringSoon: session ? isSessionExpiringSoon(session) : false,
  }
}

export function useRequireAuth(redirectTo: string = "/auth/signin") {
  return useAuth(redirectTo)
}

export function useRequireRole(requiredRole: string, redirectTo: string = "/") {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      router.push("/auth/signin")
      return
    }

    if (user.role !== requiredRole) {
      router.push(redirectTo)
      return
    }
  }, [user, isLoading, isAuthenticated, requiredRole, redirectTo, router])

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRequiredRole: user?.role === requiredRole,
  }
}

export function useRequireRoles(requiredRoles: string[], redirectTo: string = "/") {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      router.push("/auth/signin")
      return
    }

    if (!requiredRoles.includes(user.role || "")) {
      router.push(redirectTo)
      return
    }
  }, [user, isLoading, isAuthenticated, requiredRoles, redirectTo, router])

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRequiredRole: requiredRoles.includes(user?.role || ""),
  }
}