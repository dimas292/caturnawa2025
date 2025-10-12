import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCurrentPhaseForCompetition, getCurrentPrice } from "@/lib/competitions"

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

    const body = await request.json()
    const {
      competitionId,
      teamName,
      members,
      workSubmission,
      agreement,
      paymentProof
    } = body

    // Validate required fields
    if (!competitionId || !members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      )
    }

    if (!agreement) {
      return NextResponse.json(
        { error: "Anda harus menyetujui syarat dan ketentuan" },
        { status: 400 }
      )
    }

    // Get competition details - map frontend ID to competition type
    const competitionTypeMap: Record<string, string> = {
      'kdbi': 'KDBI',
      'edc': 'EDC', 
      'spc': 'SPC',
      'dcc-infografis': 'DCC_INFOGRAFIS',
      'dcc-short-video': 'DCC_SHORT_VIDEO'
    }
    
    const competitionType = competitionTypeMap[competitionId]

    if (!competitionType) {
      return NextResponse.json(
        { error: "Kompetisi tidak ditemukan" },
        { status: 404 }
      )
    }

    const competition = await prisma.competition.findUnique({
      where: { type: competitionType as any }
    })

    if (!competition) {
      return NextResponse.json(
        { error: "Kompetisi tidak ditemukan" },
        { status: 404 }
      )
    }

    // Get current user's participant profile
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

    // Check if user already registered for this competition
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        participantId_competitionId: {
          participantId: user.participant.id,
          competitionId: competition.id
        }
      }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: "Anda sudah terdaftar untuk kompetisi ini" },
        { status: 400 }
      )
    }

    // Determine payment phase and amount using the corrected competition functions
    const competitionData = {
      id: competition.id,
      name: competition.name,
      shortName: competition.shortName,
      type: competition.type,
      category: competition.category,
      teamSize: competition.teamSize,
      maxMembers: competition.maxMembers,
      minMembers: competition.minMembers,
      pricing: {
        earlyBird: competition.earlyBirdPrice,
        phase1: competition.phase1Price,
        phase2: competition.phase2Price
      },
      earlyBirdStart: competition.earlyBirdStart,
      earlyBirdEnd: competition.earlyBirdEnd,
      phase1Start: competition.phase1Start,
      phase1End: competition.phase1End,
      phase2Start: competition.phase2Start,
      phase2End: competition.phase2End,
      workUploadDeadline: competition.workUploadDeadline,
      competitionDate: competition.competitionDate
    }

    const paymentPhase = getCurrentPhaseForCompetition(competitionData)
    const paymentAmount = getCurrentPrice(competitionData)

    // Generate payment code
    const paymentCode = `PAY-${Date.now().toString().slice(-6)}`

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        participantId: user.participant.id,
        competitionId: competition.id,
        teamName: teamName || null,
        paymentPhase: paymentPhase as any,
        paymentAmount: paymentAmount,
        paymentCode: paymentCode,
        agreementAccepted: agreement,
        status: "PENDING_PAYMENT"
      }
    })

    // Create team members - simplified approach
    for (let i = 0; i < members.length; i++) {
      const member = members[i]
      
      // For team leader (first member), update the existing participant profile
      if (i === 0 && member.role === "LEADER") {
        await prisma.participant.update({
          where: { id: user.participant.id },
          data: {
            fullName: member.fullName,
            email: member.email,
            gender: member.gender,
            fullAddress: member.fullAddress,
            whatsappNumber: member.phone,
            institution: member.institution,
            faculty: member.faculty || user.participant.faculty,
            studyProgram: member.studyProgram || user.participant.studyProgram,
            studentId: member.studentId || user.participant.studentId
          }
        })
      }

      // Create team member record for all members (including leader)
      await prisma.teamMember.create({
        data: {
          registrationId: registration.id,
          participantId: user.participant.id, // Always use the registering user's participant ID
          role: member.role,
          position: i + 1,
          fullName: member.fullName,
          email: member.email,
          phone: member.phone,
          institution: member.institution,
          faculty: member.faculty,
          studentId: member.studentId || ""
        }
      })
    }

    // Create work submission if provided
    if (workSubmission && (workSubmission.title || workSubmission.description)) {
      await prisma.registration.update({
        where: { id: registration.id },
        data: {
          workTitle: workSubmission.title,
          workDescription: workSubmission.description,
          workFileUrl: workSubmission.file ? "pending_upload" : null,
          workLinkUrl: workSubmission.link || null
        }
      })
    }

    // Handle file uploads for team members and work submission
    // Note: Files are stored locally in the frontend and need to be uploaded separately
    // The frontend will handle file uploads after registration creation

    return NextResponse.json(
      { 
        message: "Pendaftaran berhasil",
        registrationId: registration.id,
        paymentAmount: paymentAmount,
        paymentCode: paymentCode
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
