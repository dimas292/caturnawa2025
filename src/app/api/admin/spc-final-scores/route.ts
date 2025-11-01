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

    // Fetch all SPC submissions with their final scores
    // Cast prisma to any because Prisma client model names use unconventional casing in generated client
    const submissions = await (prisma as any).sPCSubmission.findMany({
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
    const tableData: any[] = submissions.map((submission: any) => {
      // Hitung rata-rata dari semua juri
      const scores = submission.finalScores
      const totalJudges = scores.length

      let avgPemaparan = 0
      let avgPertanyaan = 0
      let avgKesesuaian = 0
      let totalScore = 0

      if (totalJudges > 0) {
        avgPemaparan = scores.reduce((sum: number, s: any) => sum + (s.pemaparanMateriPresentasi || 0), 0) / totalJudges
        avgPertanyaan = scores.reduce((sum: number, s: any) => sum + (s.pertanyaanJawaban || 0), 0) / totalJudges
        avgKesesuaian = scores.reduce((sum: number, s: any) => sum + (s.aspekKesesuaianTema || 0), 0) / totalJudges
        totalScore = avgPemaparan + avgPertanyaan + avgKesesuaian
      }

      return {
        id: submission.id,
        participantName: submission.registration.participant?.fullName || 'Unknown',
        institution: submission.registration.participant?.institution || 'Unknown',
        email: submission.registration.participant?.email || '',
        judulKarya: submission.judulKarya,
        judgesCount: totalJudges,
        judges: (scores as any[]).map((score: any) => ({
          judgeId: score.judgeId,
          judgeName: score.judgeName,
          pemaparanMateriPresentasi: score.pemaparanMateriPresentasi,
          pertanyaanJawaban: score.pertanyaanJawaban,
          aspekKesesuaianTema: score.aspekKesesuaianTema,
          catatanPemaparan: score.catatanPemaparan,
          catatanPertanyaan: score.catatanPertanyaan,
          catatanKesesuaian: score.catatanKesesuaian,
          total: score.total,
          feedback: score.feedback,
          createdAt: score.createdAt.toISOString()
        })),
        // Nilai rata-rata (provide both original names and admin-expected aliases)
        avgPemaparan: Math.round(avgPemaparan * 100) / 100,
        avgPertanyaan: Math.round(avgPertanyaan * 100) / 100,
        avgKesesuaian: Math.round(avgKesesuaian * 100) / 100,
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
    console.error('Error fetching SPC final scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
