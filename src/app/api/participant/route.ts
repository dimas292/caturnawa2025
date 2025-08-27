// app/api/registrations/status/route.ts
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');
    const competitionId = searchParams.get('competitionId');
    const registrationId = searchParams.get('registrationId');

    // Validate input
    if (!participantId && !registrationId) {
      return NextResponse.json(
        { error: 'Participant ID or Registration ID is required' },
        { status: 400 }
      );
    }

    let registration;

    if (registrationId) {
      // Get by registration ID
      registration = await prisma.registration.findUnique({
        where: {
          id: registrationId,
          participant: {
            userId: session.user.id // Ensure the registration belongs to the logged-in user
          }
        },
        include: {
          participant: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          competition: {
            select: {
              id: true,
              name: true,
              category: true,
              type: true
            }
          },
          teamMembers: {
            select: {
              id: true,
              fullName: true,
              email: true,
              institution: true
            }
          },
          files: {
            select: {
              id: true,
              fileType: true,
              fileUrl: true,
              fileName: true
            }
          }
        }
      });
    } else if (participantId && competitionId) {
      // Get by participant ID and competition ID
      registration = await prisma.registration.findUnique({
        where: {
          participantId_competitionId: {
            participantId,
            competitionId
          },
          participant: {
            userId: session.user.id // Ensure the registration belongs to the logged-in user
          }
        },
        include: {
          participant: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          competition: {
            select: {
              id: true,
              name: true,
              category: true,
              type: true
            }
          },
          teamMembers: {
            select: {
              id: true,
              fullName: true,
              email: true,
              institution: true
            }
          },
          files: {
            select: {
              id: true,
              fileType: true,
              fileUrl: true,
              fileName: true
            }
          }
        }
      });
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Format response
    const response = {
      id: registration.id,
      participant: registration.participant,
      competition: registration.competition,
      teamName: registration.teamName,
      status: registration.status,
      paymentPhase: registration.paymentPhase,
      paymentAmount: registration.paymentAmount,
      paymentCode: registration.paymentCode,
      paymentProofUrl: registration.paymentProofUrl,
      adminNotes: registration.adminNotes,
      agreementAccepted: registration.agreementAccepted,
      teamMembers: registration.teamMembers,
      files: registration.files,
      workTitle: registration.workTitle,
      workDescription: registration.workDescription,
      workFileUrl: registration.workFileUrl,
      workLinkUrl: registration.workLinkUrl,
      verifiedAt: registration.verifiedAt,
      rejectedAt: registration.rejectedAt,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching registration status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}