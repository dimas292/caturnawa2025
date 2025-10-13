import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * FIX KDBI SESSIONS ENDPOINT
 * Fixes the incorrect roundNumber and session mapping in KDBI rounds
 * 
 * Current state (WRONG):
 * - Round 1 Session 1 → "PRELIMINARY - Round 1 Sesi 1" ✅
 * - Round 2 Session 1 → "PRELIMINARY - Round 1 Sesi 2" ❌
 * - Round 3 Session 1 → "PRELIMINARY - Round 2 Sesi 1" ❌
 * - Round 4 Session 1 → "PRELIMINARY - Round 2 Sesi 2" ❌
 * etc.
 * 
 * Should be:
 * - Round 1 Session 1 → "PRELIMINARY - Round 1 Sesi 1"
 * - Round 1 Session 2 → "PRELIMINARY - Round 1 Sesi 2"
 * - Round 2 Session 1 → "PRELIMINARY - Round 2 Sesi 1"
 * - Round 2 Session 2 → "PRELIMINARY - Round 2 Sesi 2"
 * etc.
 */
export async function POST() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const log: string[] = []
    log.push('🔧 Fixing KDBI round sessions...\n')

    // Get KDBI competition
    const kdbi = await prisma.competition.findFirst({
      where: { type: 'KDBI' }
    })

    if (!kdbi) {
      return NextResponse.json({ error: 'KDBI competition not found' }, { status: 404 })
    }

    // Get all PRELIMINARY rounds
    const rounds = await prisma.debateRound.findMany({
      where: {
        competitionId: kdbi.id,
        stage: 'PRELIMINARY'
      },
      orderBy: [
        { roundNumber: 'asc' }
      ]
    })

    log.push(`📊 Found ${rounds.length} PRELIMINARY rounds\n`)

    // Parse roundName to extract correct roundNumber and session
    const updates: Array<{
      id: string
      oldRoundNumber: number
      oldSession: number
      newRoundNumber: number
      newSession: number
      roundName: string
    }> = []

    for (const round of rounds) {
      // Extract from roundName: "PRELIMINARY - Round X Sesi Y"
      const match = round.roundName.match(/Round (\d+) Sesi (\d+)/)
      
      if (match) {
        const correctRoundNumber = parseInt(match[1])
        const correctSession = parseInt(match[2])

        if (round.roundNumber !== correctRoundNumber || round.session !== correctSession) {
          updates.push({
            id: round.id,
            oldRoundNumber: round.roundNumber,
            oldSession: round.session,
            newRoundNumber: correctRoundNumber,
            newSession: correctSession,
            roundName: round.roundName
          })
        }
      }
    }

    log.push(`🔍 Found ${updates.length} rounds that need fixing\n`)

    if (updates.length === 0) {
      log.push('✅ All rounds are already correct!')
      return NextResponse.json({
        success: true,
        updatedCount: 0,
        log: log.join('\n')
      })
    }

    // Show what will be updated
    log.push('📝 Updates to be applied:')
    updates.forEach(u => {
      log.push(`   "${u.roundName}"`)
      log.push(`   Round ${u.oldRoundNumber} Session ${u.oldSession} → Round ${u.newRoundNumber} Session ${u.newSession}`)
      log.push('')
    })

    // Alternative approach: Delete and recreate rounds with correct mapping
    // This avoids unique constraint conflicts entirely
    log.push('⚙️  Applying fix: Delete and recreate approach...\n')
    
    // Collect data to recreate
    const roundsToRecreate: Array<{
      competitionId: string
      stage: string
      roundNumber: number
      session: number
      roundName: string
      motion: string | null
      isFrozen: boolean
      frozenAt: Date | null
      frozenBy: string | null
    }> = []

    for (const update of updates) {
      const round = rounds.find(r => r.id === update.id)
      if (round) {
        roundsToRecreate.push({
          competitionId: round.competitionId,
          stage: round.stage,
          roundNumber: update.newRoundNumber,
          session: update.newSession,
          roundName: round.roundName,
          motion: round.motion,
          isFrozen: round.isFrozen,
          frozenAt: round.frozenAt,
          frozenBy: round.frozenBy
        })
      }
    }

    // Delete rounds with wrong mapping (only if they have no matches)
    for (const update of updates) {
      const round = rounds.find(r => r.id === update.id)
      if (round && round.matches.length === 0) {
        try {
          await prisma.debateRound.delete({
            where: { id: update.id }
          })
          log.push(`🗑️  Deleted: ${update.roundName} (no matches)`)
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error'
          log.push(`❌ Failed to delete ${update.roundName}: ${msg}`)
        }
      } else if (round && round.matches.length > 0) {
        log.push(`⚠️  Skipped ${update.roundName}: has ${round.matches.length} matches, cannot delete`)
      }
    }

    // Recreate rounds with correct mapping
    log.push('\n⚙️  Recreating rounds with correct mapping...\n')
    
    for (const roundData of roundsToRecreate) {
      try {
        // Check if round with correct mapping already exists
        const existing = await prisma.debateRound.findFirst({
          where: {
            competitionId: roundData.competitionId,
            stage: roundData.stage,
            roundNumber: roundData.roundNumber,
            session: roundData.session
          }
        })

        if (!existing) {
          await prisma.debateRound.create({
            data: roundData
          })
          log.push(`✅ Created: ${roundData.roundName} (Round ${roundData.roundNumber} Session ${roundData.session})`)
        } else {
          log.push(`ℹ️  Already exists: ${roundData.roundName}`)
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        log.push(`❌ Failed to create ${roundData.roundName}: ${msg}`)
      }
    }

    // Verify final state
    log.push('\n📋 Final state:')
    const finalRounds = await prisma.debateRound.findMany({
      where: {
        competitionId: kdbi.id,
        stage: 'PRELIMINARY'
      },
      orderBy: [
        { roundNumber: 'asc' },
        { session: 'asc' }
      ]
    })

    finalRounds.forEach(r => {
      log.push(`   Round ${r.roundNumber} Session ${r.session}: "${r.roundName}"`)
    })

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
      log: log.join('\n')
    })

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Fix KDBI sessions error:', msg, error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: msg 
    }, { status: 500 })
  }
}
