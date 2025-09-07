import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's participant data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        participant: true
      }
    })

    if (!user?.participant) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Get all registrations for this participant
    const registrations = await prisma.registration.findMany({
      where: {
        participantId: user.participant.id
      },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            shortName: true,
            type: true,
            category: true
          }
        },
        teamMembers: {
          orderBy: {
            position: 'asc'
          }
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileUrl: true,
            memberId: true,
            originalName: true,
            uploadedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: registrations
    })

  } catch (error) {
    console.error("Error fetching participant registrations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}