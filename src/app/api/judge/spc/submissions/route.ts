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

    // Fetch real submissions from database
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const transformedSubmissions = submissions.map(submission => ({
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
      status: submission.status.toLowerCase(),
      notes: submission.feedback,
      catatan: submission.catatan,
      // Semifinal scores
      strukturOrganisasi: submission.strukturOrganisasi,
      kualitasArgumen: submission.kualitasArgumen,
      gayaBahasaTulis: submission.gayaBahasaTulis,
      // Final stage info
      qualifiedToFinal: submission.qualifiedToFinal,
      presentationOrder: submission.presentationOrder,
      evaluatedAt: submission.evaluatedAt?.toISOString(),
      evaluatedBy: submission.evaluatedBy
    }))

    return NextResponse.json({
      submissions: transformedSubmissions,
      total: transformedSubmissions.length
    })

  } catch (error) {
    console.error('Error fetching SPC submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}