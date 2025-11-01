import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const {
      participantId,
      pemaparanMateri,
      pertanyaanJawaban,
      kesesuaianTema,
      catatanPemaparan,
      catatanPertanyaan,
      catatanKesesuaian,
      feedback
    } = body

    // Validate required fields
    if (!participantId || !pemaparanMateri || !pertanyaanJawaban || !kesesuaianTema) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total
    const total = pemaparanMateri + pertanyaanJawaban + kesesuaianTema

    // Upsert the score (update if exists, create if not)
    // Cast prisma to any for model access due to Prisma model name casing
    const score = await (prisma as any).sPCFinalScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId: participantId,
          judgeId: session.user.id
        }
      },
      update: {
        pemaparanMateri,
        pertanyaanJawaban,
        kesesuaianTema,
        catatanPemaparan: catatanPemaparan || null,
        catatanPertanyaan: catatanPertanyaan || null,
        catatanKesesuaian: catatanKesesuaian || null,
        total,
        feedback: feedback || null,
        judgeName: session.user.name || 'Unknown Judge'
      },
      create: {
        submissionId: participantId,
        judgeId: session.user.id,
        judgeName: session.user.name || 'Unknown Judge',
        pemaparanMateri,
        pertanyaanJawaban,
        kesesuaianTema,
        catatanPemaparan: catatanPemaparan || null,
        catatanPertanyaan: catatanPertanyaan || null,
        catatanKesesuaian: catatanKesesuaian || null,
        total,
        feedback: feedback || null
      }
    })

    return NextResponse.json({
      success: true,
      score
    })
  } catch (error) {
    console.error('Error saving SPC final score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}