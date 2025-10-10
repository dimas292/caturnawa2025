import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock data for testing when database is not available
const mockSPCSubmissions = [
  {
    id: 'spc-001',
    participantName: 'Andi Pratama',
    institution: 'Universitas Indonesia',
    submissionTitle: 'Transformasi Digital: Peluang dan Tantangan bagi Generasi Muda',
    submittedAt: '2025-01-12T10:30:00Z',
    fileUrl: '/mock-files/spc-001-karya.pdf',
    fileName: 'karya-andi-pratama.pdf',
    fileSize: '2.1 MB',
    status: 'pending',
    notes: null
  },
  {
    id: 'spc-002',
    participantName: 'Sari Dewi',
    institution: 'Institut Teknologi Bandung',
    submissionTitle: 'Inovasi Teknologi untuk Sustainable Development Goals',
    submittedAt: '2025-01-12T14:15:00Z',
    fileUrl: '/mock-files/spc-002-karya.pdf',
    fileName: 'karya-sari-dewi.pdf',
    fileSize: '3.2 MB',
    status: 'pending',
    notes: null
  },
  {
    id: 'spc-003',
    participantName: 'Budi Santoso',
    institution: 'Universitas Gadjah Mada',
    submissionTitle: 'Kecerdasan Buatan: Masa Depan Pendidikan di Indonesia',
    submittedAt: '2025-01-13T09:20:00Z',
    fileUrl: '/mock-files/spc-003-karya.pdf',
    fileName: 'karya-budi-santoso.pdf',
    fileSize: '2.8 MB',
    status: 'qualified',
    notes: 'Karya yang sangat baik dengan argumen yang kuat dan struktur yang jelas.'
  },
  {
    id: 'spc-004',
    participantName: 'Maya Kusuma',
    institution: 'Universitas Airlangga',
    submissionTitle: 'Mental Health Awareness di Era Media Sosial',
    submittedAt: '2025-01-13T16:45:00Z',
    fileUrl: '/mock-files/spc-004-karya.pdf',
    fileName: 'karya-maya-kusuma.pdf',
    fileSize: '2.5 MB',
    status: 'qualified',
    notes: 'Analisis yang mendalam tentang isu kesehatan mental yang relevan.'
  },
  {
    id: 'spc-005',
    participantName: 'Rizki Firmansyah',
    institution: 'Institut Teknologi Sepuluh Nopember',
    submissionTitle: 'Revolusi Industri 4.0: Adaptasi UMKM Indonesia',
    submittedAt: '2025-01-14T11:10:00Z',
    fileUrl: '/mock-files/spc-005-karya.pdf',
    fileName: 'karya-rizki-firmansyah.pdf',
    fileSize: '3.1 MB',
    status: 'qualified',
    notes: 'Penelitian yang komprehensif dengan solusi praktis untuk UMKM.'
  },
  {
    id: 'spc-006',
    participantName: 'Putri Maharani',
    institution: 'Universitas Diponegoro',
    submissionTitle: 'Ekonomi Kreatif: Motor Penggerak Pertumbuhan Ekonomi Nasional',
    submittedAt: '2025-01-14T15:30:00Z',
    fileUrl: '/mock-files/spc-006-karya.pdf',
    fileName: 'karya-putri-maharani.pdf',
    fileSize: '2.7 MB',
    status: 'not_qualified',
    notes: 'Argumentasi perlu diperkuat dengan data yang lebih akurat.'
  },
  {
    id: 'spc-007',
    participantName: 'Ahmad Fadhil',
    institution: 'Universitas Brawijaya',
    submissionTitle: 'Good Governance: Kunci Pembangunan Berkelanjutan',
    submittedAt: '2025-01-15T08:15:00Z',
    fileUrl: '/mock-files/spc-007-karya.pdf',
    fileName: 'karya-ahmad-fadhil.pdf',
    fileSize: '2.9 MB',
    status: 'pending',
    notes: null
  },
  {
    id: 'spc-008',
    participantName: 'Dina Safitri',
    institution: 'Universitas Hasanuddin',
    submissionTitle: 'Reformasi Hukum Digital: Menjawab Tantangan Era Digital',
    submittedAt: '2025-01-15T12:40:00Z',
    fileUrl: '/mock-files/spc-008-karya.pdf',
    fileName: 'karya-dina-safitri.pdf',
    fileSize: '3.3 MB',
    status: 'pending',
    notes: null
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For testing, return mock data
    console.log('📝 Returning mock SPC submissions for testing')

    return NextResponse.json({
      submissions: mockSPCSubmissions,
      message: 'Mock data for testing - submissions loaded successfully'
    })

    /*
    // TODO: Uncomment when database is ready
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const submissions = await prisma.sPCSubmission.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const transformedSubmissions = submissions.map(submission => ({
      id: submission.id,
      participantName: submission.registration.participant?.fullName || 'Unknown',
      institution: submission.registration.participant?.institution || 'Unknown',
      submissionTitle: submission.judulKarya,
      submittedAt: submission.createdAt.toISOString(),
      fileUrl: submission.fileKarya,
      fileName: submission.fileKarya ? `karya-${submission.id}.pdf` : null,
      fileSize: '2.5 MB',
      status: submission.status.toLowerCase(),
      notes: submission.feedback
    }))

    return NextResponse.json({
      submissions: transformedSubmissions
    })
    */

  } catch (error) {
    console.error('Error fetching SPC submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}