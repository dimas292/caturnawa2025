// src/app/api/admin/edc/round-teams/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const authSession = await getServerSession(authOptions)
  if (!authSession || authSession.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const stage = (searchParams.get('stage') || 'PRELIMINARY') as any
  const roundNumber = searchParams.get('round') ? parseInt(searchParams.get('round')!) : 1
  const sessionNumber = searchParams.get('session') ? parseInt(searchParams.get('session')!) : 1

  try {
    const round = await prisma.debateRound.findFirst({
      where: {
        competition: { type: 'EDC' },
        stage,
        roundNumber,
        session: sessionNumber
      },
      include: {
        competition: true,
        matches: {
          include: {
            team1: { include: { teamMembers: { include: { participant: true } } } },
            team2: { include: { teamMembers: { include: { participant: true } } } },
            team3: { include: { teamMembers: { include: { participant: true } } } },
            team4: { include: { teamMembers: { include: { participant: true } } } },
            judge: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { matchNumber: 'asc' }
        }
      }
    })

    if (!round) {
      return NextResponse.json({
        round: null,
        matches: [],
        teams: []
      })
    }

    // All verified registrations for EDC become candidate teams
    const registrations = await prisma.registration.findMany({
      where: {
        competition: { type: 'EDC' },
        status: { in: ['VERIFIED', 'COMPLETED'] }
      },
      include: {
        teamMembers: { include: { participant: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Determine used team IDs in this round to prevent duplicates
    const usedIds = new Set<string>()
    for (const m of round.matches) {
      if (m.team1Id) usedIds.add(m.team1Id)
      if (m.team2Id) usedIds.add(m.team2Id)
      if (m.team3Id) usedIds.add(m.team3Id)
      if (m.team4Id) usedIds.add(m.team4Id)
    }

    return NextResponse.json({
      round: {
        id: round.id,
        stage: round.stage,
        roundNumber: round.roundNumber,
        session: round.session,
        roundName: round.roundName,
      },
      matches: round.matches.map(m => ({
        id: m.id,
        matchNumber: m.matchNumber,
        judgeId: m.judgeId,
        judge: m.judge,
        teams: [m.team1, m.team2, m.team3, m.team4].map(t => t ? ({
          id: t.id,
          teamName: t.teamName,
          members: t.teamMembers.map(tm => ({
            id: tm.id,
            fullName: tm.participant.fullName
          }))
        }) : null)
      })),
      teams: registrations.map(r => ({
        id: r.id,
        teamName: r.teamName || r.teamMembers.map(tm => tm.participant?.fullName || 'Unknown').slice(0,2).join(' & '),
        usedInThisRound: usedIds.has(r.id),
        members: r.teamMembers.map(tm => ({ id: tm.id, fullName: tm.participant?.fullName || 'Unknown Member' }))
      }))
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('EDC round-teams error:', msg)
    return NextResponse.json({ error: 'Internal server error', details: msg }, { status: 500 })
  }
}