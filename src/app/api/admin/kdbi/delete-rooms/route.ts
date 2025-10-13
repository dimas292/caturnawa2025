// src/app/api/admin/kdbi/delete-rooms/route.ts
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

  try {
    const { searchParams } = new URL(request.url)
    const roundId = searchParams.get('roundId')

    if (!roundId) {
      return NextResponse.json({ error: 'roundId is required' }, { status: 400 })
    }

    // Delete all matches in this round
    const result = await prisma.debateMatch.deleteMany({
      where: { roundId }
    })

    return NextResponse.json({ 
      success: true, 
      message: `${result.count} rooms deleted successfully` 
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('delete-rooms error:', msg)
    return NextResponse.json({ error: 'Internal server error', details: msg }, { status: 500 })
  }
}
