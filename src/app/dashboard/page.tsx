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

  // Fetch data di server side
  const registrations = await prisma.registration.findMany({
    where: {
      participant: {
        userId: session.user.id
      }
    },
    include: {
      participant: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      competition: {
        select: {
          id: true,
          name: true,
          category: true,
          type: true,
          
        }
      },
      _count: {
        select: {
          teamMembers: true,
          files: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format data untuk client
  const formattedRegistrations = registrations.map(reg => ({
    id: reg.id,
    participant: reg.participant,
    competition: reg.competition,
    teamName: reg.teamName,
    status: reg.status,
    paymentPhase: reg.paymentPhase,
    paymentAmount: reg.paymentAmount,
    paymentCode: reg.paymentCode,
    agreementAccepted: reg.agreementAccepted,
    teamMembersCount: reg._count.teamMembers,
    filesCount: reg._count.files,
    createdAt: reg.createdAt,
    updatedAt: reg.updatedAt
  }))

  return (
    <ParticipantDashboardClient 
      user={session.user}
      initialRegistrations={formattedRegistrations}
    />
  )
}