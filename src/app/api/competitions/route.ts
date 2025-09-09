import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get competitions from database
    const competitions = await prisma.competition.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    // Transform database data to match frontend expectations
    const transformedCompetitions = competitions.map(comp => {
      // Map database type to frontend ID
      const typeMap: Record<string, string> = {
        'KDBI': 'kdbi',
        'EDC': 'edc', 
        'SPC': 'spc',
        'DCC_INFOGRAFIS': 'dcc-infografis',
        'DCC_SHORT_VIDEO': 'dcc-short-video'
      }

      // Determine current phase and price
      const now = new Date()
      let currentPhase = 'PHASE_2'
      let currentPrice = comp.phase2Price
      
      if (now <= comp.earlyBirdEnd) {
        currentPhase = 'EARLY_BIRD'
        currentPrice = comp.earlyBirdPrice
      } else if (now <= comp.phase1End) {
        currentPhase = 'PHASE_1'
        currentPrice = comp.phase1Price
      }

      // Determine team size text
      let teamSizeText = 'Individual'
      if (comp.maxTeamSize === 2) {
        teamSizeText = '2 people'
      } else if (comp.maxTeamSize > 2) {
        teamSizeText = `Max ${comp.maxTeamSize} people`
      }

      return {
        id: typeMap[comp.type] || comp.type.toLowerCase(),
        name: comp.name,
        shortName: comp.shortName,
        type: comp.type,
        category: comp.category,
        teamSize: teamSizeText,
        maxMembers: comp.maxTeamSize,
        minMembers: comp.minTeamSize,
        pricing: {
          earlyBird: comp.earlyBirdPrice,
          phase1: comp.phase1Price,
          phase2: comp.phase2Price
        },
        earlyBirdStart: comp.earlyBirdStart,
        earlyBirdEnd: comp.earlyBirdEnd,
        phase1Start: comp.phase1Start,
        phase1End: comp.phase1End,
        phase2Start: comp.phase2Start,
        phase2End: comp.phase2End,
        workUploadDeadline: comp.workUploadDeadline,
        competitionDate: comp.competitionDate,
        // Current status
        currentPhase,
        currentPrice,
        isActive: comp.isActive
      }
    })

    return NextResponse.json(transformedCompetitions)
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    )
  }
}
