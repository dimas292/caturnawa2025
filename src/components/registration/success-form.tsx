"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, FileText, Download } from "lucide-react"
import Link from "next/link"
import { CompetitionData } from "@/types/registration"

interface SuccessFormProps {
  selectedCompetition: CompetitionData | null
  getCurrentPrice: (competition: CompetitionData) => number
}

export function SuccessForm({ selectedCompetition, getCurrentPrice }: SuccessFormProps) {
  if (!selectedCompetition) return null

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-green-600">Registration Successful!</h2>
        <p className="text-muted-foreground">
          Your registration for {selectedCompetition.name} has been successfully submitted.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration ID:</span>
              <span className="font-mono font-medium">#REG-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Competition:</span>
              <span className="font-medium">{selectedCompetition.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="secondary">Pending Verification</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Fee:</span>
              <span className="font-medium">
                Rp {getCurrentPrice(selectedCompetition).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-left space-y-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Next Steps</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• Admin will verify your payment and documents within 1-2 business days</p>
              <p>• You will receive confirmation via your registered email</p>
              <p>• Monitor your registration status in your dashboard</p>
              {selectedCompetition.category !== "debate" && (
                <p>• Upload your competition work before the deadline if you haven't uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/dashboard">
          <Button size="lg" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            View Registration Status
          </Button>
        </Link> 
        
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Download Registration Receipt
        </Button>
      </div>
    </div>
  )
}
