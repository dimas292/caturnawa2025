import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string
    const registrationId = formData.get('registrationId') as string
    const memberId = formData.get('memberId') as string

    if (!file || !fileType || !registrationId) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File terlalu besar. Maksimal 10MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan: JPG, PNG, PDF" },
        { status: 400 }
      )
    }

    // Check if registration exists and belongs to user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { participant: true }
    })

    if (!user?.participant) {
      return NextResponse.json(
        { error: "Profil participant tidak ditemukan" },
        { status: 404 }
      )
    }

    const registration = await prisma.registration.findFirst({
      where: {
        id: registrationId,
        participantId: user.participant.id
      },
      include: {
        teamMembers: true
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${registrationId}-${memberId}-${fileType.toLowerCase()}-${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    const fileUrl = `/uploads/${fileName}`

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update team member file field if it's a member file
    if (memberId && memberId.startsWith('member-')) {
      const memberIndex = parseInt(memberId.split('-')[1])
      const teamMember = registration.teamMembers.find(m => m.position === memberIndex + 1)
      
      if (teamMember) {
        const updateData: any = {}
        
        switch (fileType.toLowerCase()) {
          case 'ktm':
            updateData.ktmFile = fileUrl
            break
          case 'photo':
            updateData.photoFile = fileUrl
            break
          case 'khs':
            updateData.khsFile = fileUrl
            break
          case 'socialmediaproof':
            updateData.socialMediaProof = fileUrl
            break
          case 'twibbonproof':
            updateData.twibbonProof = fileUrl
            break
          case 'delegationletter':
            updateData.delegationLetter = fileUrl
            break
          case 'pddiktiproof':
            updateData.pddiktiProof = fileUrl
            break
          case 'achievementsproof':
            updateData.achievementsProof = fileUrl
            break
          case 'instagramfollowproof':
            updateData.instagramFollowProof = fileUrl
            break
          case 'youtubefollowproof':
            updateData.youtubeFollowProof = fileUrl
            break
          case 'tiktokfollowproof':
            updateData.tiktokFollowProof = fileUrl
            break
          case 'attendancecommitmentletter':
            updateData.attendanceCommitmentLetter = fileUrl
            break

        }

        await prisma.teamMember.update({
          where: { id: teamMember.id },
          data: updateData
        })
      }
    }

    // Handle work submission files
    if (memberId === 'work-submission') {
      await prisma.registration.update({
        where: { id: registrationId },
        data: {
          workFileUrl: fileUrl
        }
      })
    }

    // Create registration file record
    const registrationFile = await prisma.registrationFile.create({
      data: {
        registrationId: registrationId,
        fileName: fileName,
        fileType: fileType.toUpperCase(),
        fileUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        originalName: file.name,
        memberId: memberId || null
      }
    })

    return NextResponse.json(
      { 
        message: "File berhasil diupload",
        fileUrl: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileId: registrationFile.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload file" },
      { status: 500 }
    )
  }
}
