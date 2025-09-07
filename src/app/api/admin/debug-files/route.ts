import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check current file URLs
    const sampleFiles = await prisma.registrationFile.findMany({
      take: 10,
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
        fileType: true
      }
    })

    const samplePayments = await prisma.registration.findMany({
      where: {
        paymentProofUrl: {
          not: null
        }
      },
      take: 10,
      select: {
        id: true,
        paymentProofUrl: true
      }
    })

    const uploadsCount = await prisma.registrationFile.count({
      where: {
        fileUrl: {
          startsWith: '/uploads/'
        }
      }
    })

    const apiFilesCount = await prisma.registrationFile.count({
      where: {
        fileUrl: {
          startsWith: '/api/files/'
        }
      }
    })

    const uploadsPaymentCount = await prisma.registration.count({
      where: {
        paymentProofUrl: {
          startsWith: '/uploads/'
        }
      }
    })

    const apiPaymentCount = await prisma.registration.count({
      where: {
        paymentProofUrl: {
          startsWith: '/api/files/'
        }
      }
    })

    return NextResponse.json({
      success: true,
      counts: {
        files_uploads: uploadsCount,
        files_api: apiFilesCount,
        payments_uploads: uploadsPaymentCount,
        payments_api: apiPaymentCount
      },
      samples: {
        files: sampleFiles,
        payments: samplePayments
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get debug info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}