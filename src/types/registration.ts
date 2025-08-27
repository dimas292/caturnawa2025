export interface CompetitionData {
  id: string
  name: string
  shortName: string
  teamSize: string
  maxMembers: number
  minMembers: number
  category: "debate" | "academic" | "creative"
  pricing: {
    earlyBird: number
    phase1: number
    phase2: number
  }
}

export interface Member {
  role: "leader" | "member"
  fullName: string
  email: string
  phone: string
  institution: string
  faculty: string
  studentId: string
  ktm: File | null
  photo: File | null
  khs: File | null
  socialMediaProof: File | null
  twibbonProof: File | null
  delegationLetter: File | null
}

export interface WorkSubmission {
  title: string
  description: string
  file?: File | null
  link?: string
}

export interface FormData {
  competition: string
  teamName: string
  members: Member[]
  workSubmission?: WorkSubmission
  agreement: boolean
  paymentProof?: File | null
}

export interface Step {
  number: number
  title: string
  description: string
}
