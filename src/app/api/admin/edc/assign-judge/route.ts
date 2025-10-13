// src/app/api/admin/edc/assign-judge/route.ts
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
    const { matchId, judgeId } = body

    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 })
    }

    // Update the match with the judge assignment
    const updatedMatch = await prisma.debateMatch.update({
      where: { id: matchId },
      data: {
        judgeId: judgeId || null
      } as any,
      include: {
        judge: true
      } as any
    })

    return NextResponse.json({ 
      success: true,
      match: updatedMatch
    })
  } catch (error) {
    console.error('Error assigning judge:', error)
    return NextResponse.json(
      { error: 'Failed to assign judge' },
      { status: 500 }
    )
  }
}
