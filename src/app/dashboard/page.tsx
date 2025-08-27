// src/app/dashboard/page.tsx (SERVER COMPONENT)
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ParticipantDashboardClient from "./ParticipantDashboardClient"

export default async function ParticipantDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    // Handle unauthorized
    return <div>Unauthorized</div>
  }

  return (
    <ParticipantDashboardClient user={session.user} />
  )
}