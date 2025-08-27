import { CompetitionData } from "@/types/registration"

export const competitions: CompetitionData[] = [
  {
    id: "kdbi",
    name: "Kompetisi Debat Bahasa Indonesia",
    shortName: "KDBI",
    icon: "🗣️",
    teamSize: "2 orang",
    maxMembers: 2,
    minMembers: 2,
    category: "debate",
    pricing: { earlyBird: 150000, phase1: 250000, phase2: 300000 }
  },
  {
    id: "edc",
    name: "English Debate Competition",
    shortName: "EDC",
    icon: "💬",
    teamSize: "2 orang",
    maxMembers: 2,
    minMembers: 2,
    category: "debate",
    pricing: { earlyBird: 150000, phase1: 250000, phase2: 300000 }
  },
  {
    id: "spc",
    name: "Scientific Paper Competition",
    shortName: "SPC",
    icon: "📝",
    teamSize: "Individual",
    maxMembers: 1,
    minMembers: 1,
    category: "academic",
    pricing: { earlyBird: 115000, phase1: 135000, phase2: 150000 }
  },
  {
    id: "dcc-infografis",
    name: "Digital Content - Infografis",
    shortName: "DCC Infografis",
    icon: "🎨",
    teamSize: "Max 3 orang",
    maxMembers: 3,
    minMembers: 1,
    category: "creative",
    pricing: { earlyBird: 50000, phase1: 65000, phase2: 75000 }
  },
  {
    id: "dcc-video",
    name: "Digital Content - Short Video",
    shortName: "DCC Short Video",
    icon: "🎬",
    teamSize: "Max 3 orang",
    maxMembers: 3,
    minMembers: 1,
    category: "creative",
    pricing: { earlyBird: 50000, phase1: 65000, phase2: 75000 }
  }
]

export const getCurrentPhase = () => {
  const now = new Date()
  const earlyBirdEnd = new Date("2025-08-31")
  const phase1End = new Date("2025-09-13")
  const phase2End = new Date("2025-09-26")

  if (now <= earlyBirdEnd) return "earlyBird"
  if (now <= phase1End) return "phase1"
  if (now <= phase2End) return "phase2"
  return "closed"
}

export const getCurrentPrice = (competition: CompetitionData) => {
  const phase = getCurrentPhase()
  return competition.pricing[phase as keyof typeof competition.pricing] || 0
}

export const getPhaseLabel = () => {
  const phase = getCurrentPhase()
  switch (phase) {
    case "earlyBird": return "Early Bird"
    case "phase1": return "Phase 1"
    case "phase2": return "Phase 2"
    default: return "Closed"
  }
}
