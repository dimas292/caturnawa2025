import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roundId, isFrozen } = body

    if (!roundId || typeof isFrozen !== 'boolean') {
      return NextResponse.json(
        { error: 'Round ID and frozen status are required' },
        { status: 400 }
      )
    }

    // Update round frozen status
    const updatedRound = await prisma.debateRound.update({
      where: { id: roundId },
      data: {
        isFrozen,
        frozenAt: isFrozen ? new Date() : null,
        frozenBy: isFrozen ? session.user.id : null
      },
      include: {
        competition: true
      }
    })

    return NextResponse.json({
      success: true,
      message: isFrozen 
        ? `Round ${updatedRound.roundName} has been frozen (hidden from leaderboard)`
        : `Round ${updatedRound.roundName} has been unfrozen (visible in leaderboard)`,
      round: updatedRound
    })

  } catch (error) {
    console.error('Error toggling frozen round:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
