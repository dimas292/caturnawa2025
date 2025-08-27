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
        <h2 className="text-2xl font-bold text-green-600">Pendaftaran Berhasil!</h2>
        <p className="text-muted-foreground">
          Pendaftaran Anda untuk {selectedCompetition.name} telah berhasil disubmit.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Pendaftaran:</span>
              <span className="font-mono font-medium">#REG-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kompetisi:</span>
              <span className="font-medium">{selectedCompetition.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="secondary">Menunggu Verifikasi</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Biaya:</span>
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
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Langkah Selanjutnya</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• Admin akan memverifikasi pembayaran dan dokumen Anda dalam 1-2 hari kerja</p>
              <p>• Anda akan menerima konfirmasi melalui email yang terdaftar</p>
              <p>• Pantau status pendaftaran di dashboard Anda</p>
              {selectedCompetition.category !== "debate" && (
                <p>• Upload karya lomba sebelum deadline jika belum melakukan upload</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/dashboard">
          <Button size="lg" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Lihat Status Pendaftaran
          </Button>
        </Link> 
        
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Download Bukti Pendaftaran
        </Button>
      </div>
    </div>
  )
}
