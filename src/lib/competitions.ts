import { CompetitionData } from "@/types/registration"

export const competitions: CompetitionData[] = [
  {
    id: "kdbi",
    name: "Kompetisi Debat Bahasa Indonesia",
    shortName: "KDBI",
    type: "KDBI",
    category: "debate",
    teamSize: "2 people",
    maxMembers: 2,
    minMembers: 2,
    pricing: {
      earlyBird: 150000,
      phase1: 250000,
      phase2: 300000
    },
    earlyBirdStart: new Date('2025-09-01'),
    earlyBirdEnd: new Date('2025-09-08'),
    phase1Start: new Date('2025-09-09'),
    phase1End: new Date('2025-09-19'),
    phase2Start: new Date('2025-09-20'),
    phase2End: new Date('2025-10-10'),
    workUploadDeadline: null,
    competitionDate: new Date('2025-10-15')
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
    pricing: {
      earlyBird: 150000,
      phase1: 250000,
      phase2: 300000
    },
    earlyBirdStart: new Date('2025-09-01'),
    earlyBirdEnd: new Date('2025-09-08'),
    phase1Start: new Date('2025-09-09'),
    phase1End: new Date('2025-09-19'),
    phase2Start: new Date('2025-09-20'),
    phase2End: new Date('2025-10-10'),
    workUploadDeadline: null,
    competitionDate: new Date('2025-10-16')
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
    pricing: {
      earlyBird: 115000,
      phase1: 135000,
      phase2: 150000
    },
    earlyBirdStart: new Date('2025-09-01'),
    earlyBirdEnd: new Date('2025-09-08'),
    phase1Start: new Date('2025-09-09'),
    phase1End: new Date('2025-09-19'),
    phase2Start: new Date('2025-09-20'),
    phase2End: new Date('2025-10-10'),
    workUploadDeadline: new Date('2025-10-10'),
    competitionDate: new Date('2025-10-20')
  },
  {
    id: "dcc-infografis",
    name: "Digital Content Competition - Infografis",
    shortName: "DCC Infografis",
    type: "DCC_INFOGRAFIS",
    category: "creative",
    teamSize: "Max 3 people",
    maxMembers: 3,
    minMembers: 1,
    pricing: {
      earlyBird: 50000,
      phase1: 65000,
      phase2: 75000
    },
    earlyBirdStart: new Date('2025-09-01'),
    earlyBirdEnd: new Date('2025-09-08'),
    phase1Start: new Date('2025-09-09'),
    phase1End: new Date('2025-09-19'),
    phase2Start: new Date('2025-09-20'),
    phase2End: new Date('2025-10-10'),
    workUploadDeadline: new Date('2025-10-10'),
    competitionDate: new Date('2025-10-18')
  },
  {
    id: "dcc-short-video",
    name: "Digital Content Competition - Short Video",
    shortName: "DCC Short Video",
    type: "DCC_SHORT_VIDEO",
    category: "creative",
    teamSize: "Max 3 people",
    maxMembers: 3,
    minMembers: 1,
    pricing: {
      earlyBird: 50000,
      phase1: 65000,
      phase2: 75000
    },
    earlyBirdStart: new Date('2025-09-01'),
    earlyBirdEnd: new Date('2025-09-08'),
    phase1Start: new Date('2025-09-09'),
    phase1End: new Date('2025-09-19'),
    phase2Start: new Date('2025-09-20'),
    phase2End: new Date('2025-10-10'),
    workUploadDeadline: new Date('2025-10-10'),
    competitionDate: new Date('2025-10-19')
  }
]


export const getCompetitionById = (id: string): CompetitionData | undefined => {
  return competitions.find(comp => comp.id === id)
}

export const getCompetitionByType = (type: string): CompetitionData | undefined => {
  return competitions.find(comp => comp.type === type)
}


const getEndOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}


export const getCurrentPhaseForCompetition = (competition: CompetitionData) => {
  const now = new Date()
  const earlyBirdEnd = getEndOfDay(competition.earlyBirdEnd)
  const phase1End = getEndOfDay(competition.phase1End)
  const phase2End = getEndOfDay(competition.phase2End)

  // Debug logging - remove after confirmed working
  if (competition.shortName === 'KDBI') {
    console.log(`hase Debug for ${competition.shortName}:`)
    console.log(`Now: ${now.toISOString()}`)
    console.log(`Early Bird End: ${earlyBirdEnd.toISOString()}`)
    console.log(`Now <= Early Bird End: ${now <= earlyBirdEnd}`)
    console.log(`Calculated Phase: ${now <= earlyBirdEnd ? 'EARLY_BIRD' : now <= phase1End ? 'PHASE_1' : 'PHASE_2'}`)
  }

  if (now <= earlyBirdEnd) return "EARLY_BIRD"
  if (now <= phase1End) return "PHASE_1"
  if (now <= phase2End) return "PHASE_2"
  return "CLOSED"
}

export const getCurrentPrice = (competition: CompetitionData) => {
  const phase = getCurrentPhaseForCompetition(competition)
  switch (phase) {
    case "EARLY_BIRD": return competition.pricing.earlyBird
    case "PHASE_1": return competition.pricing.phase1
    case "PHASE_2": return competition.pricing.phase2
    default: return 0
  }
}

export const getPhaseLabel = (competition: CompetitionData) => {
  const phase = getCurrentPhaseForCompetition(competition)
  switch (phase) {
    case "EARLY_BIRD": return "Early Bird"
    case "PHASE_1": return "Phase 1"
    case "PHASE_2": return "Phase 2"
    default: return "Closed"
  }
}