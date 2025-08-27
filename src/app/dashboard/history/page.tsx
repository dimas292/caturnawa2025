"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingPage } from "@/components/ui/loading"
import { 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  Download, 
  Eye,
  ChevronLeft
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Registration {
  id: string
  competition: {
    id: string
    name: string
    shortName: string
    category: string
    type: string
  }
  teamName?: string
  status: string
  paymentPhase: string
  paymentAmount: number
  paymentCode?: string
  paymentProofUrl?: string
  adminNotes?: string
  teamMembers: Array<{
    id: string
    fullName: string
    email: string
    institution: string
    role: string
    position: number
  }>
  files: Array<{
    id: string
    fileName: string
    fileType: string
    fileUrl: string
    uploadedAt: string
  }>
  workTitle?: string
  workDescription?: string
  workFileUrl?: string
  workLinkUrl?: string
  verifiedAt?: string
  rejectedAt?: string
  createdAt: string
  updatedAt: string
}

interface HistoryResponse {
  registrations: Registration[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: {
    competitions: Array<{
      id: string
      name: string
      shortName: string
    }>
    statuses: Array<{
      value: string
      label: string
    }>
  }
}

export default function RegistrationHistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/registrations/history')
      if (!response.ok) {
        throw new Error("Failed to fetch history")
      }
      
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING_PAYMENT: { variant: "secondary", text: "Menunggu Pembayaran" },
      PAYMENT_UPLOADED: { variant: "default", text: "Pembayaran Diupload" },
      VERIFIED: { variant: "default", text: "Terverifikasi" },
      REJECTED: { variant: "destructive", text: "Ditolak" },
      COMPLETED: { variant: "default", text: "Selesai" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary", text: status }
    return <Badge variant={config.variant as any}>{config.text}</Badge>
  }

  const getPaymentPhaseText = (phase: string) => {
    const phaseConfig = {
      EARLY_BIRD: "Early Bird",
      PHASE_1: "Phase 1",
      PHASE_2: "Phase 2"
    }
    return phaseConfig[phase as keyof typeof phaseConfig] || phase
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: id })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(amount)
  }

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchHistory}>Coba Lagi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Riwayat Pendaftaran
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Lihat semua pendaftaran lomba yang telah Anda lakukan
            </p>
          </div>
          <Button asChild variant="outline">
            <a href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </a>
          </Button>
        </div>
      </div>





      {/* Registrations List */}
      <div className="space-y-4">
        {data.registrations.map((registration) => (
          <Card key={registration.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {registration.competition.name}
                    {registration.teamName && (
                      <Badge variant="outline" className="ml-2">
                        {registration.teamName}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(registration.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getPaymentPhaseText(registration.paymentPhase)}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(registration.paymentAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(registration.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Team Members */}
              {registration.teamMembers.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Anggota Tim
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {registration.teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm font-medium">{member.position}.</span>
                        <span className="text-sm">{member.fullName}</span>
                        <Badge variant="outline" className="text-xs">
                          {member.role === "LEADER" ? "Ketua" : "Anggota"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Details */}
              {(registration.workTitle || registration.workDescription) && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Detail Karya</h4>
                  {registration.workTitle && (
                    <p className="text-sm mb-1">
                      <span className="font-medium">Judul:</span> {registration.workTitle}
                    </p>
                  )}
                  {registration.workDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {registration.workDescription}
                    </p>
                  )}
                </div>
              )}

              {/* Files */}
              {registration.files.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Berkas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {registration.files.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm flex-1 truncate">{file.fileName}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" asChild>
                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={file.fileUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {registration.adminNotes && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Catatan Admin
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {registration.adminNotes}
                  </p>
                </div>
              )}

              {/* Payment Details */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Kode Pembayaran:</span>
                    <span className="ml-2 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {registration.paymentCode || "Belum ada"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2">{getStatusBadge(registration.status)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Empty State */}
      {data.registrations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Belum ada pendaftaran
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Anda belum mendaftar ke kompetisi manapun. Mulai daftar sekarang!
            </p>
            <Button asChild>
              <a href="/register">Daftar Kompetisi</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
