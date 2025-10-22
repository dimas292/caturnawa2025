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
      // Sinematografi
      angleShot,
      komposisiGambar,
      kualitasGambar,
      // Visual dan Bentuk
      pilihanWarna,
      tataKostum,
      propertiLatar,
      kesesuaianSetting,
      // Visual dan Editing
      kerapianTransisi,
      ritmePemotongan,
      sinkronisasiAudio,
      kreativitasEfek,
      // Isi/Pesan
      kesesuaianTema,
      kedalamanIsi,
      dayaTarik,
      feedback
    } = body

    // Validate required fields
    const requiredFields = [
      angleShot, komposisiGambar, kualitasGambar,
      pilihanWarna, tataKostum, propertiLatar, kesesuaianSetting,
      kerapianTransisi, ritmePemotongan, sinkronisasiAudio, kreativitasEfek,
      kesesuaianTema, kedalamanIsi, dayaTarik
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
    const sinematografi = Math.round(
      (angleShot * 0.4) + (komposisiGambar * 0.3) + (kualitasGambar * 0.3)
    )
    const visualBentuk = Math.round(
      (pilihanWarna * 0.25) + (tataKostum * 0.25) + (propertiLatar * 0.25) + (kesesuaianSetting * 0.25)
    )
    const visualEditing = Math.round(
      (kerapianTransisi * 0.25) + (ritmePemotongan * 0.25) + (sinkronisasiAudio * 0.25) + (kreativitasEfek * 0.25)
    )
    const isiPesan = Math.round(
      (kesesuaianTema * 0.2) + (kedalamanIsi * 0.4) + (dayaTarik * 0.4)
    )

    const total = sinematografi + visualBentuk + visualEditing + isiPesan

    // Check if submission already has 3 judges (and current judge is not one of them)
    const existingScores = await prisma.dCCShortVideoScore.findMany({
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
    const score = await prisma.dCCShortVideoScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId: submissionId,
          judgeId: session.user.id
        }
      },
      update: {
        // Sinematografi
        angleShot,
        komposisiGambar,
        kualitasGambar,
        sinematografi,
        // Visual dan Bentuk
        pilihanWarna,
        tataKostum,
        propertiLatar,
        kesesuaianSetting,
        visualBentuk,
        // Visual dan Editing
        kerapianTransisi,
        ritmePemotongan,
        sinkronisasiAudio,
        kreativitasEfek,
        visualEditing,
        // Isi/Pesan
        kesesuaianTema,
        kedalamanIsi,
        dayaTarik,
        isiPesan,
        // Total
        total,
        feedback: feedback || null,
        judgeName: session.user.name || 'Unknown Judge'
      },
      create: {
        submissionId: submissionId,
        judgeId: session.user.id,
        judgeName: session.user.name || 'Unknown Judge',
        // Sinematografi
        angleShot,
        komposisiGambar,
        kualitasGambar,
        sinematografi,
        // Visual dan Bentuk
        pilihanWarna,
        tataKostum,
        propertiLatar,
        kesesuaianSetting,
        visualBentuk,
        // Visual dan Editing
        kerapianTransisi,
        ritmePemotongan,
        sinkronisasiAudio,
        kreativitasEfek,
        visualEditing,
        // Isi/Pesan
        kesesuaianTema,
        kedalamanIsi,
        dayaTarik,
        isiPesan,
        // Total
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
      message: 'Penilaian short video berhasil disimpan',
      score,
      total,
      percentage: Math.round((total / 400) * 100)
    })
  } catch (error) {
    console.error('Error saving DCC short video score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}