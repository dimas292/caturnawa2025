"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard } from "lucide-react"
import { CompetitionData } from "@/types/registration"
import { PaymentProofUpload } from "./payment-proof-upload"
import { Label } from "@/components/ui/label"

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
}

export function PaymentForm({
  selectedCompetition,
  formData,
  errors,
  getCurrentPrice,
  getPhaseLabel,
  onFormDataChange
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
            <span>Ringkasan Pendaftaran</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span>Kompetisi</span>
            <span className="font-medium">{selectedCompetition.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Tim</span>
            <span className="font-medium">
              {formData.teamName || "Individual"} ({formData.members.length} orang)
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Fase</span>
            <Badge variant="outline">{getPhaseLabel()}</Badge>
          </div>
          <div className="flex justify-between items-center py-2 text-lg font-bold">
            <span>Total Biaya</span>
            <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metode Pembayaran</CardTitle>
          <CardDescription>
            Scan QR Code dan upload bukti pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Placeholder */}
          <div className="text-center">
            <div className="w-48 h-48 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">QR Code QRIS</p>
                <p className="text-xs text-muted-foreground">
                  Rp {transferAmount.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Jumlah Transfer: Rp {transferAmount.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-muted-foreground">
                *Kode unik ditambahkan untuk identifikasi pembayaran
              </p>
            </div>
          </div>

          {/* Upload Bukti */}
          <PaymentProofUpload
            onFileChange={(file) => onFormDataChange({ paymentProof: file })}
            currentFile={formData.paymentProof || null}
          />

          {/* Agreement */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreement"
              checked={formData.agreement}
              onCheckedChange={(checked) => onFormDataChange({ agreement: !!checked })}
            />
            <Label htmlFor="agreement" className="text-sm leading-relaxed">
              Saya menyetujui <a href="/terms" className="text-primary hover:underline">syarat dan ketentuan</a> kompetisi UNAS FEST 2025 dan menyatakan bahwa semua data yang diisi adalah benar dan dapat dipertanggungjawabkan.
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
