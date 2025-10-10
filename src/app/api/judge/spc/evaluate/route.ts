import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const {
      submissionId,
      strukturOrganisasi,
      kualitasArgumen,
      gayaBahasaTulis,
      catatan,
      keputusan
    } = body

    // Validate required fields
    if (!submissionId || !strukturOrganisasi || !kualitasArgumen || !gayaBahasaTulis || !keputusan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update the SPC submission with evaluation
    const updatedSubmission = await prisma.sPCSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        strukturOrganisasi,
        kualitasArgumen,
        gayaBahasaTulis,
        feedback: catatan || null,
        status: keputusan === 'lolos' ? 'QUALIFIED' : 'NOT_QUALIFIED',
        qualifiedToFinal: keputusan === 'lolos',
        evaluatedAt: new Date(),
        evaluatedBy: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      submission: updatedSubmission
    })
  } catch (error) {
    console.error('Error evaluating SPC submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}