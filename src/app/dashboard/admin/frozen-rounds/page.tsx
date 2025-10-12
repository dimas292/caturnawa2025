"use client"

import { useRequireRoles } from "@/hooks/use-auth"
import { LoadingPage } from "@/components/ui/loading"
import FrozenRoundsManager from "@/components/admin/FrozenRoundsManager"

export default function FrozenRoundsPage() {
  const { user, isLoading } = useRequireRoles(['admin'])

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="p-6 space-y-6">
      <FrozenRoundsManager />
    </div>
  )
}
