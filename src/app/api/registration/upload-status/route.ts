import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('registrationId')

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      )
    }

    // Get current user's participant profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { participant: true }
    })

    if (!user?.participant) {
      return NextResponse.json(
        { error: "Participant profile not found" },
        { status: 404 }
      )
    }

    // Get registration with team members
    const registration = await prisma.registration.findFirst({
      where: {
        id: registrationId,
        participantId: user.participant.id
      },
      include: {
        teamMembers: true,
        competition: true
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    // Check upload status for each team member
    const uploadStatus = registration.teamMembers.map((member, index) => {
      const requiredFields = [
        'ktmFile',
        'photoFile', 
        'khsFile',
        'pddiktiProof',
        'instagramFollowProof',
        'youtubeFollowProof',
        'tiktokFollowProof',
        'twibbonProof',
        'delegationLetter',
        'attendanceCommitmentLetter'
      ]

      // For KDBI/EDC, only Debater 2 needs delegation letter
      if (registration.competition.type === 'KDBI' || registration.competition.type === 'EDC') {
        if (index === 0) { // Debater 1 doesn't need delegation letter
          const filteredFields = requiredFields.filter(field => field !== 'delegationLetter')
          return {
            memberIndex: index,
            memberName: member.fullName,
            role: index === 0 ? 'Debater 1' : 'Debater 2',
            uploadStatus: filteredFields.map(field => ({
              field,
              uploaded: !!member[field as keyof typeof member],
              fileName: member[field as keyof typeof member] || null
            })),
            totalRequired: filteredFields.length,
            totalUploaded: filteredFields.filter(field => !!member[field as keyof typeof member]).length,
            isComplete: filteredFields.every(field => !!member[field as keyof typeof member])
          }
        }
      }

      // For SPC, all fields are required for the single participant
      if (registration.competition.type === 'SPC') {
        return {
          memberIndex: index,
          memberName: member.fullName,
          role: 'Participant',
          uploadStatus: requiredFields.map(field => ({
            field,
            uploaded: !!member[field as keyof typeof member],
            fileName: member[field as keyof typeof member] || null
          })),
          totalRequired: requiredFields.length,
          totalUploaded: requiredFields.filter(field => !!member[field as keyof typeof member]).length,
          isComplete: requiredFields.every(field => !!member[field as keyof typeof member])
        }
      }

      return {
        memberIndex: index,
        memberName: member.fullName,
        role: index === 0 ? 'Debater 1' : 'Debater 2',
        uploadStatus: requiredFields.map(field => ({
          field,
          uploaded: !!member[field as keyof typeof member],
          fileName: member[field as keyof typeof member] || null
        })),
        totalRequired: requiredFields.length,
        totalUploaded: requiredFields.filter(field => !!member[field as keyof typeof member]).length,
        isComplete: requiredFields.every(field => !!member[field as keyof typeof member])
      }
    })

    const overallComplete = uploadStatus.every(member => member.isComplete)

    return NextResponse.json({
      registrationId,
      competitionType: registration.competition.type,
      teamName: registration.teamName,
      overallComplete,
      members: uploadStatus,
      summary: {
        totalMembers: uploadStatus.length,
        completedMembers: uploadStatus.filter(m => m.isComplete).length,
        totalRequiredFiles: uploadStatus.reduce((sum, m) => sum + m.totalRequired, 0),
        totalUploadedFiles: uploadStatus.reduce((sum, m) => sum + m.totalUploaded, 0)
      }
    })

  } catch (error) {
    console.error("Upload status check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
