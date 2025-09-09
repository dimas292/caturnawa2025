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

    // Get user's participant profile
    const participant = await prisma.participant.findUnique({
      where: { userId: session.user.id },
      include: {
        registrations: {
          include: {
            competition: true,
            teamMembers: true,
            files: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant profile not found' },
        { status: 404 }
      );
    }

    // Get all competitions
    const competitions = await prisma.competition.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    // Calculate statistics
    const totalCompetitions = competitions.length;
    const userRegistrations = participant.registrations;
    const pendingRegistrations = userRegistrations.filter(reg => 
      reg.status === 'PENDING_PAYMENT' || reg.status === 'PAYMENT_UPLOADED'
    ).length;
    const verifiedRegistrations = userRegistrations.filter(reg => 
      reg.status === 'VERIFIED'
    ).length;

    // Check which competitions user has registered for
    const competitionsWithStatus = competitions.map(comp => {
      const userRegistration = userRegistrations.find(reg => reg.competitionId === comp.id);
      
      // Determine current phase and price
      const now = new Date()
      let currentPrice = comp.phase2Price
      let currentPhase = 'PHASE_2'
      
      if (now <= comp.earlyBirdEnd) {
        currentPrice = comp.earlyBirdPrice
        currentPhase = 'EARLY_BIRD'
      } else if (now <= comp.phase1End) {
        currentPrice = comp.phase1Price
        currentPhase = 'PHASE_1'
      }

      return {
        id: comp.id,
        name: comp.name,
        shortName: comp.shortName,
        price: currentPrice, // Use current phase price
        currentPhase,
        deadline: comp.workUploadDeadline || comp.phase2End,
        registered: !!userRegistration,
        status: userRegistration?.status || 'NOT_REGISTERED',
        registrationId: userRegistration?.id || null
      };
    });

    // Get upcoming deadlines
    const now = new Date();
    const upcomingDeadlines = competitions
      .filter(comp => comp.earlyBirdEnd > now)
      .sort((a, b) => a.earlyBirdEnd.getTime() - b.earlyBirdEnd.getTime())
      .slice(0, 3);

    const response = {
      participant: {
        id: participant.id,
        fullName: participant.fullName,
        email: participant.email,
        institution: participant.institution
      },
      statistics: {
        totalCompetitions,
        pendingRegistrations,
        verifiedRegistrations,
        totalRegistrations: userRegistrations.length
      },
      competitions: competitionsWithStatus,
      upcomingDeadlines: upcomingDeadlines.map(comp => ({
        name: comp.name,
        deadline: comp.earlyBirdEnd,
        phase: 'Early Bird'
      })),
      recentRegistrations: userRegistrations.slice(0, 5).map(reg => ({
        id: reg.id,
        competitionName: reg.competition.name,
        status: reg.status,
        createdAt: reg.createdAt,
        paymentAmount: reg.paymentAmount,
        paymentPhase: reg.paymentPhase
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
