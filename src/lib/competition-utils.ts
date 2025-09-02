import { CompetitionData } from "@/types/registration"

export const getCurrentPhase = (competition: CompetitionData) => {
  const now = new Date()
  
  if (now >= competition.earlyBirdStart && now <= competition.earlyBirdEnd) {
    return "EARLY_BIRD"
  } else if (now >= competition.phase1Start && now <= competition.phase1End) {
    return "PHASE_1"
  } else if (now >= competition.phase2Start && now <= competition.phase2End) {
    return "PHASE_2"
  }
  
  return "CLOSED"
}

export const getCurrentPrice = (competition: CompetitionData) => {
  const phase = getCurrentPhase(competition)
  
  switch (phase) {
    case "EARLY_BIRD":
      return competition.pricing.earlyBird
    case "PHASE_1":
      return competition.pricing.phase1
    case "PHASE_2":
      return competition.pricing.phase2
    default:
      return 0
  }
}

export const getPhaseLabel = (competition: CompetitionData) => {
  const phase = getCurrentPhase(competition)
  
  switch (phase) {
    case "EARLY_BIRD":
      return "Early Bird"
    case "PHASE_1":
      return "Phase 1"
    case "PHASE_2":
      return "Phase 2"
    default:
      return "Closed"
  }
}

export const isRegistrationOpen = (competition: CompetitionData) => {
  const phase = getCurrentPhase(competition)
  return phase !== "CLOSED"
}
