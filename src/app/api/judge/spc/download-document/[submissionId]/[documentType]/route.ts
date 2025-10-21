import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string; documentType: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge or admin
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { submissionId, documentType } = params

    // Validate document type
    if (!['karya', 'orisinalitas', 'hakcipta'].includes(documentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    // Find submission
    const submission = await prisma.sPCSubmission.findUnique({
      where: { id: submissionId },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Get the appropriate file URL based on document type
    let fileUrl: string | null = null
    let documentName = ''

    switch (documentType) {
      case 'karya':
        fileUrl = submission.fileKarya
        documentName = 'Karya'
        break
      case 'orisinalitas':
        fileUrl = submission.suratOrisinalitas
        documentName = 'Surat-Orisinalitas'
        break
      case 'hakcipta':
        fileUrl = submission.suratPengalihanHakCipta
        documentName = 'Surat-Pengalihan-Hak-Cipta'
        break
    }

    if (!fileUrl) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Get file path
    const filePath = join(process.cwd(), 'public', fileUrl)

    if (!existsSync(filePath)) {
      return NextResponse.json({ 
        error: 'File does not exist on server', 
        details: `Path: ${fileUrl}` 
      }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Get filename
    const fileName = fileUrl.split('/').pop() || 'document.pdf'
    const participantName = submission.registration.participant?.fullName || 'unknown'
    const downloadFileName = `SPC-${participantName.replace(/\s+/g, '-')}-${documentName}-${fileName}`

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadFileName}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error downloading SPC document:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
