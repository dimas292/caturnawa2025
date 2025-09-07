"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Copy, CheckCircle, Building2 } from "lucide-react"
import { CompetitionData } from "@/types/registration"
import { PaymentProofUpload } from "./payment-proof-upload"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import BCALogo from '../../../public/image/caturnawa/960px-Bank_Central_Asia.svg.png'
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
  getPhaseLabel: (competition: CompetitionData) => string
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
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!selectedCompetition) return null

  const totalPrice = getCurrentPrice(selectedCompetition)
  const uniqueCode = parseInt(selectedCompetition.id.slice(-1)) || 0
  const transferAmount = totalPrice + uniqueCode

  // Bank account details
  const bankDetails = {
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "6825653574",
    accountName: "M. Akmal Baskoro"
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

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
            <Badge variant="outline">{getPhaseLabel(selectedCompetition)}</Badge>
          </div>
          <div className="flex justify-between items-center py-2 text-lg font-bold">
            <span>Total Fee</span>
            <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Payment Method - Bank Transfer</span>
          </CardTitle>
          <CardDescription>
            Transfer to the account below and upload payment proof
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bank Transfer Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Bank Transfer Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Please transfer the exact amount</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Bank Name */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-lg border">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bank Name</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{bankDetails.bankName}</p>
                </div>
                <div>
                  <Image
                    src={BCALogo}
                    alt="BCA Logo"
                    width={80}
                    height={32}
                    className="object-contain mx-4"
                  />
                </div>
                {/* <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">BCA</span>
                </div> */}
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-lg border">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Number</p>
                  <p className="font-mono font-semibold text-lg text-gray-900 dark:text-gray-100">{bankDetails.accountNumber}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(bankDetails.accountNumber, 'accountNumber')}
                >
                  {copiedField === 'accountNumber' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-lg border">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Name</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{bankDetails.accountName}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(bankDetails.accountName, 'accountName')}
                >
                  {copiedField === 'accountName' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Transfer Amount */}
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Transfer Amount</p>
                    <p className="text-2xl font-bold">Rp {transferAmount.toLocaleString("id-ID")}</p>
                   
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => copyToClipboard(transferAmount.toString(), 'amount')}
                  >
                    {copiedField === 'amount' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            {/* <Clock className="h-4 w-4 text-gray-500" /> */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Processing Time:</span> Payment verification takes 1-2 business days
            </p>
          </div>

          {/* Upload Proof */}
          <PaymentProofUpload
            onFileChange={(file) => onFormDataChange({ paymentProof: file })}
            currentFile={formData.paymentProof || null}
            registrationId={registrationId}
            error={errors.paymentProof}
          />

          {/* Agreement */}
         <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
  <Checkbox
    id="agreement"
    checked={formData.agreement}
    onCheckedChange={(checked) => onFormDataChange({ agreement: !!checked })}
    className={`
      border-2 rounded transition-transform duration-200
      ${formData.agreement 
        ? 'border-green-500 bg-green-500 text-white' 
        : 'border-green-400 dark:border-green-500'
      }
      hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    `}
  />
  <Label 
    htmlFor="agreement" 
    className="text-sm leading-relaxed cursor-pointer select-none"
  >
    I agree to the{" "}
      terms and conditions
    of UNAS FEST 2025 competition.
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
