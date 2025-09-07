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
import { KDBIForm, EDCForm, SPCForm, DCCInfografisForm, DCCShortVideoForm } from "@/components/registration/forms"
import { competitions, getCurrentPrice, getPhaseLabel } from "@/lib/competitions"
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
  
  // Debug competitions data
  console.log('📊 Available competitions:', competitions)

  const [currentStep, setCurrentStep] = useState(1)
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

  const getSteps = (): Step[] => {
    const baseSteps = [
      { number: 1, title: "Select Competition", description: "Choose your competition category" },
      { number: 2, title: "Team Information", description: "Enter team and member details" },
      { number: 3, title: "Upload Documents", description: "Upload required supporting documents" },
      { number: 4, title: "Payment", description: "Confirm and complete payment" },
      { number: 5, title: "Complete", description: "Registration successful" }
    ]
    
    // For SPC, skip step 3 since documents are uploaded in step 2
    if (selectedCompetition?.id === "spc") {
      return [
        baseSteps[0], // Step 1: Select Competition
        { number: 2, title: "Data & Documents", description: "Enter personal data and upload documents" }, // Modified step 2
        { number: 3, title: "Payment", description: "Confirm and complete payment" }, // Step 4 becomes 3
        { number: 4, title: "Complete", description: "Registration successful" } // Step 5 becomes 4
      ]
    }
    
    return baseSteps
  }
  
  const steps = getSteps()



  useEffect(() => {
    if (selectedCompId) {
      const comp = competitions.find(c => c.id === selectedCompId)
      if (comp) {
        setSelectedCompetition(comp)
        
        // For DCC competitions, initialize with 1 member (leader only)
        const initialMemberCount = (comp.id === "dcc-infografis" || comp.id === "dcc-short-video") 
          ? 1 
          : comp.minMembers
        
        setFormData(prev => ({
          ...prev,
          competition: comp.id,
          members: Array.from({ length: initialMemberCount }, (_, index) => ({
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
            instagramFollowProof: null,
            youtubeFollowProof: null,
            tiktokFollowProof: null,
            twibbonProof: null,
            delegationLetter: null,
            pddiktiProof: null,
            attendanceCommitmentLetter: null,
            achievementsProof: null
          }))
        }))
      }
    }
  }, [selectedCompId])

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('🔄 State changed - selectedCompetition:', selectedCompetition)
    console.log('🔄 State changed - formData.competition:', formData.competition)
  }, [selectedCompetition, formData.competition])

  if (isLoading) return <LoadingPage />

  const handleCompetitionSelect = (competition: CompetitionData) => {
    console.log('🎯 Competition selected:', competition)
    setSelectedCompetition(competition)
    
    // For DCC competitions, initialize with 3 members
    const initialMemberCount = (competition.id === "dcc-infografis" || competition.id === "dcc-short-video") 
      ? 3 
      : competition.minMembers
    
    console.log('👥 Initial member count:', initialMemberCount)
    
    setFormData(prev => ({
      ...prev,
      competition: competition.id,
      members: Array.from({ length: initialMemberCount }, (_, index) => ({
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
        instagramFollowProof: null,
        youtubeFollowProof: null,
        tiktokFollowProof: null,
        twibbonProof: null,
        delegationLetter: null,
        attendanceCommitmentLetter: null,
        achievementsProof: null,
        pddiktiProof: null
      }))
    }))
    
    console.log('✅ Form data updated for competition:', competition.id)
  }

  const handleFormDataChange = (data: Partial<RegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}
    
    console.log('🔍 Validating step:', currentStep)
    console.log('🔍 selectedCompetition:', selectedCompetition)
    console.log('🔍 formData:', formData)

    switch (currentStep) {
      case 1:
        if (!selectedCompetition) {
          newErrors.competition = "Please select a competition first"
          console.log('❌ No competition selected')
        } else {
          console.log('✅ Competition selected:', selectedCompetition.name)
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
          
          // DCC specific validations
          if (selectedCompetition && (selectedCompetition.id === "dcc-infografis" || selectedCompetition.id === "dcc-short-video")) {
            if (!member.faculty?.trim()) newErrors[`member${index}_faculty`] = "Jurusan is required"
            if (!member.fullAddress?.trim()) newErrors[`member${index}_fullAddress`] = "Alamat lengkap is required"
          } else {
            // Non-DCC competitions require student ID
            if (!member.studentId.trim()) newErrors[`member${index}_studentId`] = "Student ID is required"
          }
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
        // Payment proof is required for payment step
        if (!formData.paymentProof) {
          newErrors.paymentProof = "Payment proof is required"
        }
        break
    }

    console.log('🔍 Validation errors found:', newErrors)
    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  const handleNext = async () => {
    console.log('🔍 handleNext called, currentStep:', currentStep)
    console.log('🔍 selectedCompetition:', selectedCompetition)
    console.log('🔍 formData.competition:', formData.competition)
    
    // Add a small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const validationResult = validateCurrentStep()
    console.log('🔍 validateCurrentStep result:', validationResult)
    
    if (!validationResult.isValid) {
      console.log('❌ Validation failed, errors:', validationResult.errors)
      return
    }

    // Just move to next step, don't create registration yet
    if (currentStep < steps.length) {
      console.log('✅ Moving to next step')
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

    // For SPC, submit at step 3 (payment step). For others, submit at step 4.
    const isPaymentStep = (selectedCompetition?.id === "spc" && currentStep === 3) || 
                         (selectedCompetition?.id !== "spc" && currentStep === 4)
    
    if (isPaymentStep) {
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
        
        // Upload PDDikti proof
        if (member.pddiktiProof) {
          await uploadFile(member.pddiktiProof, 'PDDIKTI_PROOF', registrationId, `member-${i}`)
        }
        
        // Upload achievements proof (for SPC)
        if (member.achievementsProof) {
          await uploadFile(member.achievementsProof, 'ACHIEVEMENTS_PROOF', registrationId, `member-${i}`)
        }
        
        // Upload Instagram follow proof
        if (member.instagramFollowProof) {
          await uploadFile(member.instagramFollowProof, 'INSTAGRAM_FOLLOW_PROOF', registrationId, `member-${i}`)
        }
        
        // Upload YouTube follow proof
        if (member.youtubeFollowProof) {
          await uploadFile(member.youtubeFollowProof, 'YOUTUBE_FOLLOW_PROOF', registrationId, `member-${i}`)
        }
        
        // Upload TikTok follow proof
        if (member.tiktokFollowProof) {
          await uploadFile(member.tiktokFollowProof, 'TIKTOK_FOLLOW_PROOF', registrationId, `member-${i}`)
        }
        
        // Upload attendance commitment letter
        if (member.attendanceCommitmentLetter) {
          await uploadFile(member.attendanceCommitmentLetter, 'ATTENDANCE_COMMITMENT_LETTER', registrationId, `member-${i}`)
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
            getPhaseLabel={getPhaseLabel}
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
        
        // Use EDC-specific form for EDC competition
        if (selectedCompetition?.id === "edc") {
          return (
            <EDCForm
              selectedCompetition={selectedCompetition}
              formData={formData}
              errors={errors}
              onFormDataChange={handleFormDataChange}
            />
          )
        }
        
        // Use DCC Infografis-specific form for DCC Infografis competition
        if (selectedCompetition?.id === "dcc-infografis") {
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
        if (selectedCompetition?.id === "dcc-short-video") {
          return (
            <DCCShortVideoForm
              selectedCompetition={selectedCompetition}
              formData={formData}
              errors={errors}
              onFormDataChange={handleFormDataChange}
            />
          )
        }
        
        // Use SPC-specific form for SPC competition
        if (selectedCompetition?.id === "spc") {
          return (
            <SPCForm
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
        // For SPC, step 3 is payment (file upload was in step 2)
        if (selectedCompetition?.id === "spc") {
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
        }
        
        // For other competitions, step 3 is file upload
        return (
          <FileUploadForm
            selectedCompetition={selectedCompetition}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            registrationId={registrationId ?? undefined}
          />
        )
      case 4:
        // For SPC, step 4 is success (payment was in step 3)
        if (selectedCompetition?.id === "spc") {
          return (
            <SuccessForm
              selectedCompetition={selectedCompetition}
              getCurrentPrice={getCurrentPrice}
              registrationId={registrationId ?? undefined}
              teamName={formData.teamName}
              members={formData.members}
            />
          )
        }
        
        // For other competitions, step 4 is payment
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
            registrationId={registrationId ?? undefined}
            teamName={formData.teamName}
            members={formData.members}
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
          {/* For SPC: show until step 4, for others: show until step 5 */}
          {((selectedCompetition?.id === "spc" && currentStep < 5) || 
            (selectedCompetition?.id !== "spc" && currentStep < 6)) && 
            <StepIndicator steps={steps} currentStep={currentStep} />}

          {/* Current Step Content */}
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          {/* For SPC: show until step 4, for others: show until step 5 */}
          {((selectedCompetition?.id === "spc" && currentStep < 5) || 
            (selectedCompetition?.id !== "spc" && currentStep < 6)) && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {/* For SPC: show Submit button at step 3, Next button before that */}
              {/* For others: show Submit button at step 4, Next button before that */}
              {(selectedCompetition?.id === "spc" && currentStep < 3) || 
               (selectedCompetition?.id !== "spc" && currentStep < 4) ? (
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