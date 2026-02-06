import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get registered teams for debate competitions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const competitionType = searchParams.get('competitionType') // KDBI or EDC

    // Get registered teams for debate competitions
    const whereClause: any = {
      competition: {
        type: { in: ['KDBI', 'EDC'] }
      },
      status: 'VERIFIED' // Only verified teams (uppercase)
    }

    if (competitionType && ['KDBI', 'EDC'].includes(competitionType)) {
      whereClause.competition.type = competitionType
    }

    const registeredTeams = await prisma.registration.findMany({
      where: whereClause,
      include: {
        competition: {
          select: { 
            id: true,
            name: true, 
            type: true 
          }
        },
        participant: {
          select: { 
            id: true,
            fullName: true,
            email: true,
            university: true
          }
        },
        teamMembers: {
          select: {
            id: true,
            participantId: true,
            fullName: true,
            position: true
          },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: [
        { competition: { type: 'asc' } },
        { teamName: 'asc' }
      ]
    })

    // Group teams by competition
    const teamsByCompetition = registeredTeams.reduce((acc, team) => {
      const compType = team.competition.type
      if (!acc[compType]) {
        acc[compType] = []
      }
      acc[compType].push({
        id: team.id,
        teamName: team.teamName,
        competitionId: team.competition.id,
        competitionName: team.competition.name,
        competitionType: team.competition.type,
        leader: team.participant,
        members: team.teamMembers,
        memberCount: team.teamMembers.length,
        university: team.participant.university
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      data: { 
        teams: registeredTeams.map(team => ({
          id: team.id,
          teamName: team.teamName,
          competitionId: team.competition.id,
          competitionName: team.competition.name,
          competitionType: team.competition.type,
          leader: team.participant,
          members: team.teamMembers,
          memberCount: team.teamMembers.length,
          university: team.participant.university
        })),
        teamsByCompetition,
        stats: {
          KDBI: teamsByCompetition.KDBI?.length || 0,
          EDC: teamsByCompetition.EDC?.length || 0,
          total: registeredTeams.length
        }
      }
    })

  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch teams',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}