import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        type: true,
        category: true,
        description: true,
        earlyBirdPrice: true,
        phase1Price: true,
        phase2Price: true,
        earlyBirdStart: true,
        earlyBirdEnd: true,
        phase1Start: true,
        phase1End: true,
        phase2Start: true,
        phase2End: true,
        maxTeamSize: true,
        minTeamSize: true,
        workUploadDeadline: true,
        competitionDate: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform data to match frontend interface
    const transformedCompetitions = competitions.map(comp => ({
      id: comp.id,
      name: comp.name,
      shortName: comp.shortName,
      type: comp.type,
      category: comp.category,
      description: comp.description,
      teamSize: comp.maxTeamSize === 1 ? "Individual" : `${comp.minTeamSize}-${comp.maxTeamSize} people`,
      maxMembers: comp.maxTeamSize,
      minMembers: comp.minTeamSize,
      pricing: {
        earlyBird: comp.earlyBirdPrice,
        phase1: comp.phase1Price,
        phase2: comp.phase2Price
      },
      // Add phase dates for frontend logic
      earlyBirdStart: comp.earlyBirdStart,
      earlyBirdEnd: comp.earlyBirdEnd,
      phase1Start: comp.phase1Start,
      phase1End: comp.phase1End,
      phase2Start: comp.phase2Start,
      phase2End: comp.phase2End,
      workUploadDeadline: comp.workUploadDeadline,
      competitionDate: comp.competitionDate,
    }))

    return NextResponse.json(transformedCompetitions)
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    )
  }
}
