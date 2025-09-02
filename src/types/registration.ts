export interface CompetitionData {
  id: string
  name: string
  shortName: string
  type: CompetitionType
  category: CompetitionCategory
  teamSize: string
  maxMembers: number
  minMembers: number
  pricing: {
    earlyBird: number
    phase1: number
    phase2: number
  }
}

export type CompetitionType = "KDBI" | "EDC" | "SPC" | "DCC_INFOGRAFIS" | "DCC_SHORT_VIDEO"
export type CompetitionCategory = "debate" | "academic" | "creative"

export interface Member {
  role: "LEADER" | "MEMBER"
  fullName: string
  email: string
  phone: string
  institution: string
  faculty: string
  studentId: string
  gender: "MALE" | "FEMALE"
  fullAddress: string
  studyProgram?: string
  
  // File uploads
  ktm: File | null
  photo: File | null
  khs: File | null
  socialMediaProof: File | null
  twibbonProof: File | null
  delegationLetter: File | null
  achievementsProof: File | null
}

export interface WorkSubmission {
  title?: string
  description?: string
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

// Database types for API responses
export interface RegistrationResponse {
  id: string
  status: RegistrationStatus
  teamName?: string
  paymentAmount: number
  paymentPhase: PaymentPhase
  createdAt: string
  updatedAt: string
}

export type RegistrationStatus = 
  | 'PENDING_PAYMENT' 
  | 'PENDING_VERIFICATION' 
  | 'VERIFIED' 
  | 'REJECTED'
  | 'NOT_REGISTERED';

export type PaymentPhase = 'EARLY_BIRD' | 'PHASE_1' | 'PHASE_2';

export interface UserRegistration {
  id: string;
  participant: {
    id: string;
    fullName: string;
    email: string;
  };
  competition: {
    id: string;
    name: string;
    category: string;
    type: 'INDIVIDUAL' | 'TEAM';
    registrationDeadline: Date;
  };
  teamName?: string;
  status: RegistrationStatus;
  paymentPhase: PaymentPhase;
  paymentAmount: number;
  paymentCode?: string;
  agreementAccepted: boolean;
  teamMembersCount: number;
  filesCount: number;
  createdAt: Date;
  updatedAt: Date;
}