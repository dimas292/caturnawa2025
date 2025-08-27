// src/components/auth-redirect.tsx
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingPage } from "./ui/loading"

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session?.user?.role) {
      const currentPath = window.location.pathname
      
      // Don't redirect if already on correct page
      if (
        (session.user.role === "admin" && currentPath.startsWith("/admin")) ||
        (session.user.role === "judge" && currentPath.startsWith("/judge")) ||
        (session.user.role === "participant" && currentPath.startsWith("/dashboard"))
      ) {
        return
      }

      // Redirect to appropriate dashboard
      switch (session.user.role) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "judge":
          router.push("/dashboard/judge")
          break
        case "participant":
          router.push("/dashboard")
          break
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return <LoadingPage />
  }

  return <>{children}</>
}