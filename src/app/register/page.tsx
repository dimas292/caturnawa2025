"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRequireRole } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { LoadingPage } from "@/components/ui/loading"
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  Link
} from "lucide-react"
import {
  CompetitionSelection,
  TeamDataForm,
  FileUploadForm,
  PaymentForm,
  SuccessForm,
  StepIndicator
} from "@/components/registration"
import { KDBIForm, DCCInfografisForm, DCCShortVideoForm } from "@/components/registration/forms"
import { getCurrentPrice, getPhaseLabel } from "@/lib/competition-utils"
import { 
  CompetitionData, 
  FormData as RegistrationFormData, 
  Member, 
  Step 
} from "@/types/registration"

function RegistrationForm() {
  const { user, isLoading } = useRequireRole("participant")
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCompId = searchParams.get("competition")

  const [currentStep, setCurrentStep] = useState(1)
  const [competitions, setCompetitions] = useState<CompetitionData[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionData | null>(null)
  const [formData, setFormData] = useState<RegistrationFormData>({
    competition: "",
    teamName: "",
    members: [],
    agreement: false,
    paymentProof: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps: Step[] = [
    { number: 1, title: "Select Competition", description: "Choose your competition category" },
    { number: 2, title: "Team Information", description: "Enter team and member details" },
    { number: 3, title: "Upload Documents", description: "Upload required supporting documents" },
    { number: 4, title: "Payment", description: "Confirm and complete payment" },
    { number: 5, title: "Complete", description: "Registration successful" }
  ]

  // Fetch competitions from API
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        console.log('🔍 Fetching competitions...')
        const response = await fetch('/api/competitions')
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Competitions data:', data)
          setCompetitions(data)
        } else {
          console.error('❌ Failed to fetch competitions:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to fetch competitions:', error)
      }
    }

    fetchCompetitions()
  }, [])

  useEffect(() => {
    if (selectedCompId) {
      const comp = competitions.find(c => c.id === selectedCompId)
      if (comp) {
        setSelectedCompetition(comp)
        setFormData(prev => ({
          ...prev,
          competition: comp.id,
          members: Array.from({ length: comp.minMembers }, (_, index) => ({
            role: index === 0 ? "LEADER" : "MEMBER",
            fullName: "",
            email: "",
            phone: "",
            institution: "",
            faculty: "",
            studentId: "",
            gender: "MALE",
            fullAddress: "",
            studyProgram: "",
            ktm: null,
            photo: null,
            khs: null,
            socialMediaProof: null,
            twibbonProof: null,
            delegationLetter: null,
            achievementsProof: null
          }))
        }))
      }
    }
  }, [selectedCompId])

  if (isLoading) return <LoadingPage />

  const handleCompetitionSelect = (competition: CompetitionData) => {
    setSelectedCompetition(competition)
    setFormData(prev => ({
      ...prev,
      competition: competition.id,
      members: Array.from({ length: competition.minMembers }, (_, index) => ({
        role: index === 0 ? "LEADER" : "MEMBER",
        fullName: "",
        email: "",
        phone: "",
        institution: "",
        faculty: "",
        studentId: "",
        gender: "MALE",
        fullAddress: "",
        studyProgram: "",
        ktm: null,
        photo: null,
        khs: null,
        socialMediaProof: null,
        twibbonProof: null,
        delegationLetter: null,
        achievementsProof: null
      }))
    }))
  }

  const handleFormDataChange = (data: Partial<RegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!selectedCompetition) {
          newErrors.competition = "Please select a competition first"
        }
        break

      case 2:
        if (selectedCompetition && selectedCompetition.maxMembers > 1 && !formData.teamName.trim()) {
          newErrors.teamName = "Team name is required"
        }
        
        formData.members.forEach((member, index) => {
          if (!member.fullName.trim()) newErrors[`member${index}_fullName`] = "Full name is required"
          if (!member.email.trim()) newErrors[`member${index}_email`] = "Email is required"
          if (!member.phone.trim()) newErrors[`member${index}_phone`] = "WhatsApp number is required"
          if (!member.institution.trim()) newErrors[`member${index}_institution`] = "Institution is required"
          if (!member.studentId.trim()) newErrors[`member${index}_studentId`] = "Student ID is required"
        })
        break

      case 3:
        // File validation would go here
        // For now, we'll assume files are optional during form submission
        break

      case 4:
        if (!formData.agreement) {
          newErrors.agreement = "You must agree to the terms and conditions"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateCurrentStep()) return

    // Just move to next step, don't create registration yet
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return

    // At step 4, create the registration after payment confirmation
    if (currentStep === 4) {
      setIsSubmitting(true)
      try {
        // First, create the registration
        const response = await fetch('/api/registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            competitionId: formData.competition,
            teamName: formData.teamName,
            members: formData.members,
            workSubmission: formData.workSubmission,
            agreement: formData.agreement,
            paymentProof: formData.paymentProof
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Registration failed')
        }

        const result = await response.json()
        setRegistrationId(result.registrationId)
        
        // Now upload all the files that were stored locally
        await uploadAllFiles(result.registrationId)
        
        // Move to success step
        setCurrentStep(5)
      } catch (error) {
        console.error("Registration failed:", error)
        alert(error instanceof Error ? error.message : 'An error occurred during registration')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Function to upload all files after registration creation
  const uploadAllFiles = async (registrationId: string) => {
    try {
      // Upload team member files
      for (let i = 0; i < formData.members.length; i++) {
        const member = formData.members[i]
        
        // Upload KTM
        if (member.ktm) {
          await uploadFile(member.ktm, 'KTM', registrationId, `member-${i}`)
        }
        
        // Upload photo
        if (member.photo) {
          await uploadFile(member.photo, 'PHOTO', registrationId, `member-${i}`)
        }
        
        // Upload KHS
        if (member.khs) {
          await uploadFile(member.khs, 'KHS', registrationId, `member-${i}`)
        }
        
        // Upload social media proof
        if (member.socialMediaProof) {
          await uploadFile(member.socialMediaProof, 'SOCIAL_MEDIA_PROOF', registrationId, `member-${i}`)
        }
        
        // Upload twibbon proof
        if (member.twibbonProof) {
          await uploadFile(member.twibbonProof, 'TWIBBON_PROOF', registrationId, `member-${i}`)
        }
        
        // Upload delegation letter (for debate)
        if (member.delegationLetter) {
          await uploadFile(member.delegationLetter, 'DELEGATION_LETTER', registrationId, `member-${i}`)
        }
        
        // Upload achievements proof (for SPC)
        if (member.achievementsProof) {
          await uploadFile(member.achievementsProof, 'ACHIEVEMENTS_PROOF', registrationId, `member-${i}`)
        }
      }
      
      // Upload work submission file
      if (formData.workSubmission?.file) {
        await uploadFile(formData.workSubmission.file, 'WORK_FILE', registrationId, 'work-submission')
      }
      
      // Upload payment proof
      if (formData.paymentProof) {
        await uploadFile(formData.paymentProof, 'PAYMENT_PROOF', registrationId)
      }
    } catch (error) {
      console.error('File upload failed:', error)
      // Don't block the registration process if file upload fails
      // Files can be uploaded later through the dashboard
    }
  }

  // Helper function to upload a single file
  const uploadFile = async (file: File, fileType: string, registrationId: string, memberId?: string) => {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('fileType', fileType)
    uploadFormData.append('registrationId', registrationId)
    if (memberId) {
      uploadFormData.append('memberId', memberId)
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'File upload failed')
    }

    return response.json()
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompetitionSelection
            competitions={competitions}
            selectedCompetition={selectedCompetition}
            onCompetitionSelect={handleCompetitionSelect}
            getCurrentPrice={getCurrentPrice}
            getPhaseLabel={(competition) => getPhaseLabel(competition)}
          />
        )
      case 2:
        // Use KDBI-specific form for KDBI competition
        if (selectedCompetition?.id === "kdbi") {
          return (
            <KDBIForm
              selectedCompetition={selectedCompetition}
              formData={formData}
              errors={errors}
              onFormDataChange={handleFormDataChange}
            />
          )
        }
        
        // Use DCC Infografis-specific form for DCC Infografis competition
        if (selectedCompetition?.type === "DCC_INFOGRAFIS") {
          return (
            <DCCInfografisForm
              selectedCompetition={selectedCompetition}
              formData={formData}
              errors={errors}
              onFormDataChange={handleFormDataChange}
            />
          )
        }
        
        // Use DCC Short Video-specific form for DCC Short Video competition
        if (selectedCompetition?.type === "DCC_SHORT_VIDEO") {
          return (
            <DCCShortVideoForm
              selectedCompetition={selectedCompetition}
              formData={formData}
              errors={errors}
              onFormDataChange={handleFormDataChange}
            />
          )
        }
        
        // Use generic TeamDataForm for other competitions
        return (
          <TeamDataForm
            selectedCompetition={selectedCompetition}
            formData={formData}
            errors={errors}
            onFormDataChange={handleFormDataChange}
          />
        )
      case 3:
        return (
          <FileUploadForm
            selectedCompetition={selectedCompetition}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            registrationId={registrationId ?? undefined}
          />
        )
      case 4:
        return (
          <PaymentForm
            selectedCompetition={selectedCompetition}
            formData={formData}
            errors={errors}
            getCurrentPrice={getCurrentPrice}
            getPhaseLabel={(competition) => getPhaseLabel(competition)}
            onFormDataChange={handleFormDataChange}
            registrationId={registrationId ?? undefined}
          />
        )
      case 5:
        return (
          <SuccessForm
            selectedCompetition={selectedCompetition}
            getCurrentPrice={getCurrentPrice}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background py-6">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
                <span>/</span>
                <span>Competition Registration</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Competition Registration</h1>
              <p className="text-muted-foreground">
                Complete the registration form to participate in UNAS FEST 2025
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-6 pb-6">
          {/* Step Indicator */}
          {currentStep < 5 && <StepIndicator steps={steps} currentStep={currentStep} />}

          {/* Current Step Content */}
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={(currentStep === 1 && !selectedCompetition)}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.agreement}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Progress Info */}
          {currentStep < 5 && selectedCompetition && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length - 1} • 
                <span className="ml-1">
                  {getPhaseLabel(selectedCompetition)} Phase Active
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationForm />
    </Suspense>
  )
}