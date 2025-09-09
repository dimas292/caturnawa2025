import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'judge') {
      return NextResponse.json({ error: 'Judge access required' }, { status: 403 })
    }

    // Get all verified participants/registrations
    const participants = await prisma.registration.findMany({
      where: {
        status: 'VERIFIED'
      },
      include: {
        participant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            institution: true
          }
        },
        competition: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true
          }
        },
        teamMembers: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            position: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        _count: {
          select: {
            files: true
          }
        }
      },
      orderBy: [
        { competition: { type: 'asc' } },
        { teamName: 'asc' }
      ]
    })

    // Transform data to include leader info and stats
    const transformedParticipants = participants.map(participant => ({
      id: participant.id,
      teamName: participant.teamName,
      status: participant.status,
      registeredAt: participant.createdAt,
      leader: {
        id: participant.participant.id,
        fullName: participant.participant.fullName,
        email: participant.participant.email,
        institution: participant.participant.institution
      },
      competition: {
        id: participant.competition.id,
        name: participant.competition.name,
        type: participant.competition.type,
        category: participant.competition.category
      },
      teamMembers: participant.teamMembers,
      stats: {
        totalMembers: participant.teamMembers.length + 1, // +1 for leader
        totalFiles: participant._count.files
      }
    }))

    // Group by competition type for easier access
    const groupedParticipants = {
      KDBI: transformedParticipants.filter(p => p.competition.type === 'KDBI'),
      EDC: transformedParticipants.filter(p => p.competition.type === 'EDC'),
      SPC: transformedParticipants.filter(p => p.competition.type === 'SPC'),
      DCC_INFOGRAFIS: transformedParticipants.filter(p => p.competition.type === 'DCC_INFOGRAFIS'),
      DCC_SHORT_VIDEO: transformedParticipants.filter(p => p.competition.type === 'DCC_SHORT_VIDEO')
    }

    const stats = {
      totalParticipants: transformedParticipants.length,
      byCompetition: {
        KDBI: groupedParticipants.KDBI.length,
        EDC: groupedParticipants.EDC.length,
        SPC: groupedParticipants.SPC.length,
        DCC_INFOGRAFIS: groupedParticipants.DCC_INFOGRAFIS.length,
        DCC_SHORT_VIDEO: groupedParticipants.DCC_SHORT_VIDEO.length
      },
      totalFiles: transformedParticipants.reduce((sum, p) => sum + p.stats.totalFiles, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        participants: transformedParticipants,
        grouped: groupedParticipants,
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching participants for judge:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch participants',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}