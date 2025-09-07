import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const registrationId = params.id

    // Get registration with all related data
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        participant: {
          include: {
            user: true
          }
        },
        competition: true,
        teamMembers: true,
        files: true
      }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    console.log(`Admin ${user.email} deleting registration ${registrationId} for ${registration.participant.fullName}`)

    // Delete physical files from filesystem
    for (const file of registration.files) {
      try {
        let filePath: string
        if (file.fileUrl.startsWith('/api/files/')) {
          // New format: /api/files/filename -> public/uploads/filename
          const filename = file.fileUrl.replace('/api/files/', '')
          filePath = join(process.cwd(), 'public', 'uploads', filename)
        } else if (file.fileUrl.startsWith('/uploads/')) {
          // Old format: /uploads/filename -> public/uploads/filename
          filePath = join(process.cwd(), 'public', file.fileUrl)
        } else {
          // Fallback
          filePath = join(process.cwd(), 'public', file.fileUrl)
        }

        if (existsSync(filePath)) {
          await unlink(filePath)
          console.log(`Deleted file: ${filePath}`)
        }
      } catch (fileError) {
        console.error(`Failed to delete file ${file.fileUrl}:`, fileError)
        // Continue with deletion even if file deletion fails
      }
    }

    // Delete database records in correct order (to avoid foreign key constraints)
    
    // 1. Delete registration files
    await prisma.registrationFile.deleteMany({
      where: { registrationId: registrationId }
    })

    // 2. Delete team members
    await prisma.teamMember.deleteMany({
      where: { registrationId: registrationId }
    })

    // 3. Delete team standings if exists
    await prisma.teamStanding.deleteMany({
      where: { registrationId: registrationId }
    })

    // 4. Delete debate scores if exists
    await prisma.debateScore.deleteMany({
      where: { 
        match: {
          OR: [
            { team1Id: registrationId },
            { team2Id: registrationId }
          ]
        }
      }
    })

    // 5. Update debate matches to remove team references
    await prisma.debateMatch.updateMany({
      where: { team1Id: registrationId },
      data: { team1Id: null }
    })

    await prisma.debateMatch.updateMany({
      where: { team2Id: registrationId },
      data: { team2Id: null }
    })

    // 6. Finally delete the registration
    await prisma.registration.delete({
      where: { id: registrationId }
    })

    // Log the deletion
    console.log(`Successfully deleted registration ${registrationId} and all related data`)

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
      data: {
        deletedRegistrationId: registrationId,
        participantName: registration.participant.fullName,
        competition: registration.competition.name,
        filesDeleted: registration.files.length
      }
    })

  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete registration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}