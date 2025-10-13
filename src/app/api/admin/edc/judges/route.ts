// src/app/api/admin/edc/judges/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with role 'judge'
    const judges = await prisma.user.findMany({
      where: {
        role: 'judge'
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ judges })
  } catch (error) {
    console.error('Error fetching judges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch judges' },
      { status: 500 }
    )
  }
}
