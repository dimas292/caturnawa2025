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

    // Find participant
    const participant = await prisma.participant.findUnique({
      where: { userId: session.user.id }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    // Get DCC registrations with submissions and scores
    const registrations = await prisma.registration.findMany({
      where: {
        participantId: participant.id,
        competition: {
          type: {
            in: ['DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO']
          }
        }
      },
      include: {
        competition: true,
        dccSubmission: {
          include: {
            semifinalScores: {
              select: {
                judgeName: true,
                desainVisual: true,
                isiPesan: true,
                orisinalitas: true,
                total: true,
                feedback: true,
                createdAt: true
              }
            },
            shortVideoScores: {
              select: {
                judgeName: true,
                sinematografi: true,
                visualBentuk: true,
                visualEditing: true,
                isiPesan: true,
                total: true,
                feedback: true,
                createdAt: true
              }
            },
            finalScores: {
              select: {
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
        }
      }
    })

    // Transform data
    const results = registrations
      .filter(reg => reg.dccSubmission) // Only include registrations with submissions
      .map(reg => {
        const submission = reg.dccSubmission!
        const isShortVideo = reg.competition.type === 'DCC_SHORT_VIDEO'
        
        // Get semifinal scores
        const semifinalScores = isShortVideo 
          ? submission.shortVideoScores 
          : submission.semifinalScores

        // Calculate average semifinal score
        const avgSemifinalScore = semifinalScores.length > 0
          ? Math.round(semifinalScores.reduce((sum, s) => sum + s.total, 0) / semifinalScores.length)
          : 0

        // Calculate average final score
        const avgFinalScore = submission.finalScores.length > 0
          ? Math.round(submission.finalScores.reduce((sum, s) => sum + s.total, 0) / submission.finalScores.length)
          : 0

        return {
          competitionName: reg.competition.name,
          competitionType: reg.competition.type,
          judulKarya: submission.judulKarya,
          deskripsiKarya: submission.deskripsiKarya,
          status: submission.status,
          qualifiedToFinal: submission.qualifiedToFinal,
          presentationOrder: submission.presentationOrder,
          semifinal: {
            scores: semifinalScores.map(score => ({
              judgeName: score.judgeName,
              total: score.total,
              feedback: score.feedback,
              createdAt: score.createdAt,
              breakdown: isShortVideo ? {
                sinematografi: (score as any).sinematografi,
                visualBentuk: (score as any).visualBentuk,
                visualEditing: (score as any).visualEditing,
                isiPesan: score.isiPesan
              } : {
                desainVisual: (score as any).desainVisual,
                isiPesan: score.isiPesan,
                orisinalitas: (score as any).orisinalitas
              }
            })),
            averageScore: avgSemifinalScore,
            totalJudges: semifinalScores.length
          },
          final: {
            scores: submission.finalScores.map(score => ({
              judgeName: score.judgeName,
              total: score.total,
              feedback: score.feedback,
              createdAt: score.createdAt,
              breakdown: {
                strukturPresentasi: score.strukturPresentasi,
                teknikPenyampaian: score.teknikPenyampaian,
                penguasaanMateri: score.penguasaanMateri,
                kolaborasiTeam: score.kolaborasiTeam
              }
            })),
            averageScore: avgFinalScore,
            totalJudges: submission.finalScores.length
          }
        }
      })

    return NextResponse.json({ results })

  } catch (error) {
    console.error('Error fetching DCC scores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
