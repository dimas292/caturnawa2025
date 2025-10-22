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
      submissionId,
      // Desain Visual
      kerapianStruktur,
      komposisiGambar,
      kualitasEditing,
      // Isi/Pesan
      kesesuaianTema,
      kejelasanBahasa,
      dayaTarikMateri,
      // Originalitas
      orisinalitas,
      feedback
    } = body

    // Validate required fields
    const requiredFields = [
      kerapianStruktur, komposisiGambar, kualitasEditing,
      kesesuaianTema, kejelasanBahasa, dayaTarikMateri,
      orisinalitas
    ]

    if (!submissionId || requiredFields.some(field => field === undefined || field === null)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate score ranges (1-100)
    for (const score of requiredFields) {
      if (score < 1 || score > 100) {
        return NextResponse.json(
          { error: 'All scores must be between 1 and 100' },
          { status: 400 }
        )
      }
    }

    // Calculate weighted totals according to rubric
    const desainVisualTotal = Math.round(
      (kerapianStruktur * 0.5) + (komposisiGambar * 0.25) + (kualitasEditing * 0.25)
    )
    const isiPesanTotal = Math.round(
      (kesesuaianTema * 0.3) + (kejelasanBahasa * 0.4) + (dayaTarikMateri * 0.3)
    )
    const originalitasTotal = orisinalitas

    const total = desainVisualTotal + isiPesanTotal + originalitasTotal

    // Check if submission already has 3 judges (and current judge is not one of them)
    const existingScores = await prisma.dCCSemifinalScore.findMany({
      where: { submissionId }
    })

    const currentJudgeHasScored = existingScores.some(s => s.judgeId === session.user.id)
    
    if (existingScores.length >= 3 && !currentJudgeHasScored) {
      return NextResponse.json(
        { error: 'Maksimal 3 juri dapat menilai submission ini. Submission sudah dinilai oleh 3 juri.' },
        { status: 400 }
      )
    }

    // Upsert the score (update if exists, create if not)
    const score = await prisma.dCCSemifinalScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId: submissionId,
          judgeId: session.user.id
        }
      },
      update: {
        desainVisual: desainVisualTotal,
        isiPesan: isiPesanTotal,
        orisinalitas: originalitasTotal,
        total,
        feedback: feedback || null,
        judgeName: session.user.name || 'Unknown Judge'
      },
      create: {
        submissionId: submissionId,
        judgeId: session.user.id,
        judgeName: session.user.name || 'Unknown Judge',
        desainVisual: desainVisualTotal,
        isiPesan: isiPesanTotal,
        orisinalitas: originalitasTotal,
        total,
        feedback: feedback || null
      }
    })

    // Update submission status to REVIEWED (admin will decide finalists later)
    await prisma.dCCSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        status: 'REVIEWED',
        evaluatedAt: new Date(),
        evaluatedBy: session.user.id,
        feedback: feedback || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Penilaian semifinal berhasil disimpan',
      score,
      total,
      percentage: Math.round((total / 300) * 100)
    })
  } catch (error) {
    console.error('Error saving DCC semifinal score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
