"use client"

import { useSession } from "next-auth/react"
import { useEffect, useCallback, useRef, useState } from "react"
import { refreshSessionToken, isTokenExpiringSoon, getTokenRemainingTime } from "@/lib/utils"

export function useSessionManager() {
  const { data: session, status, update } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef(false)

  // Function to refresh session
  const refreshSession = useCallback(async (force = false) => {
    if (!session) return false

    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshTime
    const minRefreshInterval = 2 * 60 * 1000 // 2 minutes minimum between refreshes

    // Don't refresh if not enough time has passed (unless forced)
    if (!force && timeSinceLastRefresh < minRefreshInterval) {
      return false
    }

    setIsRefreshing(true)
    try {
      const success = await refreshSessionToken()
      if (success) {
        setLastRefreshTime(now)
        // Force session update
        await update()
        console.log('Session refreshed successfully')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to refresh session:', error)
      return false
    } finally {
      setIsRefreshing(false)
    }
  }, [session, lastRefreshTime, update])

  // Check if session is expiring soon
  const isExpiringSoon = useCallback(() => {
    if (!session?.expires) return false
    const exp = Math.floor(new Date(session.expires).getTime() / 1000)
    return isTokenExpiringSoon(exp)
  }, [session])

  // Get remaining session time in minutes
  const getRemainingTime = useCallback(() => {
    if (!session?.expires) return 0
    const exp = Math.floor(new Date(session.expires).getTime() / 1000)
    return getTokenRemainingTime(exp)
  }, [session])

  // Set up automatic session refresh
  useEffect(() => {
    if (status === "loading" || !session) {
      // Clear existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      return
    }

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Set up refresh interval (check every 5 minutes)
    refreshIntervalRef.current = setInterval(() => {
      if (session && isExpiringSoon()) {
        refreshSession()
      }
    }, 5 * 60 * 1000) // 5 minutes

    // Also refresh immediately if session is expiring soon
    if (isExpiringSoon()) {
      refreshSession()
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [session, status, isExpiringSoon, refreshSession])

  // Show warning when session is expiring soon
  useEffect(() => {
    if (status === "loading" || !session) return

    const remainingTime = getRemainingTime()
    
    // Show warning when less than 30 minutes remaining
    if (remainingTime <= 30 && remainingTime > 0 && !warningShownRef.current) {
      warningShownRef.current = true
      console.warn(`Session expiring soon: ${remainingTime} minutes remaining`)
      
      // Reset warning flag after some time
      setTimeout(() => {
        warningShownRef.current = false
      }, 10 * 60 * 1000) // 10 minutes
    }
  }, [session, status, getRemainingTime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  return {
    session,
    status,
    isRefreshing,
    isExpiringSoon: isExpiringSoon(),
    remainingTime: getRemainingTime(),
    refreshSession: () => refreshSession(true), // Force refresh
    lastRefreshTime,
  }
}
