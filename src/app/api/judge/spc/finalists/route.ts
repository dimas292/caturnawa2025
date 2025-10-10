import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock finalists data for testing
const mockSPCFinalists = [
  {
    id: 'spc-003',
    participantName: 'Budi Santoso',
    institution: 'Universitas Gadjah Mada',
    presentationOrder: 1,
    status: 'waiting',
    presentationTitle: 'Kecerdasan Buatan: Masa Depan Pendidikan di Indonesia',
    scheduledTime: '09:00 - 09:15'
  },
  {
    id: 'spc-004',
    participantName: 'Maya Kusuma',
    institution: 'Universitas Airlangga',
    presentationOrder: 2,
    status: 'waiting',
    presentationTitle: 'Mental Health Awareness di Era Media Sosial',
    scheduledTime: '09:15 - 09:30'
  },
  {
    id: 'spc-005',
    participantName: 'Rizki Firmansyah',
    institution: 'Institut Teknologi Sepuluh Nopember',
    presentationOrder: 3,
    status: 'presenting',
    presentationTitle: 'Revolusi Industri 4.0: Adaptasi UMKM Indonesia',
    scheduledTime: '09:30 - 09:45'
  }
]

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

    // For testing, return mock data
    console.log('🏆 Returning mock SPC finalists for testing')

    return NextResponse.json({
      finalists: mockSPCFinalists,
      message: 'Mock data for testing - finalists loaded successfully'
    })

    /*
    // TODO: Uncomment when database is ready
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const finalists = await prisma.sPCSubmission.findMany({
      where: {
        status: 'QUALIFIED',
        qualifiedToFinal: true
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
        }
      },
      orderBy: {
        presentationOrder: 'asc'
      }
    })

    const transformedFinalists = finalists.map((finalist, index) => ({
      id: finalist.id,
      participantName: finalist.registration.participant?.fullName || 'Unknown',
      institution: finalist.registration.participant?.institution || 'Unknown',
      presentationOrder: finalist.presentationOrder || (index + 1),
      status: 'waiting',
      presentationTitle: finalist.presentationTitle || finalist.judulKarya,
      scheduledTime: finalist.scheduledTime
    }))

    return NextResponse.json({
      finalists: transformedFinalists
    })
    */

  } catch (error) {
    console.error('Error fetching SPC finalists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}