// src/app/api/judge/submit-scores/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { submitJudgeScores } from '@/scripts/judge-scoring-system'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'judge') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { matchId, scores } = body

    if (!matchId || !scores) {
      return NextResponse.json({ error: 'Match ID and scores are required' }, { status: 400 })
    }

    // Submit scores using the existing scoring system
    await submitJudgeScores(matchId, session.user.id, scores)

    return NextResponse.json({ success: true, message: 'Scores submitted successfully' })

  } catch (error) {
    console.error('Error submitting scores:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
