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
      // Struktur Presentasi
      alurPresentasi,
      konsistensiTema,
      singkatJelas,
      // Teknik Penyampaian
      kepercayaanDiri,
      gayaPenyampaian,
      bahasaSopan,
      sikapPresentasi,
      // Penguasaan Materi
      pengetahuanTema,
      keluasanWawasan,
      // Kolaborasi Tim
      komunikasiTim,
      kerjasamaTim,
      feedback
    } = body

    // Validate required fields
    const requiredFields = [
      alurPresentasi, konsistensiTema, singkatJelas,
      kepercayaanDiri, gayaPenyampaian, bahasaSopan, sikapPresentasi,
      pengetahuanTema, keluasanWawasan,
      komunikasiTim, kerjasamaTim
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
    const strukturPresentasiTotal = Math.round(
      (alurPresentasi * 0.3) + (konsistensiTema * 0.2) + (singkatJelas * 0.5)
    )
    const teknikPenyampaianTotal = Math.round(
      (kepercayaanDiri * 0.35) + (gayaPenyampaian * 0.25) + (bahasaSopan * 0.25) + (sikapPresentasi * 0.15)
    )
    const penguasaanMateriTotal = Math.round(
      (pengetahuanTema * 0.6) + (keluasanWawasan * 0.4)
    )
    const kolaborasiTimTotal = Math.round(
      (komunikasiTim * 0.5) + (kerjasamaTim * 0.5)
    )

    const total = strukturPresentasiTotal + teknikPenyampaianTotal + penguasaanMateriTotal + kolaborasiTimTotal

    // Upsert the score (update if exists, create if not)
    const score = await prisma.dCCFinalScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId: submissionId,
          judgeId: session.user.id
        }
      },
      update: {
        strukturPresentasi: strukturPresentasiTotal,
        teknikPenyampaian: teknikPenyampaianTotal,
        penguasaanMateri: penguasaanMateriTotal,
        kolaborasiTeam: kolaborasiTimTotal,
        total,
        feedback: feedback || null,
        judgeName: session.user.name || 'Unknown Judge'
      },
      create: {
        submissionId: submissionId,
        judgeId: session.user.id,
        judgeName: session.user.name || 'Unknown Judge',
        strukturPresentasi: strukturPresentasiTotal,
        teknikPenyampaian: teknikPenyampaianTotal,
        penguasaanMateri: penguasaanMateriTotal,
        kolaborasiTeam: kolaborasiTimTotal,
        total,
        feedback: feedback || null
      }
    })

    // Update submission to mark final presentation as complete
    await prisma.dCCSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        feedback: feedback || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'DCC final score saved successfully',
      score
    })
  } catch (error) {
    console.error('Error saving DCC final score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
