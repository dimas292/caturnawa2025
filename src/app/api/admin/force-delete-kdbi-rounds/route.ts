import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * FORCE DELETE ALL KDBI PRELIMINARY ROUNDS
 * Deletes all KDBI PRELIMINARY rounds that don't have scores
 * 
 * Usage: POST /api/admin/force-delete-kdbi-rounds
 */
export async function POST() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const log: string[] = []
    log.push('🗑️  Force deleting all KDBI PRELIMINARY rounds...\n')

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
      include: {
        matches: {
          include: {
            scores: true
          }
        }
      },
      orderBy: [
        { roundNumber: 'asc' },
        { session: 'asc' }
      ]
    })

    log.push(`📊 Found ${rounds.length} PRELIMINARY rounds\n`)

    let deleted = 0
    let skipped = 0

    for (const round of rounds) {
      const hasScores = round.matches.some(m => m.scores.length > 0)
      
      if (hasScores) {
        log.push(`⚠️  SKIPPED: ${round.roundName} (has ${round.matches.reduce((sum, m) => sum + m.scores.length, 0)} scores)`)
        skipped++
        continue
      }

      try {
        // Delete all matches first
        if (round.matches.length > 0) {
          const matchCount = round.matches.length
          await prisma.debateMatch.deleteMany({
            where: { roundId: round.id }
          })
          log.push(`   🗑️  Deleted ${matchCount} matches from ${round.roundName}`)
        }

        // Delete the round
        await prisma.debateRound.delete({
          where: { id: round.id }
        })
        
        log.push(`✅ DELETED: ${round.roundName} (roundNumber: ${round.roundNumber}, session: ${round.session})`)
        deleted++
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        log.push(`❌ Failed to delete ${round.roundName}: ${msg}`)
      }
    }

    log.push(`\n📊 Summary:`)
    log.push(`   Deleted: ${deleted} rounds`)
    log.push(`   Skipped: ${skipped} rounds (with scores)`)
    log.push(`\n✅ Done! Now you can create rounds with correct mapping.`)

    return NextResponse.json({
      success: true,
      deleted,
      skipped,
      log: log.join('\n')
    })

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Force delete KDBI rounds error:', msg, error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: msg 
    }, { status: 500 })
  }
}
