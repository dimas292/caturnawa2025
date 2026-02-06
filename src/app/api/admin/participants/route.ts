import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // For development/testing, temporarily skip auth check
    // if (!session?.user || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Admin access required." },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const competitionFilter = searchParams.get('competition')
    
    let whereCondition = {}
    if (competitionFilter && competitionFilter !== 'ALL') {
      whereCondition = {
        competition: {
          type: competitionFilter
        }
      }
    }

    // First, let's try a simple query to test database connection
    const totalRegistrations = await prisma.registration.count()
    

    if (totalRegistrations === 0) {
      // Return empty data if no registrations exist
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: "No registrations found in database"
      })
    }

    const registrations = await prisma.registration.findMany({
      where: whereCondition,
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
              }
            }
          }
        },
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
          include: {
            participant: {
              select: {
                fullName: true,
                email: true,
                institution: true,
                faculty: true,
                studentId: true
              }
            }
          },
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
            originalName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedData = registrations.map(registration => ({
      id: registration.id,
      teamName: registration.teamName || 'Individual',
      leaderName: registration.participant.fullName,
      leaderEmail: registration.participant.email,
      competition: {
        name: registration.competition.name,
        shortName: registration.competition.shortName,
        type: registration.competition.type,
        category: registration.competition.category
      },
      status: registration.status,
      paymentPhase: registration.paymentPhase,
      paymentAmount: registration.paymentAmount,
      paymentCode: registration.paymentCode,
      paymentProofUrl: registration.paymentProofUrl,
      adminNotes: registration.adminNotes,
      agreementAccepted: registration.agreementAccepted,
      institution: registration.participant.institution,
      faculty: registration.participant.faculty,
      whatsappNumber: registration.participant.whatsappNumber,
      teamMembers: (() => {
        // Deduplicate team members by participantId (keep first occurrence)
        const seen = new Set()
        return registration.teamMembers
          .filter(member => {
            if (seen.has(member.participantId)) {
              return false // Skip duplicate
            }
            seen.add(member.participantId)
            return true
          })
          .map(member => ({
            id: member.id,
            fullName: member.fullName,
            email: member.email,
            phone: member.phone,
            institution: member.institution,
            faculty: member.faculty,
            studentId: member.studentId,
            role: member.role,
            position: member.position
          }))
      })(),
      workTitle: registration.workTitle,
      workDescription: registration.workDescription,
      workFileUrl: registration.workFileUrl,
      workLinkUrl: registration.workLinkUrl,
      files: registration.files || [],
      verifiedAt: registration.verifiedAt,
      rejectedAt: registration.rejectedAt,
      verifiedBy: registration.verifiedBy,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    })

  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}