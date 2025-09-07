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

    // Update all file URLs from /uploads/ to /api/files/
    const updateFiles = await prisma.registrationFile.updateMany({
      where: {
        fileUrl: {
          startsWith: '/uploads/'
        }
      },
      data: {
        fileUrl: {
          // This won't work directly in Prisma, need to use raw SQL
        }
      }
    })

    // Use raw SQL to update URLs
    await prisma.$executeRaw`
      UPDATE "RegistrationFile" 
      SET "fileUrl" = REPLACE("fileUrl", '/uploads/', '/api/files/')
      WHERE "fileUrl" LIKE '/uploads/%'
    `

    // Also update registration payment proof URLs
    await prisma.$executeRaw`
      UPDATE "Registration" 
      SET "paymentProofUrl" = REPLACE("paymentProofUrl", '/uploads/', '/api/files/')
      WHERE "paymentProofUrl" LIKE '/uploads/%'
    `

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
      updatedFiles,
      updatedPayments
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to migrate file URLs' },
      { status: 500 }
    )
  }
}