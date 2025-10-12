// src/app/api/admin/kdbi/assign-judge/route.ts
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

    const { matchId, judgeId } = await request.json()

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 })
    }

    // Update match with judge assignment
    const updatedMatch = await prisma.debateMatch.update({
      where: { id: matchId },
      data: { judgeId: judgeId || null },
      include: {
        judge: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      match: updatedMatch 
    })

  } catch (error) {
    console.error('Error assigning judge:', error)
    return NextResponse.json({ 
      error: 'Failed to assign judge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
