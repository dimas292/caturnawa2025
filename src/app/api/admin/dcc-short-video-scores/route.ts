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
        registration: {
          competition: {
            type: 'DCC_SHORT_VIDEO'
          }
        }
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
      
      let avgKonsepKreatif = 0
      let avgProduksiVideo = 0
      let avgPenyampaianPesan = 0
      let totalScore = 0

      if (totalJudges > 0) {
        avgKonsepKreatif = scores.reduce((sum: number, s: any) => sum + s.konsepKreatif, 0) / totalJudges
        avgProduksiVideo = scores.reduce((sum: number, s: any) => sum + s.produksiVideo, 0) / totalJudges
        avgPenyampaianPesan = scores.reduce((sum: number, s: any) => sum + s.penyampaianPesan, 0) / totalJudges
        totalScore = avgKonsepKreatif + avgProduksiVideo + avgPenyampaianPesan
      }

      return {
        id: submission.id,
        participantName: submission.registration.participant?.fullName || 'Unknown',
        institution: submission.registration.participant?.institution || 'Unknown',
        email: submission.registration.participant?.email || '',
        judulKarya: submission.judulKarya,
        judgesCount: totalJudges,
        judges: scores.map((score: any) => ({
          judgeId: score.judgeId,
          judgeName: score.judgeName,
          konsepKreatif: score.konsepKreatif,
          produksiVideo: score.produksiVideo,
          penyampaianPesan: score.penyampaianPesan,
          total: score.total,
          feedback: score.feedback,
          createdAt: score.createdAt.toISOString()
        })),
        // Nilai rata-rata
        avgKonsepKreatif: Math.round(avgKonsepKreatif * 100) / 100,
        avgProduksiVideo: Math.round(avgProduksiVideo * 100) / 100,
        avgPenyampaianPesan: Math.round(avgPenyampaianPesan * 100) / 100,
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
    console.error('Error fetching DCC Short Video scores:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
