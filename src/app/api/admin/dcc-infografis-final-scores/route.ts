import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch all DCC Infografis submissions with their final scores
    const submissions = await prisma.dCCSubmission.findMany({
      where: {
        qualifiedToFinal: true
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true,
                email: true
              }
            }
          }
        },
        finalScores: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data untuk tabel
    const tableData = submissions.map(submission => {
      // Hitung rata-rata dari semua juri
      const scores = submission.finalScores
      const totalJudges = scores.length
      
      let avgStruktur = 0
      let avgTeknik = 0
      let avgPenguasaan = 0
      let avgKolaborasi = 0
      let totalScore = 0

      if (totalJudges > 0) {
        avgStruktur = scores.reduce((sum, s) => sum + s.strukturPresentasi, 0) / totalJudges
        avgTeknik = scores.reduce((sum, s) => sum + s.teknikPenyampaian, 0) / totalJudges
        avgPenguasaan = scores.reduce((sum, s) => sum + s.penguasaanMateri, 0) / totalJudges
        avgKolaborasi = scores.reduce((sum, s) => sum + s.kolaborasiTeam, 0) / totalJudges
        totalScore = avgStruktur + avgTeknik + avgPenguasaan + avgKolaborasi
      }

      return {
        id: submission.id,
        participantName: submission.registration.participant?.fullName || 'Unknown',
        institution: submission.registration.participant?.institution || 'Unknown',
        email: submission.registration.participant?.email || '',
        judulKarya: submission.judulKarya,
        judgesCount: totalJudges,
        judges: scores.map(score => ({
          judgeId: score.judgeId,
          judgeName: score.judgeName,
          strukturPresentasi: score.strukturPresentasi,
          teknikPenyampaian: score.teknikPenyampaian,
          penguasaanMateri: score.penguasaanMateri,
          kolaborasiTeam: score.kolaborasiTeam,
          total: score.total,
          feedback: score.feedback,
          createdAt: score.createdAt.toISOString()
        })),
        // Nilai rata-rata
        avgStruktur: Math.round(avgStruktur * 100) / 100,
        avgTeknik: Math.round(avgTeknik * 100) / 100,
        avgPenguasaan: Math.round(avgPenguasaan * 100) / 100,
        avgKolaborasi: Math.round(avgKolaborasi * 100) / 100,
        totalScore: Math.round(totalScore * 100) / 100,
        status: submission.status,
        createdAt: submission.createdAt.toISOString()
      }
    })

    // Sort by total score descending
    tableData.sort((a, b) => b.totalScore - a.totalScore)

    return NextResponse.json({
      success: true,
      data: tableData,
      total: tableData.length
    })

  } catch (error) {
    console.error('Error fetching DCC Infografis final scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
