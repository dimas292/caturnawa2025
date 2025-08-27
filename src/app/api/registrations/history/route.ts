import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const competitionId = searchParams.get('competitionId');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      participant: {
        userId: session.user.id
      }
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (competitionId) {
      whereClause.competitionId = competitionId;
    }

    // Get user's registrations with pagination
    const registrations = await prisma.registration.findMany({
      where: whereClause,
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            shortName: true,
            category: true,
            type: true
          }
        },
        teamMembers: {
          select: {
            id: true,
            fullName: true,
            email: true,
            institution: true,
            role: true,
            position: true
          },
          orderBy: { position: 'asc' }
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileUrl: true,
            uploadedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.registration.count({
      where: whereClause
    });

    // Get all competitions for filter dropdown
    const competitions = await prisma.competition.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        shortName: true
      },
      orderBy: { name: 'asc' }
    });

    // Format response
    const formattedRegistrations = registrations.map(reg => ({
      id: reg.id,
      competition: reg.competition,
      teamName: reg.teamName,
      status: reg.status,
      paymentPhase: reg.paymentPhase,
      paymentAmount: reg.paymentAmount,
      paymentCode: reg.paymentCode,
      paymentProofUrl: reg.paymentProofUrl,
      adminNotes: reg.adminNotes,
      teamMembers: reg.teamMembers,
      files: reg.files,
      workTitle: reg.workTitle,
      workDescription: reg.workDescription,
      workFileUrl: reg.workFileUrl,
      workLinkUrl: reg.workLinkUrl,
      verifiedAt: reg.verifiedAt,
      rejectedAt: reg.rejectedAt,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt
    }));

    const response = {
      registrations: formattedRegistrations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      },
      filters: {
        competitions,
        statuses: [
          { value: 'ALL', label: 'Semua Status' },
          { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
          { value: 'PAYMENT_UPLOADED', label: 'Pembayaran Diupload' },
          { value: 'VERIFIED', label: 'Terverifikasi' },
          { value: 'REJECTED', label: 'Ditolak' },
          { value: 'COMPLETED', label: 'Selesai' }
        ]
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching registration history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
