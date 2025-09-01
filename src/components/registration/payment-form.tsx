"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard } from "lucide-react"
import { CompetitionData } from "@/types/registration"
import { PaymentProofUpload } from "./payment-proof-upload"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Qris from "../../../public/image/caturnawa/WhatsApp Image 2025-09-01 at 14.43.16.jpeg"
interface PaymentFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    teamName: string
    members: any[]
    agreement: boolean
    paymentProof?: File | null
  }
  errors: Record<string, string>
  getCurrentPrice: (competition: CompetitionData) => number
  getPhaseLabel: () => string
  onFormDataChange: (data: { agreement?: boolean; paymentProof?: File | null }) => void
  registrationId?: string
}

export function PaymentForm({
  selectedCompetition,
  formData,
  errors,
  getCurrentPrice,
  getPhaseLabel,
  onFormDataChange,
  registrationId
}: PaymentFormProps) {
  if (!selectedCompetition) return null

  const totalPrice = getCurrentPrice(selectedCompetition)
  const uniqueCode = parseInt(selectedCompetition.id.slice(-1)) || 0
  const transferAmount = totalPrice + uniqueCode

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Registration Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span>Competition</span>
            <span className="font-medium">{selectedCompetition.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Team</span>
            <span className="font-medium">
              {formData.teamName || "Individual"} ({formData.members.length} person{formData.members.length > 1 ? 's' : ''})
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Phase</span>
            <Badge variant="outline">{getPhaseLabel()}</Badge>
          </div>
          <div className="flex justify-between items-center py-2 text-lg font-bold">
            <span>Total Fee</span>
            <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Scan QR Code and upload payment proof
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Placeholder */}
          <div className="text-center">
            <div className="w-80 h-100 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-center">
                <Image src={Qris} alt="Qris" className="h-60 w-60 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">QRIS QR Code</p>
                
                <p className="text-xs text-muted-foreground">
                  Rp {transferAmount.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Transfer Amount: Rp {transferAmount.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-muted-foreground">
                *Unique code added for payment identification
              </p>
            </div>
          </div>

          {/* Upload Proof */}
          <PaymentProofUpload
            onFileChange={(file) => onFormDataChange({ paymentProof: file })}
            currentFile={formData.paymentProof || null}
            registrationId={registrationId}
          />

          {/* Agreement */}
          <div className="flex items-start space-x-2">
            <Checkbox
            className="bg-blue-500 border-black"
              id="agreement"
              checked={formData.agreement}
              onCheckedChange={(checked) => onFormDataChange({ agreement: !!checked })}
            />
            <Label htmlFor="agreement" className="text-sm leading-relaxed">
              I agree to the <a href="/terms" className="text-primary hover:underline">terms and conditions</a> of UNAS FEST 2025 competition.
            </Label>
          </div>
          {errors.agreement && (
            <p className="text-red-500 text-sm">{errors.agreement}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
