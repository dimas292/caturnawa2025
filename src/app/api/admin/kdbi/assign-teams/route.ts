// src/app/api/admin/kdbi/assign-teams/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Body shape
// {
//   matchId: string,
//   team1Id?: string | null,
//   team2Id?: string | null,
//   team3Id?: string | null,
//   team4Id?: string | null
// }
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { matchId, team1Id, team2Id, team3Id, team4Id } = body || {}

    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 })
    }

    // Get match with round to validate uniqueness inside same round
    const match = await prisma.debateMatch.findUnique({
      where: { id: matchId },
      include: {
        round: true
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Collect provided team IDs (non-empty) and ensure they belong to KDBI and not duplicated in same round
    const providedIds = [team1Id, team2Id, team3Id, team4Id].filter((v: string | null | undefined): v is string => !!v)

    // Validate competition type and collect their registration IDs
    const regs = await prisma.registration.findMany({
      where: {
        id: { in: providedIds },
        competition: { type: 'KDBI' },
        status: { in: ['VERIFIED', 'COMPLETED'] }
      },
      select: { id: true }
    })

    if (regs.length !== providedIds.length) {
      return NextResponse.json({ error: 'Some teams are invalid for KDBI or not verified' }, { status: 400 })
    }

    // Ensure uniqueness within the same round
    const otherMatchesInRound = await prisma.debateMatch.findMany({
      where: {
        roundId: match.roundId,
        NOT: { id: matchId }
      },
      select: { team1Id: true, team2Id: true, team3Id: true, team4Id: true }
    })

    const usedInRound = new Set<string>()
    for (const m of otherMatchesInRound) {
      if (m.team1Id) usedInRound.add(m.team1Id)
      if (m.team2Id) usedInRound.add(m.team2Id)
      if (m.team3Id) usedInRound.add(m.team3Id)
      if (m.team4Id) usedInRound.add(m.team4Id)
    }

    for (const id of providedIds) {
      if (usedInRound.has(id)) {
        return NextResponse.json({ error: `Team ${id} already assigned in this round` }, { status: 400 })
      }
    }

    // Update assignment (allow null to clear)
    const updated = await prisma.debateMatch.update({
      where: { id: matchId },
      data: {
        team1Id: team1Id ?? null,
        team2Id: team2Id ?? null,
        team3Id: team3Id ?? null,
        team4Id: team4Id ?? null,
      },
      include: {
        team1: { include: { teamMembers: { include: { participant: true } } } },
        team2: { include: { teamMembers: { include: { participant: true } } } },
        team3: { include: { teamMembers: { include: { participant: true } } } },
        team4: { include: { teamMembers: { include: { participant: true } } } },
      }
    })

    return NextResponse.json({ success: true, match: updated })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('assign-teams error:', msg)
    return NextResponse.json({ error: 'Internal server error', details: msg }, { status: 500 })
  }
}
