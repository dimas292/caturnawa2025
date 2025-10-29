import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Public endpoint for DCC Short Video leaderboard
        const submissions: any[] = await (prisma as any).dCCSubmission.findMany({
            where: {
                registration: {
                    competition: { type: 'DCC_SHORT_VIDEO' }
                }
            },
            include: {
                registration: { include: { participant: { select: { fullName: true, institution: true, email: true } } } },
                shortVideoScores: { orderBy: { createdAt: 'asc' } }
            },
            orderBy: { createdAt: 'desc' }
        })

        const tableData = submissions.map((submission: any) => {
            const scores = submission.shortVideoScores || []
            const totalJudges = scores.length

            let avgSinematografi = 0
            let avgVisualBentuk = 0
            let avgVisualEditing = 0
            let avgIsiPesan = 0
            let totalScore = 0

            if (totalJudges > 0) {
                avgSinematografi = scores.reduce((sum: number, s: any) => sum + s.sinematografi, 0) / totalJudges
                avgVisualBentuk = scores.reduce((sum: number, s: any) => sum + s.visualBentuk, 0) / totalJudges
                avgVisualEditing = scores.reduce((sum: number, s: any) => sum + s.visualEditing, 0) / totalJudges
                avgIsiPesan = scores.reduce((sum: number, s: any) => sum + s.isiPesan, 0) / totalJudges
                totalScore = avgSinematografi + avgVisualBentuk + avgVisualEditing + avgIsiPesan
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
                    sinematografi: score.sinematografi,
                    visualBentuk: score.visualBentuk,
                    visualEditing: score.visualEditing,
                    isiPesan: score.isiPesan,
                    total: score.total,
                    feedback: score.feedback,
                    createdAt: score.createdAt?.toISOString()
                })),
                avgSinematografi: Math.round(avgSinematografi * 100) / 100,
                avgVisualBentuk: Math.round(avgVisualBentuk * 100) / 100,
                avgVisualEditing: Math.round(avgVisualEditing * 100) / 100,
                avgIsiPesan: Math.round(avgIsiPesan * 100) / 100,
                totalScore: Math.round(totalScore * 100) / 100,
                status: submission.status,
                qualifiedToFinal: submission.qualifiedToFinal,
                createdAt: submission.createdAt?.toISOString()
            }
        })

        tableData.sort((a: any, b: any) => b.totalScore - a.totalScore)

        const leaderboard = tableData.map((item: any, idx: number) => ({
            ...item,
            rank: idx + 1,
            isTop7: idx < 7,
            // mark qualifiedToFinal for top 7 to make frontend & consumers aware
            qualifiedToFinal: idx < 7
        }))

        const response = NextResponse.json({ success: true, competition: { type: 'DCC_SHORT_VIDEO', name: 'DCC Short Video' }, leaderboard, generatedAt: new Date().toISOString(), count: leaderboard.length })

        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET')

        return response
    } catch (error) {
        console.error('Error fetching public DCC Short Video leaderboard:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
