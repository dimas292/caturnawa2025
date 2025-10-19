import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'judge') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { submissionId } = params

    // Get submission
    const submission = await prisma.dCCSubmission.findUnique({
      where: { id: submissionId },
      include: {
        registration: {
          include: {
            participant: {
              include: {
                user: true
              }
            },
            competition: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (!submission.fileKarya) {
      return NextResponse.json(
        { error: 'No file attached to this submission' },
        { status: 404 }
      )
    }

    // Check if it's a URL (Google Drive, YouTube, etc.)
    if (submission.fileKarya.startsWith('http://') || submission.fileKarya.startsWith('https://')) {
      // Redirect to external URL
      return NextResponse.redirect(submission.fileKarya)
    }

    // Handle local file
    const filePath = path.join(process.cwd(), 'public', submission.fileKarya)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath)
    const fileName = path.basename(submission.fileKarya)
    
    // Determine content type
    const ext = path.extname(fileName).toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === '.pdf') contentType = 'application/pdf'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.gif') contentType = 'image/gif'
    else if (ext === '.svg') contentType = 'image/svg+xml'
    else if (ext === '.mp4') contentType = 'video/mp4'
    else if (ext === '.webm') contentType = 'video/webm'

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error downloading DCC file:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}

// HEAD request to check if file exists
export async function HEAD(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'judge') {
      return new NextResponse(null, { status: 401 })
    }

    const { submissionId } = params

    const submission = await prisma.dCCSubmission.findUnique({
      where: { id: submissionId },
      select: { fileKarya: true }
    })

    if (!submission || !submission.fileKarya) {
      return new NextResponse(null, { status: 404 })
    }

    // If external URL, return OK
    if (submission.fileKarya.startsWith('http://') || submission.fileKarya.startsWith('https://')) {
      return new NextResponse(null, { status: 200 })
    }

    // Check local file
    const filePath = path.join(process.cwd(), 'public', submission.fileKarya)
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(null, { status: 200 })

  } catch (error) {
    console.error('Error checking DCC file:', error)
    return new NextResponse(null, { status: 500 })
  }
}
