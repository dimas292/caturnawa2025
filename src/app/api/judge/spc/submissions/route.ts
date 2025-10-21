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

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch real submissions from database with semifinal scores
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
          select: {
            judgeId: true,
            judgeName: true,
            total: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const transformedSubmissions = submissions.map(submission => {
      // Check if current judge has scored
      const currentJudgeScore = submission.semifinalScores.find(
        score => score.judgeId === session.user.id
      )
      
      // Count total judges who have scored
      const judgesCount = submission.semifinalScores.length
      
      return {
        id: submission.id,
        participantName: submission.registration.participant?.fullName || 'Unknown',
        institution: submission.registration.participant?.institution || 'Unknown',
        email: submission.registration.participant?.email || '',
        submissionTitle: submission.judulKarya,
        submittedAt: submission.createdAt.toISOString(),
        fileUrl: submission.fileKarya,
        suratOrisinalitas: submission.suratOrisinalitas,
        suratPengalihanHakCipta: submission.suratPengalihanHakCipta,
        fileName: submission.fileKarya ? submission.fileKarya.split('/').pop() : null,
        fileSize: '-', // File size not stored in DB, placeholder
        status: submission.status.toLowerCase(),
        notes: submission.feedback,
        catatan: submission.catatan,
        // Semifinal scores (legacy fields for backward compatibility)
        strukturOrganisasi: submission.strukturOrganisasi,
        kualitasArgumen: submission.kualitasArgumen,
        gayaBahasaTulis: submission.gayaBahasaTulis,
        // New scoring system info
        judgesCount,
        currentJudgeHasScored: !!currentJudgeScore,
        canBeScored: judgesCount < 3 || !!currentJudgeScore,
        allJudges: submission.semifinalScores.map(score => ({
          judgeId: score.judgeId,
          judgeName: score.judgeName,
          total: score.total
        })),
        // Final stage info
        qualifiedToFinal: submission.qualifiedToFinal,
        presentationOrder: submission.presentationOrder,
        evaluatedAt: submission.evaluatedAt?.toISOString(),
        evaluatedBy: submission.evaluatedBy
      }
    })

    return NextResponse.json({
      submissions: transformedSubmissions,
      total: transformedSubmissions.length,
      currentJudgeId: session.user.id
    })

  } catch (error) {
    console.error('Error fetching SPC submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}