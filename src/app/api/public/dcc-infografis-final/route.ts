import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all DCC Infografis submissions with their FINAL scores
    const submissions = await prisma.dCCSubmission.findMany({
      where: {
        qualifiedToFinal: true,
        registration: {
          competition: {
            type: 'DCC_INFOGRAFIS'
          }
        }
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true
              }
            }
          }
        },
        finalScores: {
          select: {
            judgeId: true,
            judgeName: true,
            strukturPresentasi: true,
            teknikPenyampaian: true,
            penguasaanMateri: true,
            kolaborasiTeam: true,
            total: true,
            feedback: true,
            createdAt: true
          }
        }
      }
    })

    // Transform data untuk leaderboard
    const leaderboard = submissions.map((submission: any) => {
      const scores = submission.finalScores || []
      const totalJudges = scores.length
      
      let avgStruktur = 0
      let avgTeknik = 0
      let avgPenguasaan = 0
      let avgKolaborasi = 0
      let totalScore = 0

      if (totalJudges > 0) {
        avgStruktur = scores.reduce((sum: number, s: any) => sum + s.strukturPresentasi, 0) / totalJudges
        avgTeknik = scores.reduce((sum: number, s: any) => sum + s.teknikPenyampaian, 0) / totalJudges
        avgPenguasaan = scores.reduce((sum: number, s: any) => sum + s.penguasaanMateri, 0) / totalJudges
        avgKolaborasi = scores.reduce((sum: number, s: any) => sum + s.kolaborasiTeam, 0) / totalJudges
        totalScore = avgStruktur + avgTeknik + avgPenguasaan + avgKolaborasi
      }

      return {
        id: submission.id,
        participantName: submission.registration.participant?.fullName || 'Unknown',
        institution: submission.registration.participant?.institution || 'Unknown',
        judulKarya: submission.judulKarya,
        judgesCount: totalJudges,
        judges: scores.map((score: any) => ({
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
        avgStruktur: Number(avgStruktur.toFixed(2)),
        avgTeknik: Number(avgTeknik.toFixed(2)),
        avgPenguasaan: Number(avgPenguasaan.toFixed(2)),
        avgKolaborasi: Number(avgKolaborasi.toFixed(2)),
        totalScore: Number(totalScore.toFixed(2))
      }
    })

    // Sort by total score descending
    leaderboard.sort((a: any, b: any) => b.totalScore - a.totalScore)

    // Add rank and top 3 flag
    const rankedLeaderboard = leaderboard.map((item: any, index: number) => ({
      ...item,
      rank: index + 1,
      isTop3: index < 3
    }))

    return NextResponse.json({
      success: true,
      leaderboard: rankedLeaderboard
    })

  } catch (error) {
    console.error('Error fetching DCC Infografis final leaderboard:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
