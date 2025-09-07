import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all files that need to be updated
    const filesToUpdate = await prisma.registrationFile.findMany({
      where: {
        fileUrl: {
          startsWith: '/uploads/'
        }
      }
    })

    const paymentsToUpdate = await prisma.registration.findMany({
      where: {
        paymentProofUrl: {
          startsWith: '/uploads/'
        }
      }
    })

    console.log(`Found ${filesToUpdate.length} files and ${paymentsToUpdate.length} payments to update`)

    // Update file URLs one by one
    for (const file of filesToUpdate) {
      const newUrl = file.fileUrl.replace('/uploads/', '/api/files/')
      await prisma.registrationFile.update({
        where: { id: file.id },
        data: { fileUrl: newUrl }
      })
    }

    // Update payment proof URLs one by one
    for (const payment of paymentsToUpdate) {
      if (payment.paymentProofUrl) {
        const newUrl = payment.paymentProofUrl.replace('/uploads/', '/api/files/')
        await prisma.registration.update({
          where: { id: payment.id },
          data: { paymentProofUrl: newUrl }
        })
      }
    }

    // Get count of updated records
    const updatedFiles = await prisma.registrationFile.count({
      where: {
        fileUrl: {
          startsWith: '/api/files/'
        }
      }
    })

    const updatedPayments = await prisma.registration.count({
      where: {
        paymentProofUrl: {
          startsWith: '/api/files/'
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'File URLs migrated successfully',
      updatedFiles: filesToUpdate.length,
      updatedPayments: paymentsToUpdate.length,
      totalUpdated: filesToUpdate.length + paymentsToUpdate.length
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to migrate file URLs',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}