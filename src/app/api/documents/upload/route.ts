import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const registrationId = formData.get('registrationId') as string
    const fileType = formData.get('fileType') as string

    if (!file || !registrationId || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and PDF are allowed" },
        { status: 400 }
      )
    }

    // Get user's participant data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        participant: true
      }
    })

    if (!user?.participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      )
    }

    // Verify registration belongs to this participant
    const registration = await prisma.registration.findFirst({
      where: {
        id: registrationId,
        participantId: user.participant.id
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
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
    const fileName = `${timestamp}-${registrationId}-${fileType}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    
    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Create file URL - use API endpoint for better production compatibility
    const fileUrl = `/api/files/${fileName}`

    // Extract member ID if fileType contains member ID
    let memberId: string | null = null
    const actualFileType = fileType.includes('_') ? fileType.split('_')[0] : fileType
    if (fileType.includes('_')) {
      const parts = fileType.split('_')
      if (parts.length === 2) {
        memberId = parts[1]
      }
    }

    // Check if file already exists and delete old one
    const existingFile = await prisma.registrationFile.findFirst({
      where: {
        registrationId: registrationId,
        fileType: actualFileType,
        memberId: memberId
      }
    })

    if (existingFile) {
      // Delete the old file from filesystem
      const oldFilePath = join(process.cwd(), 'public', existingFile.fileUrl.replace('/', ''))
      if (existsSync(oldFilePath)) {
        try {
          await require('fs/promises').unlink(oldFilePath)
        } catch (error) {
          console.log('Could not delete old file:', error)
        }
      }

      // Update existing record instead of creating new one
      const fileRecord = await prisma.registrationFile.update({
        where: { id: existingFile.id },
        data: {
          fileName: fileName,
          originalName: file.name,
          fileUrl: fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        message: "Document updated successfully",
        data: fileRecord
      })
    } else {
      // Create new file record
      const fileRecord = await prisma.registrationFile.create({
        data: {
          registrationId: registrationId,
          fileName: fileName,
          originalName: file.name,
          fileType: actualFileType,
          fileUrl: fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          memberId: memberId,
          uploadedAt: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        message: "Document uploaded successfully",
        data: fileRecord
      })
    }

  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}