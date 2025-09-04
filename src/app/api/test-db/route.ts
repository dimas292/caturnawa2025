import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    console.log("Testing database connection...")
    
    // Check if we can connect to database
    await prisma.$connect()
    console.log("✅ Database connected successfully")
    
    // Test basic queries
    const userCount = await prisma.user.count()
    const participantCount = await prisma.participant.count()
    const registrationCount = await prisma.registration.count()
    const competitionCount = await prisma.competition.count()
    
    console.log("Database counts:", {
      users: userCount,
      participants: participantCount,
      registrations: registrationCount,
      competitions: competitionCount
    })
    
    // Try to get a sample registration with all relations
    const sampleRegistration = await prisma.registration.findFirst({
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        competition: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        teamMembers: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: "Database connection test successful",
      data: {
        counts: {
          users: userCount,
          participants: participantCount,
          registrations: registrationCount,
          competitions: competitionCount
        },
        sampleRegistration: sampleRegistration ? {
          id: sampleRegistration.id,
          status: sampleRegistration.status,
          participant: sampleRegistration.participant?.fullName,
          competition: sampleRegistration.competition?.name,
          teamMembersCount: sampleRegistration.teamMembers.length
        } : null
      }
    })
    
  } catch (error) {
    console.error("❌ Database test failed:", error)
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}