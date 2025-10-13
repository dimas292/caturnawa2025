import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * DEBUG ENDPOINT
 * Shows all rounds in the database with detailed information
 * 
 * Usage: GET /api/admin/debug-rounds
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all debate competitions
    const competitions = await prisma.competition.findMany({
      where: {
        type: {
          in: ['KDBI', 'EDC']
        }
      },
      include: {
        rounds: {
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
        }
      }
    })

    const result = competitions.map(comp => {
      // Group rounds by roundNumber to detect duplicates
      const roundsByNumber: Record<number, any[]> = {}
      comp.rounds.forEach(round => {
        if (!roundsByNumber[round.roundNumber]) {
          roundsByNumber[round.roundNumber] = []
        }
        roundsByNumber[round.roundNumber].push({
          id: round.id,
          roundName: round.roundName,
          stage: round.stage,
          roundNumber: round.roundNumber,
          session: round.session,
          motion: round.motion,
          matchCount: round.matches.length,
          hasScores: round.matches.some(m => m.scores.length > 0),
          createdAt: round.createdAt,
          updatedAt: round.updatedAt
        })
      })

      // Detect duplicates
      const duplicates: Record<number, any[]> = {}
      Object.entries(roundsByNumber).forEach(([roundNum, rounds]) => {
        if (rounds.length > 1) {
          duplicates[parseInt(roundNum)] = rounds
        }
      })

      return {
        competition: {
          id: comp.id,
          name: comp.name,
          type: comp.type
        },
        totalRounds: comp.rounds.length,
        rounds: comp.rounds.map(r => ({
          id: r.id,
          roundName: r.roundName,
          stage: r.stage,
          roundNumber: r.roundNumber,
          session: r.session,
          motion: r.motion ? r.motion.substring(0, 100) + '...' : null,
          matchCount: r.matches.length,
          hasScores: r.matches.some(m => m.scores.length > 0),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        })),
        duplicates: Object.keys(duplicates).length > 0 ? duplicates : null
      }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      competitions: result
    })

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Debug rounds error:', msg, error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: msg 
    }, { status: 500 })
  }
}
