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

    // Get participant profile
    const participant = await prisma.participant.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        gender: true,
        fullAddress: true,
        whatsappNumber: true,
        institution: true,
        faculty: true,
        studyProgram: true,
        studentId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(participant);

  } catch (error) {
    console.error('Error fetching participant profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      fullName,
      email,
      gender,
      fullAddress,
      whatsappNumber,
      institution,
      faculty,
      studyProgram,
      studentId
    } = body;

    // Validate required fields
    if (!fullName || !email || !gender || !fullAddress || !whatsappNumber || !institution) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Update participant profile
    const updatedParticipant = await prisma.participant.update({
      where: { userId: session.user.id },
      data: {
        fullName,
        email,
        gender,
        fullAddress,
        whatsappNumber,
        institution,
        faculty: faculty || null,
        studyProgram: studyProgram || null,
        studentId: studentId || null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        gender: true,
        fullAddress: true,
        whatsappNumber: true,
        institution: true,
        faculty: true,
        studyProgram: true,
        studentId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedParticipant);

  } catch (error) {
    console.error('Error updating participant profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
