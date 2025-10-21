import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch real finalists from database
    const finalists = await prisma.sPCSubmission.findMany({
      where: {
        qualifiedToFinal: true
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true
              }
            }
          }
        }
      },
      orderBy: {
        presentationOrder: 'asc'
      }
    })

    const transformedFinalists = finalists.map((finalist, index) => ({
      id: finalist.id,
      participantName: finalist.registration.participant?.fullName || 'Unknown',
      institution: finalist.registration.participant?.institution || 'Unknown',
      presentationOrder: finalist.presentationOrder || (index + 1),
      status: 'waiting', // Default status, can be updated based on your logic
      presentationTitle: finalist.presentationTitle || finalist.judulKarya,
      scheduledTime: finalist.scheduledTime || null
    }))

    return NextResponse.json({
      finalists: transformedFinalists,
      total: transformedFinalists.length
    })

  } catch (error) {
    console.error('Error fetching SPC finalists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}