// src/app/api/admin/edc/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Create DebateMatch rooms for a given stage + roundNumber in EDC
// POST body: { stage: 'PRELIMINARY'|'SEMIFINAL'|'FINAL', roundNumber: number, roomCount: number }
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { stage, roundNumber, roomCount, motion } = body || {}

    if (!stage || !roundNumber || !roomCount || roomCount < 1) {
      return NextResponse.json({ error: 'stage, roundNumber, roomCount are required' }, { status: 400 })
    }

    // Ensure EDC competition exists
    const edc = await prisma.competition.findFirst({ where: { type: 'EDC' } })
    if (!edc) {
      return NextResponse.json({ error: 'EDC competition not found' }, { status: 400 })
    }

    // Upsert DebateRound for EDC
    let round = await prisma.debateRound.findFirst({
      where: { competitionId: edc.id, stage, roundNumber }
    })
    if (!round) {
      round = await prisma.debateRound.create({
        data: {
          competitionId: edc.id,
          stage,
          roundNumber,
          roundName: `${stage} - Round ${roundNumber}`,
          motion: motion || null
        }
      })
    } else if (motion && round.motion !== motion) {
      // Update motion if provided and different
      round = await prisma.debateRound.update({
        where: { id: round.id },
        data: { motion: motion }
      })
    }

    // Determine existing matches to avoid duplicate matchNumber
    const existing = await prisma.debateMatch.findMany({
      where: { roundId: round.id },
      orderBy: { matchNumber: 'asc' }
    })

    const existingNumbers = new Set(existing.map(m => m.matchNumber))

    const toCreate: { roundId: string; matchNumber: number; matchFormat: string }[] = []
    let num = 1
    while (toCreate.length < roomCount) {
      if (!existingNumbers.has(num)) {
        toCreate.push({ roundId: round.id, matchNumber: num, matchFormat: 'BP' })
      }
      num++
    }

    if (toCreate.length === 0) {
      return NextResponse.json({ success: true, created: 0, message: 'Rooms already exist for given count' })
    }

    await prisma.debateMatch.createMany({ data: toCreate })

    const matches = await prisma.debateMatch.findMany({
      where: { roundId: round.id },
      orderBy: { matchNumber: 'asc' }
    })

    return NextResponse.json({ success: true, created: toCreate.length, round, matches })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('create EDC rooms error:', msg)
    return NextResponse.json({ error: 'Internal server error', details: msg }, { status: 500 })
  }
}