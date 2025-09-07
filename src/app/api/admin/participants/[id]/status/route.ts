import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // For development/testing, temporarily skip auth check
    // if (!session?.user || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Admin access required." },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const { status, adminNotes } = body
    const registrationId = params.id

    // Validate status
    const validStatuses = ['PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'VERIFIED', 'REJECTED', 'COMPLETED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    // Set verification timestamps and admin
    if (status === 'VERIFIED') {
      updateData.verifiedAt = new Date()
      updateData.verifiedBy = session?.user?.id || null
      updateData.rejectedAt = null
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = new Date()
      updateData.verifiedBy = session?.user?.id || null
      updateData.verifiedAt = null
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: updateData,
      include: {
        participant: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        competition: {
          select: {
            name: true,
            shortName: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRegistration,
      message: `Registration status updated to ${status}`
    })

  } catch (error) {
    console.error("Error updating registration status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}