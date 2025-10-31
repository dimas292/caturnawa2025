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

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get EDC competition
    const competition = await prisma.competition.findUnique({
      where: {
        type: 'EDC'
      }
    })

    if (!competition) {
      return NextResponse.json({ error: 'EDC competition not found' }, { status: 404 })
    }

    // Fetch all team standings for EDC with final scores
    const standings = await prisma.teamStanding.findMany({
      where: {
        registration: {
          competitionId: competition.id,
          status: 'VERIFIED'
        },
        finalTeamPoints: {
          gt: 0
        }
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true,
                email: true
              }
            },
            teamMembers: {
              orderBy: {
                position: 'asc'
              },
              select: {
                fullName: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: [
        { finalTeamPoints: 'desc' },
        { finalSpeakerPoints: 'desc' },
        { finalAvgPosition: 'asc' }
      ]
    })

    // Transform data
    const tableData = standings.map((standing, index) => ({
      rank: index + 1,
      id: standing.id,
      teamName: standing.registration.teamName || standing.registration.participant?.fullName || 'Unknown Team',
      institution: standing.registration.participant?.institution || 'Unknown',
      email: standing.registration.participant?.email || '',
      members: standing.registration.teamMembers.map(m => m.fullName),
      matchesPlayed: standing.matchesPlayed,
      teamPoints: standing.finalTeamPoints,
      speakerPoints: Math.round(standing.finalSpeakerPoints * 100) / 100,
      avgPosition: Math.round(standing.finalAvgPosition * 100) / 100,
      firstPlaces: standing.firstPlaces,
      secondPlaces: standing.secondPlaces,
      thirdPlaces: standing.thirdPlaces,
      fourthPlaces: standing.fourthPlaces
    }))

    return NextResponse.json({
      success: true,
      data: tableData,
      total: tableData.length
    })

  } catch (error) {
    console.error('Error fetching EDC final scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
