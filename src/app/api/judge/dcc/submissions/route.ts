import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get category from query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'DCC_INFOGRAFIS'

    // Use database queries
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const submissions = await prisma.dCCSubmission.findMany({
      where: {
        status: {
          in: ['PENDING', 'REVIEWED']
        },
        registration: {
          competition: {
            type: category
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
            },
            competition: true
          }
        },
        semifinalScores: {
          select: {
            judgeName: true,
            judgeId: true
          }
        },
        shortVideoScores: {
          select: {
            judgeName: true,
            judgeId: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const transformedSubmissions = submissions.map((submission: any) => {
      // Get scores for this submission
      const scores = category === 'DCC_SHORT_VIDEO' 
        ? submission.shortVideoScores
        : submission.semifinalScores
      
      // Count judges who have scored
      const judgesCount = scores.length
      
      // Check if current judge has already scored this submission
      const currentJudgeScored = scores.some((score: any) => score.judgeId === session.user.id)
      
      // Can be scored if: less than 3 judges OR current judge already scored (can edit)
      const canBeScored = judgesCount < 3 || currentJudgeScored
      
      // Get all judges info
      const allJudges = scores.map((score: any) => ({
        judgeId: score.judgeId,
        judgeName: score.judgeName
      }))

      const baseData = {
        id: submission.id,
        participantName: submission.registration.participant?.fullName || 'Unknown',
        institution: submission.registration.participant?.institution || 'Unknown',
        submissionTitle: submission.judulKarya,
        submittedAt: submission.createdAt.toISOString(),
        fileUrl: submission.fileKarya,
        fileName: submission.fileKarya ? `karya-${submission.id}${category === 'DCC_SHORT_VIDEO' ? '.mp4' : '.png'}` : null,
        fileSize: category === 'DCC_SHORT_VIDEO' ? '25 MB' : '4.5 MB',
        status: currentJudgeScored ? 'reviewed' : 'pending',
        notes: submission.feedback,
        judgesCount,
        currentJudgeHasScored: currentJudgeScored,
        canBeScored,
        allJudges
      }

      // Add category-specific fields
      if (category === 'DCC_SHORT_VIDEO') {
        return {
          ...baseData,
          deskripsiVideo: submission.deskripsiKarya,
          youtubeUrl: submission.fileKarya, // Assuming fileKarya stores YouTube URL for videos
          duration: '3:45' // Mock duration, you might want to store this in DB
        }
      } else {
        return {
          ...baseData,
          deskripsiKarya: submission.deskripsiKarya
        }
      }
    })

    return NextResponse.json({
      submissions: transformedSubmissions
    })

  } catch (error) {
    console.error('Error fetching DCC submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
