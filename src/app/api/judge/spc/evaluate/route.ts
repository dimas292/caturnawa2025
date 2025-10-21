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
    const totalSemifinalScore = penilaianKaryaTulisIlmiah + substansiKaryaTulisIlmiah + kualitasKaryaTulisIlmiah

    // Update the SPC submission with evaluation scores
    // Note: qualifiedToFinal is NOT set here - it will be determined by admin based on ranking
    const updatedSubmission = await prisma.sPCSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        penilaianKaryaTulisIlmiah,
        substansiKaryaTulisIlmiah,
        kualitasKaryaTulisIlmiah,
        catatanPenilaian: catatanPenilaian || null,
        catatanSubstansi: catatanSubstansi || null,
        catatanKualitas: catatanKualitas || null,
        totalSemifinalScore,
        status: 'REVIEWED',
        evaluatedAt: new Date(),
        evaluatedBy: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: 'Penilaian semifinal berhasil disimpan. Status kelulusan akan ditentukan berdasarkan ranking oleh admin.'
    })
  } catch (error) {
    console.error('Error evaluating SPC semifinal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}