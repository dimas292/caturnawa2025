import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


export async function GET(request: NextRequest) {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get category from query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'DCC_INFOGRAFIS'

    console.log('🔍 Fetching finalists for category:', category)
    console.log('👤 Judge ID:', session.user.id)

    const finalists = await prisma.dCCSubmission.findMany({
      where: {
        qualifiedToFinal: true,
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
        semifinalScores: true,
        finalScores: {
          where: {
            judgeId: session.user.id
          }
        }
      },
      orderBy: {
        presentationOrder: 'asc'
      }
    })

    console.log('📊 Found finalists:', finalists.length)

    const transformedFinalists = finalists.map((finalist: any) => {
      // Calculate average semifinal score
      const avgSemifinalScore = finalist.semifinalScores.length > 0
        ? finalist.semifinalScores.reduce((sum: number, score: any) => sum + score.total, 0) / finalist.semifinalScores.length
        : 0

      // Check if this judge has already scored this finalist
      const hasJudgeScored = finalist.finalScores.length > 0
      const judgeScore = hasJudgeScored ? finalist.finalScores[0] : null

      const baseData = {
        id: finalist.id,
        participantName: finalist.registration.participant?.fullName || 'Unknown',
        institution: finalist.registration.participant?.institution || 'Unknown',
        submissionTitle: finalist.judulKarya,
        submittedAt: finalist.createdAt.toISOString(),
        fileUrl: finalist.fileKarya,
        fileName: finalist.fileKarya ? `karya-${finalist.id}${category === 'DCC_SHORT_VIDEO' ? '.mp4' : '.png'}` : null,
        fileSize: category === 'DCC_SHORT_VIDEO' ? '25 MB' : '4.5 MB',
        presentationOrder: finalist.presentationOrder || 1,
        scheduledTime: finalist.scheduledTime,
        semifinalScore: Math.round(avgSemifinalScore),
        hasBeenScored: hasJudgeScored,
        finalScore: judgeScore ? judgeScore.total : null
      }

      // Add category-specific fields
      if (category === 'DCC_SHORT_VIDEO') {
        return {
          ...baseData,
          deskripsiVideo: finalist.deskripsiKarya,
          youtubeUrl: finalist.fileKarya,
          duration: '4:30'
        }
      } else {
        return {
          ...baseData,
          deskripsiKarya: finalist.deskripsiKarya
        }
      }
    })

    console.log('✅ Returning', transformedFinalists.length, 'finalists')

    await prisma.$disconnect()
    
    return NextResponse.json({
      finalists: transformedFinalists
    })

  } catch (error) {
    console.error('❌ Error fetching DCC finalists:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    await prisma.$disconnect()
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
