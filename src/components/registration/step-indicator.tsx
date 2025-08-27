"use client"

import { Check } from "lucide-react"
import { Step } from "@/types/registration"

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep > step.number 
                ? "bg-primary border-primary text-primary-foreground" 
                : currentStep === step.number
                ? "border-primary text-primary"
                : "border-muted-foreground/30 text-muted-foreground"
            }`}>
              {currentStep > step.number ? (
                <Check className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h3 className="font-semibold">{steps[currentStep - 1].title}</h3>
        <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
      </div>
    </div>
  )
}
