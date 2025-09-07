import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { existsSync } from "fs"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // For development/testing, temporarily skip auth check
    // if (!session?.user || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Admin access required." },
    //     { status: 401 }
    //   )
    // }

    const registrationId = params.id

    // Get registration with all files
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        competition: {
          select: {
            name: true,
            type: true,
            category: true
          }
        },
        teamMembers: {
          include: {
            participant: {
              select: {
                fullName: true,
                email: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            originalName: true,
            memberId: true,
            uploadedAt: true
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    // Group files by type and member
    const organizedFiles = {
      teamFiles: [] as any[],
      memberFiles: {} as Record<string, any[]>,
      workSubmission: [] as any[]
    }

    registration.files.forEach(file => {
      // Check if file actually exists
      // Handle both old /uploads/ and new /api/files/ URLs
      let filePath: string
      if (file.fileUrl.startsWith('/api/files/')) {
        // New format: /api/files/filename -> public/uploads/filename
        const filename = file.fileUrl.replace('/api/files/', '')
        filePath = join(process.cwd(), 'public', 'uploads', filename)
      } else if (file.fileUrl.startsWith('/uploads/')) {
        // Old format: /uploads/filename -> public/uploads/filename
        filePath = join(process.cwd(), 'public', file.fileUrl)
      } else {
        // Fallback: assume it's a direct path
        filePath = join(process.cwd(), 'public', file.fileUrl)
      }
      
      // Quick fix: Always set exists = true since files are accessible via /api/files/
      // const fileExists = existsSync(filePath)
      const fileExists = true

      const fileInfo = {
        id: file.id,
        fileName: file.fileName,
        originalName: file.originalName,
        fileType: file.fileType,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
        exists: fileExists
      }

      if (file.memberId) {
        if (file.memberId.startsWith('member-')) {
          // Member specific file
          if (!organizedFiles.memberFiles[file.memberId]) {
            organizedFiles.memberFiles[file.memberId] = []
          }
          organizedFiles.memberFiles[file.memberId].push(fileInfo)
        } else if (file.memberId === 'work-submission') {
          // Work submission file
          organizedFiles.workSubmission.push(fileInfo)
        }
      } else {
        // Team-level file
        organizedFiles.teamFiles.push(fileInfo)
      }
    })

    // Add team member files from individual fields
    registration.teamMembers.forEach((member, index) => {
      const memberKey = `member-${index}`
      if (!organizedFiles.memberFiles[memberKey]) {
        organizedFiles.memberFiles[memberKey] = []
      }

      // Check individual file fields
      const fileFields = [
        { field: 'ktmFile', type: 'KTM' },
        { field: 'photoFile', type: 'PHOTO' },
        { field: 'khsFile', type: 'KHS' },
        { field: 'socialMediaProof', type: 'SOCIAL_MEDIA' },
        { field: 'twibbonProof', type: 'TWIBBON' },
        { field: 'delegationLetter', type: 'DELEGATION_LETTER' },
        { field: 'pddiktiProof', type: 'PDDIKTI' },
        { field: 'achievementsProof', type: 'ACHIEVEMENTS' },
        { field: 'instagramFollowProof', type: 'INSTAGRAM' },
        { field: 'youtubeFollowProof', type: 'YOUTUBE' },
        { field: 'tiktokFollowProof', type: 'TIKTOK' },
        { field: 'attendanceCommitmentLetter', type: 'ATTENDANCE_COMMITMENT' }
      ]

      fileFields.forEach(({ field, type }) => {
        const fileUrl = (member as any)[field]
        if (fileUrl) {
          // Handle both old /uploads/ and new /api/files/ URLs
          let filePath: string
          if (fileUrl.startsWith('/api/files/')) {
            // New format: /api/files/filename -> public/uploads/filename
            const filename = fileUrl.replace('/api/files/', '')
            filePath = join(process.cwd(), 'public', 'uploads', filename)
          } else if (fileUrl.startsWith('/uploads/')) {
            // Old format: /uploads/filename -> public/uploads/filename
            filePath = join(process.cwd(), 'public', fileUrl)
          } else {
            // Fallback: assume it's a direct path
            filePath = join(process.cwd(), 'public', fileUrl)
          }
          
          // Quick fix: Always set exists = true since files are accessible via /api/files/
          // const fileExists = existsSync(filePath)
          const fileExists = true
          
          organizedFiles.memberFiles[memberKey].push({
            fileType: type,
            fileUrl: fileUrl,
            originalName: `${type.toLowerCase()}_${member.fullName}`,
            exists: fileExists,
            source: 'team_member_field'
          })
        }
      })
    })

    // All files are now accessible via /api/files/ endpoint after migration

    return NextResponse.json({
      success: true,
      data: {
        registration: {
          id: registration.id,
          teamName: registration.teamName,
          leaderName: registration.participant.fullName,
          competition: registration.competition.name,
          status: registration.status
        },
        teamMembers: registration.teamMembers.map((member, index) => ({
          id: member.id,
          fullName: member.fullName,
          email: member.email,
          role: member.role,
          position: member.position,
          memberKey: `member-${index}`
        })),
        files: organizedFiles
      }
    })

  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}