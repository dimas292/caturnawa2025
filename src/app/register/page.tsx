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
import { competitions, getCurrentPrice, getPhaseLabel, getCurrentPhase } from "@/lib/competitions"
import { 
  CompetitionData, 
  FormData, 
  Member, 
  Step 
} from "@/types/registration"

function RegistrationForm() {
  const { user, isLoading } = useRequireRole("participant")
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCompId = searchParams.get("competition")

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionData | null>(null)
  const [formData, setFormData] = useState<FormData>({
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
            delegationLetter: null
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
        delegationLetter: null
      }))
    }))
  }

  const handleFormDataChange = (data: Partial<FormData>) => {
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

    // If we're at step 2 (team data), create the registration first
    if (currentStep === 2) {
      setIsSubmitting(true)
      try {
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
            agreement: true, // Set to true for now, will be confirmed in payment step
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Registration failed')
        }

        const result = await response.json()
        setRegistrationId(result.registrationId)
        localStorage.setItem('registrationId', result.registrationId)
        localStorage.setItem('paymentCode', result.paymentCode)
        
        // Move to next step
        setCurrentStep(prev => prev + 1)
      } catch (error) {
        console.error("Registration failed:", error)
        alert(error instanceof Error ? error.message : 'An error occurred during registration')
      } finally {
        setIsSubmitting(false)
      }
    } else if (currentStep < steps.length) {
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

    // At step 4, we just need to confirm payment and complete registration
    // Registration was already created at step 2
    setCurrentStep(5)
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
            getPhaseLabel={getPhaseLabel}
          />
        )
      case 2:
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
            getPhaseLabel={getPhaseLabel}
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
                  disabled={(currentStep === 1 && !selectedCompetition) || isSubmitting}
                >
                  {isSubmitting && currentStep === 2 ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Creating Registration...
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
          {currentStep < 5 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length - 1} • 
                <span className="ml-1">
                  {getCurrentPhase() === "closed" ? "Registration Closed" : `${getPhaseLabel()} Phase Active`}
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