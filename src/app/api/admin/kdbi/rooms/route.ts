// src/app/api/admin/kdbi/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Create DebateMatch rooms for a given stage + roundNumber + session in KDBI
// POST body: { stage: 'PRELIMINARY'|'SEMIFINAL'|'FINAL', roundNumber: number, session: number, roomCount: number, motion?: string }
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { stage, roundNumber, session: sessionNumber, roomCount, motion } = body || {}

    if (!stage || !roundNumber || !sessionNumber || !roomCount || roomCount < 1) {
      return NextResponse.json({ error: 'stage, roundNumber, session, roomCount are required' }, { status: 400 })
    }

    // Ensure KDBI competition exists
    const kdbi = await prisma.competition.findFirst({ where: { type: 'KDBI' } })
    if (!kdbi) {
      return NextResponse.json({ error: 'KDBI competition not found' }, { status: 400 })
    }

    // Check if there's a round with wrong mapping (e.g., Round 2 Session 1 but name says "Round 1 Sesi 2")
    const expectedRoundName = `${stage} - Round ${roundNumber} Sesi ${sessionNumber}`
    const roundWithSameName = await prisma.debateRound.findFirst({
      where: { 
        competitionId: kdbi.id, 
        stage,
        roundName: expectedRoundName
      }
    })

    if (roundWithSameName && (roundWithSameName.roundNumber !== roundNumber || roundWithSameName.session !== sessionNumber)) {
      return NextResponse.json({ 
        error: 'Round dengan nama yang sama sudah ada dengan mapping berbeda',
        details: `Round "${expectedRoundName}" sudah ada dengan roundNumber: ${roundWithSameName.roundNumber}, session: ${roundWithSameName.session}. Silakan jalankan Fix KDBI Sessions di halaman Database Maintenance.`,
        needsFix: true
      }, { status: 409 })
    }

    // Upsert DebateRound for KDBI
    let round = await prisma.debateRound.findFirst({
      where: { competitionId: kdbi.id, stage, roundNumber, session: sessionNumber }
    })
    if (!round) {
      round = await prisma.debateRound.create({
        data: {
          competitionId: kdbi.id,
          stage,
          roundNumber,
          session: sessionNumber,
          roundName: expectedRoundName,
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
    console.error('create rooms error:', msg)
    return NextResponse.json({ error: 'Internal server error', details: msg }, { status: 500 })
  }
}
