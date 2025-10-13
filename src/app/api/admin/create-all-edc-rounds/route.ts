import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * CREATE ALL EDC ROUNDS WITH CORRECT MAPPING
 * Creates all 8 PRELIMINARY rounds for EDC with proper roundNumber and session
 * 
 * Usage: POST /api/admin/create-all-edc-rounds
 */
export async function POST() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const log: string[] = []
    log.push('🔧 Creating all EDC PRELIMINARY rounds with correct mapping...\n')

    // Get EDC competition
    const edc = await prisma.competition.findFirst({
      where: { type: 'EDC' }
    })

    if (!edc) {
      return NextResponse.json({ error: 'EDC competition not found' }, { status: 404 })
    }

    // Define all 8 rounds with CORRECT mapping
    const roundsToCreate = [
      { roundNumber: 1, session: 1, roundName: 'PRELIMINARY - Round 1 Sesi 1' },
      { roundNumber: 1, session: 2, roundName: 'PRELIMINARY - Round 1 Sesi 2' },
      { roundNumber: 2, session: 1, roundName: 'PRELIMINARY - Round 2 Sesi 1' },
      { roundNumber: 2, session: 2, roundName: 'PRELIMINARY - Round 2 Sesi 2' },
      { roundNumber: 3, session: 1, roundName: 'PRELIMINARY - Round 3 Sesi 1' },
      { roundNumber: 3, session: 2, roundName: 'PRELIMINARY - Round 3 Sesi 2' },
      { roundNumber: 4, session: 1, roundName: 'PRELIMINARY - Round 4 Sesi 1' },
      { roundNumber: 4, session: 2, roundName: 'PRELIMINARY - Round 4 Sesi 2' },
    ]

    let created = 0
    let skipped = 0
    let deleted = 0

    for (const roundData of roundsToCreate) {
      // Check if round with correct mapping already exists
      const existingCorrect = await prisma.debateRound.findFirst({
        where: {
          competitionId: edc.id,
          stage: 'PRELIMINARY',
          roundNumber: roundData.roundNumber,
          session: roundData.session
        }
      })

      if (existingCorrect) {
        log.push(`✅ Already exists: ${roundData.roundName}`)
        skipped++
        continue
      }

      // Check if there's a round with same name but wrong mapping
      const wrongMapping = await prisma.debateRound.findFirst({
        where: {
          competitionId: edc.id,
          stage: 'PRELIMINARY',
          roundName: roundData.roundName
        },
        include: {
          matches: {
            include: {
              scores: true
            }
          }
        }
      })

      if (wrongMapping) {
        const hasScores = wrongMapping.matches.some(m => m.scores.length > 0)
        
        if (hasScores) {
          log.push(`⚠️  Cannot fix ${roundData.roundName}: has scores (roundNumber: ${wrongMapping.roundNumber}, session: ${wrongMapping.session})`)
          skipped++
          continue
        }

        // Delete wrong mapping
        if (wrongMapping.matches.length > 0) {
          await prisma.debateMatch.deleteMany({
            where: { roundId: wrongMapping.id }
          })
        }
        
        await prisma.debateRound.delete({
          where: { id: wrongMapping.id }
        })
        
        log.push(`🗑️  Deleted wrong mapping: ${roundData.roundName} (was roundNumber: ${wrongMapping.roundNumber}, session: ${wrongMapping.session})`)
        deleted++
      }

      // Create round with correct mapping
      try {
        await prisma.debateRound.create({
          data: {
            competitionId: edc.id,
            stage: 'PRELIMINARY',
            roundNumber: roundData.roundNumber,
            session: roundData.session,
            roundName: roundData.roundName,
            motion: null
          }
        })
        log.push(`✅ Created: ${roundData.roundName} (roundNumber: ${roundData.roundNumber}, session: ${roundData.session})`)
        created++
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        log.push(`❌ Failed to create ${roundData.roundName}: ${msg}`)
      }
    }

    // Show final state
    log.push('\n📋 Final state of all PRELIMINARY rounds:')
    const finalRounds = await prisma.debateRound.findMany({
      where: {
        competitionId: edc.id,
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

    log.push(`\n📊 Summary:`)
    log.push(`   Created: ${created} rounds`)
    log.push(`   Deleted (wrong mapping): ${deleted} rounds`)
    log.push(`   Skipped (already correct): ${skipped} rounds`)
    log.push(`\n✅ Done! All rounds now have correct mapping.`)

    return NextResponse.json({
      success: true,
      created,
      deleted,
      skipped,
      log: log.join('\n')
    })

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Create all EDC rounds error:', msg, error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: msg 
    }, { status: 500 })
  }
}
