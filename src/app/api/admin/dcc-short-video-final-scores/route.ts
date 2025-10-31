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

    // Fetch all DCC Short Video submissions with their scores
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
        shortVideoScores: {
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
      const scores = submission.shortVideoScores
      const totalJudges = scores.length
      
      let avgSinematografi = 0
      let avgVisualBentuk = 0
      let avgVisualEditing = 0
      let avgIsiPesan = 0
      let totalScore = 0

      if (totalJudges > 0) {
        avgSinematografi = scores.reduce((sum, s) => sum + s.sinematografi, 0) / totalJudges
        avgVisualBentuk = scores.reduce((sum, s) => sum + s.visualBentuk, 0) / totalJudges
        avgVisualEditing = scores.reduce((sum, s) => sum + s.visualEditing, 0) / totalJudges
        avgIsiPesan = scores.reduce((sum, s) => sum + s.isiPesan, 0) / totalJudges
        totalScore = avgSinematografi + avgVisualBentuk + avgVisualEditing + avgIsiPesan
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
          angleShot: score.angleShot,
          komposisiGambar: score.komposisiGambar,
          kualitasGambar: score.kualitasGambar,
          sinematografi: score.sinematografi,
          pilihanWarna: score.pilihanWarna,
          tataKostum: score.tataKostum,
          propertiLatar: score.propertiLatar,
          kesesuaianSetting: score.kesesuaianSetting,
          visualBentuk: score.visualBentuk,
          kerapianTransisi: score.kerapianTransisi,
          ritmePemotongan: score.ritmePemotongan,
          sinkronisasiAudio: score.sinkronisasiAudio,
          kreativitasEfek: score.kreativitasEfek,
          visualEditing: score.visualEditing,
          kesesuaianTema: score.kesesuaianTema,
          kedalamanIsi: score.kedalamanIsi,
          dayaTarik: score.dayaTarik,
          isiPesan: score.isiPesan,
          total: score.total,
          feedback: score.feedback,
          createdAt: score.createdAt.toISOString()
        })),
        // Nilai rata-rata
        avgSinematografi: Math.round(avgSinematografi * 100) / 100,
        avgVisualBentuk: Math.round(avgVisualBentuk * 100) / 100,
        avgVisualEditing: Math.round(avgVisualEditing * 100) / 100,
        avgIsiPesan: Math.round(avgIsiPesan * 100) / 100,
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
    console.error('Error fetching DCC Short Video final scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
