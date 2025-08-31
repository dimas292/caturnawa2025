import { CompetitionData } from "@/types/registration"

export const competitions: CompetitionData[] = [
  {
    id: "kdbi",
    name: "Indonesian Language Debate Competition",
    shortName: "KDBI",
    type: "KDBI",
    category: "debate",
    teamSize: "2 people",
    maxMembers: 2,
    minMembers: 2,
    pricing: { earlyBird: 150000, phase1: 250000, phase2: 300000 }
  },
  {
    id: "edc",
    name: "English Debate Competition",
    shortName: "EDC",
    type: "EDC",
    category: "debate",
    teamSize: "2 people",
    maxMembers: 2,
    minMembers: 2,
    pricing: { earlyBird: 150000, phase1: 250000, phase2: 300000 }
  },
  {
    id: "spc",
    name: "Scientific Paper Competition",
    shortName: "SPC",
    type: "SPC",
    category: "academic",
    teamSize: "Individual",
    maxMembers: 1,
    minMembers: 1,
    pricing: { earlyBird: 115000, phase1: 135000, phase2: 150000 }
  },
  {
    id: "dcc-infografis",
    name: "Digital Content - Infographics",
    shortName: "DCC Infographics",
    type: "DCC_INFOGRAFIS",
    category: "creative",
    teamSize: "Max 3 people",
    maxMembers: 3,
    minMembers: 1,
    pricing: { earlyBird: 50000, phase1: 65000, phase2: 75000 }
  },
  {
    id: "dcc-video",
    name: "Digital Content - Short Video",
    shortName: "DCC Short Video",
    type: "DCC_SHORT_VIDEO",
    category: "creative",
    teamSize: "Max 3 people",
    maxMembers: 3,
    minMembers: 1,
    pricing: { earlyBird: 50000, phase1: 65000, phase2: 75000 }
  }
]

export const getCurrentPhase = () => {
  const now = new Date()
  const earlyBirdEnd = new Date("2025-08-31")
  const phase1End = new Date("2025-09-13")
  const phase2End = new Date("2025-09-26")

  if (now <= earlyBirdEnd) return "EARLY_BIRD"
  if (now <= phase1End) return "PHASE_1"
  if (now <= phase2End) return "PHASE_2"
  return "closed"
}

export const getCurrentPrice = (competition: CompetitionData) => {
  const phase = getCurrentPhase()
  switch (phase) {
    case "EARLY_BIRD": return competition.pricing.earlyBird
    case "PHASE_1": return competition.pricing.phase1
    case "PHASE_2": return competition.pricing.phase2
    default: return 0
  }
}

export const getPhaseLabel = () => {
  const phase = getCurrentPhase()
  switch (phase) {
    case "EARLY_BIRD": return "Early Bird"
    case "PHASE_1": return "Phase 1"
    case "PHASE_2": return "Phase 2"
    default: return "Closed"
  }
}
