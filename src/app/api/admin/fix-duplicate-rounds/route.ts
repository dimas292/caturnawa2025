import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * EMERGENCY FIX ENDPOINT
 * This endpoint fixes duplicate rounds in the database
 * Only accessible by admin users
 * 
 * Usage: POST /api/admin/fix-duplicate-rounds
 */
export async function POST() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const log: string[] = []
    log.push('🔍 Scanning for duplicate rounds...')

    // Find all debate competitions
    const competitions = await prisma.competition.findMany({
      where: {
        type: {
          in: ['KDBI', 'EDC']
        }
      }
    })

    log.push(`📊 Found ${competitions.length} debate competitions`)

    let totalDeleted = 0

    for (const comp of competitions) {
      log.push(`\n🏆 Processing ${comp.type} - ${comp.name}`)

      // Get all rounds for this competition
      const rounds = await prisma.debateRound.findMany({
        where: {
          competitionId: comp.id
        },
        orderBy: [
          { stage: 'asc' },
          { roundNumber: 'asc' },
          { session: 'asc' }
        ],
        include: {
          matches: {
            include: {
              scores: true
            }
          }
        }
      })

      log.push(`📋 Total rounds: ${rounds.length}`)

      // Group by stage, roundNumber to find duplicates
      const groupedRounds: Record<string, typeof rounds> = {}
      rounds.forEach(round => {
        const key = `${round.stage}-${round.roundNumber}`
        if (!groupedRounds[key]) {
          groupedRounds[key] = []
        }
        groupedRounds[key].push(round)
      })

      // Process duplicates
      for (const [key, roundList] of Object.entries(groupedRounds)) {
        if (roundList.length > 1) {
          log.push(`\n⚠️  DUPLICATE FOUND for ${key}:`)
          
          roundList.forEach(r => {
            const hasScores = r.matches.some(m => m.scores.length > 0)
            log.push(`   - "${r.roundName}" (Session: ${r.session}, Matches: ${r.matches.length}, Has Scores: ${hasScores})`)
          })

          // Determine which to delete
          const roundsToDelete = []

          roundList.forEach(r => {
            const hasScores = r.matches.some(m => m.scores.length > 0)
            const hasSesi = r.roundName.includes('Sesi')
            const hasMatches = r.matches.length > 0

            if (hasScores) {
              // Never delete rounds with scores
              return
            } else if (!hasSesi && roundList.some(other => other.roundName.includes('Sesi'))) {
              // Delete rounds without "Sesi" if there's one with "Sesi"
              roundsToDelete.push(r)
            } else if (!hasMatches && roundList.some(other => other.matches.length > 0)) {
              // Delete empty rounds if there's one with matches
              roundsToDelete.push(r)
            }
          })

          // Delete identified duplicates
          for (const round of roundsToDelete) {
            log.push(`   🗑️  DELETING: "${round.roundName}" (ID: ${round.id})`)
            
            // Delete matches first
            if (round.matches.length > 0) {
              await prisma.debateMatch.deleteMany({
                where: { roundId: round.id }
              })
            }
            
            // Delete the round
            await prisma.debateRound.delete({
              where: { id: round.id }
            })
            
            totalDeleted++
            log.push(`      ✅ Deleted successfully`)
          }

          if (roundsToDelete.length === 0) {
            log.push(`   ℹ️  No safe duplicates to delete (all have scores or are needed)`)
          }
        }
      }
    }

    log.push(`\n📊 SUMMARY: Total rounds deleted: ${totalDeleted}`)

    // Show final state
    log.push('\n📋 Final state of all rounds:')
    for (const comp of competitions) {
      const finalRounds = await prisma.debateRound.findMany({
        where: { competitionId: comp.id },
        orderBy: [
          { stage: 'asc' },
          { roundNumber: 'asc' },
          { session: 'asc' }
        ]
      })

      log.push(`\n${comp.type}:`)
      if (finalRounds.length === 0) {
        log.push('  (no rounds)')
      } else {
        finalRounds.forEach(r => {
          log.push(`  - Round ${r.roundNumber} Session ${r.session} (${r.stage}): "${r.roundName}"`)
        })
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: totalDeleted,
      log: log.join('\n')
    })

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Fix duplicate rounds error:', msg, error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: msg 
    }, { status: 500 })
  }
}
