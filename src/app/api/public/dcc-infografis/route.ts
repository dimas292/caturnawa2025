import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Public endpoint - returns leaderboard for DCC Infografis
        const submissions: any[] = await (prisma as any).dCCSubmission.findMany({
            where: {
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
                            select: { fullName: true, institution: true, email: true }
                        }
                    }
                },
                semifinalScores: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const tableData = submissions.map((submission: any) => {
            const scores = submission.semifinalScores || []
            const totalJudges = scores.length

            let avgDesainVisual = 0
            let avgIsiPesan = 0
            let avgOrisinalitas = 0
            let totalScore = 0

            if (totalJudges > 0) {
                avgDesainVisual = scores.reduce((sum: number, s: any) => sum + s.desainVisual, 0) / totalJudges
                avgIsiPesan = scores.reduce((sum: number, s: any) => sum + s.isiPesan, 0) / totalJudges
                avgOrisinalitas = scores.reduce((sum: number, s: any) => sum + s.orisinalitas, 0) / totalJudges
                totalScore = avgDesainVisual + avgIsiPesan + avgOrisinalitas
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
                    desainVisual: score.desainVisual,
                    isiPesan: score.isiPesan,
                    orisinalitas: score.orisinalitas,
                    total: score.total,
                    feedback: score.feedback,
                    createdAt: score.createdAt?.toISOString()
                })),
                avgDesainVisual: Math.round(avgDesainVisual * 100) / 100,
                avgIsiPesan: Math.round(avgIsiPesan * 100) / 100,
                avgOrisinalitas: Math.round(avgOrisinalitas * 100) / 100,
                totalScore: Math.round(totalScore * 100) / 100,
                status: submission.status,
                qualifiedToFinal: submission.qualifiedToFinal,
                createdAt: submission.createdAt?.toISOString()
            }
        })

        // Sort by total score desc
        tableData.sort((a: any, b: any) => b.totalScore - a.totalScore)

        // Build leaderboard-like response to match SPC design expectations
        const leaderboard = tableData.map((item: any, idx: number) => ({
            ...item,
            rank: idx + 1,
            isTop6: idx < 6
        }))

        const response = NextResponse.json({
            success: true,
            competition: { type: 'DCC_INFOGRAFIS', name: 'DCC Infografis' },
            leaderboard,
            generatedAt: new Date().toISOString(),
            count: leaderboard.length
        })

        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET')

        return response
    } catch (error) {
        console.error('Error fetching public DCC Infografis leaderboard:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
