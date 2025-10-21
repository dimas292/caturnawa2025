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

    // Fetch all SPC submissions with their semifinal scores
    const submissions = await prisma.sPCSubmission.findMany({
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
        semifinalScores: {
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
      const scores = submission.semifinalScores
      const totalJudges = scores.length
      
      let avgPenilaian = 0
      let avgSubstansi = 0
      let avgKualitas = 0
      let totalScore = 0

      if (totalJudges > 0) {
        avgPenilaian = scores.reduce((sum, s) => sum + s.penilaianKaryaTulisIlmiah, 0) / totalJudges
        avgSubstansi = scores.reduce((sum, s) => sum + s.substansiKaryaTulisIlmiah, 0) / totalJudges
        avgKualitas = scores.reduce((sum, s) => sum + s.kualitasKaryaTulisIlmiah, 0) / totalJudges
        totalScore = avgPenilaian + avgSubstansi + avgKualitas
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
          penilaianKaryaTulisIlmiah: score.penilaianKaryaTulisIlmiah,
          substansiKaryaTulisIlmiah: score.substansiKaryaTulisIlmiah,
          kualitasKaryaTulisIlmiah: score.kualitasKaryaTulisIlmiah,
          catatanPenilaian: score.catatanPenilaian,
          catatanSubstansi: score.catatanSubstansi,
          catatanKualitas: score.catatanKualitas,
          total: score.total,
          createdAt: score.createdAt.toISOString()
        })),
        // Nilai rata-rata
        avgPenilaian: Math.round(avgPenilaian * 100) / 100,
        avgSubstansi: Math.round(avgSubstansi * 100) / 100,
        avgKualitas: Math.round(avgKualitas * 100) / 100,
        totalScore: Math.round(totalScore * 100) / 100,
        status: submission.status,
        qualifiedToFinal: submission.qualifiedToFinal,
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
    console.error('Error fetching SPC semifinal scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
