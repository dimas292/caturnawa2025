// src/components/providers/session-provider.tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { SessionRefresh } from "../ui/session-refresh"

interface Props {
  children: ReactNode
}

export default function NextAuthProvider({ children }: Props) {
  return (
    <SessionProvider
      // Enable automatic session refresh
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
      <SessionRefresh />
    </SessionProvider>
  )
}