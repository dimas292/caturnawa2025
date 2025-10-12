// src/app/api/admin/edc/delete-rooms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE all rooms for a specific round
// Query params: roundId
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const roundId = searchParams.get('roundId')

  if (!roundId) {
    return NextResponse.json({ error: 'roundId is required' }, { status: 400 })
  }

  try {
    // Delete all matches for this round
    const result = await prisma.debateMatch.deleteMany({
      where: {
        roundId: roundId
      }
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Deleted ${result.count} room(s)`
    })
  } catch (error) {
    console.error('Error deleting rooms:', error)
    return NextResponse.json(
      { error: 'Failed to delete rooms' },
      { status: 500 }
    )
  }
}
