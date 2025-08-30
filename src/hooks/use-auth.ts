// src/hooks/use-auth.ts
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth(redirectTo?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()

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

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session && !!session.user,
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