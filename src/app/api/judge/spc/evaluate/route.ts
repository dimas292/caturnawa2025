import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      penilaianKaryaTulisIlmiah,
      substansiKaryaTulisIlmiah,
      kualitasKaryaTulisIlmiah,
      catatanPenilaian,
      catatanSubstansi,
      catatanKualitas
    } = body

    // Validate required fields
    if (!submissionId || 
        penilaianKaryaTulisIlmiah === undefined || 
        substansiKaryaTulisIlmiah === undefined || 
        kualitasKaryaTulisIlmiah === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate score ranges (0-100)
    if (penilaianKaryaTulisIlmiah < 0 || penilaianKaryaTulisIlmiah > 100 ||
        substansiKaryaTulisIlmiah < 0 || substansiKaryaTulisIlmiah > 100 ||
        kualitasKaryaTulisIlmiah < 0 || kualitasKaryaTulisIlmiah > 100) {
      return NextResponse.json(
        { error: 'Scores must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Calculate total score
    const total = penilaianKaryaTulisIlmiah + substansiKaryaTulisIlmiah + kualitasKaryaTulisIlmiah

    // Check if maximum 3 judges have already scored
    const existingScores = await prisma.sPCSemifinalScore.count({
      where: { submissionId }
    })

    if (existingScores >= 3) {
      // Check if current judge has already scored
      const currentJudgeScore = await prisma.sPCSemifinalScore.findUnique({
        where: {
          submissionId_judgeId: {
            submissionId,
            judgeId: session.user.id
          }
        }
      })

      if (!currentJudgeScore) {
        return NextResponse.json(
          { error: 'Maksimal 3 juri sudah menilai submission ini' },
          { status: 403 }
        )
      }
    }

    // Upsert score to new table (supports multiple judges)
    const score = await prisma.sPCSemifinalScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId,
          judgeId: session.user.id
        }
      },
      update: {
        penilaianKaryaTulisIlmiah,
        substansiKaryaTulisIlmiah,
        kualitasKaryaTulisIlmiah,
        catatanPenilaian: catatanPenilaian || null,
        catatanSubstansi: catatanSubstansi || null,
        catatanKualitas: catatanKualitas || null,
        total,
        judgeName: session.user.name || 'Unknown Judge'
      },
      create: {
        submissionId,
        judgeId: session.user.id,
        judgeName: session.user.name || 'Unknown Judge',
        penilaianKaryaTulisIlmiah,
        substansiKaryaTulisIlmiah,
        kualitasKaryaTulisIlmiah,
        catatanPenilaian: catatanPenilaian || null,
        catatanSubstansi: catatanSubstansi || null,
        catatanKualitas: catatanKualitas || null,
        total
      }
    })

    // Update submission status to REVIEWED after first judge scores
    // Also update legacy fields for backward compatibility
    const scoresCount = await prisma.sPCSemifinalScore.count({
      where: { submissionId }
    })

    await prisma.sPCSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'REVIEWED',
        evaluatedAt: new Date(),
        evaluatedBy: session.user.id,
        // Keep legacy fields updated for backward compatibility
        penilaianKaryaTulisIlmiah,
        substansiKaryaTulisIlmiah,
        kualitasKaryaTulisIlmiah,
        catatanPenilaian: catatanPenilaian || null,
        catatanSubstansi: catatanSubstansi || null,
        catatanKualitas: catatanKualitas || null,
        totalSemifinalScore: total
      }
    })

    return NextResponse.json({
      success: true,
      score,
      judgesCount: scoresCount,
      message: `Penilaian semifinal berhasil disimpan. ${scoresCount}/3 juri sudah menilai.`
    })
  } catch (error) {
    console.error('Error evaluating SPC semifinal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}