"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingPage } from "@/components/ui/loading"
import { 
  Clock, 
  FileText, 
  Eye,
  ChevronLeft,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  UploadCloud,
  Receipt
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface PaymentRegistration {
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
  verifiedAt?: string
  rejectedAt?: string
  createdAt: string
  updatedAt: string
}

interface PaymentResponse {
  registrations: PaymentRegistration[]
}

export default function PaymentPage() {
  const [data, setData] = useState<PaymentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPaymentData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/registrations/history')
      if (!response.ok) {
        throw new Error("Failed to fetch payment data")
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
    fetchPaymentData()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING_PAYMENT: { variant: "secondary", text: "Menunggu Pembayaran", icon: Clock },
      PAYMENT_UPLOADED: { variant: "default", text: "Pembayaran Diupload", icon: UploadCloud },
      VERIFIED: { variant: "default", text: "Terverifikasi", icon: CheckCircle },
      REJECTED: { variant: "destructive", text: "Ditolak", icon: XCircle },
      COMPLETED: { variant: "default", text: "Selesai", icon: CheckCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary", text: status, icon: AlertCircle }
    const IconComponent = config.icon
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getPaymentPhaseText = (phase: string) => {
    const phaseConfig = {
      EARLY_BIRD: "Early Bird",
      PHASE_1: "Phase 1",
      PHASE_2: "Phase 2"
    }
    return phaseConfig[phase as keyof typeof phaseConfig] || phase
  }

  const getPaymentPhaseColor = (phase: string) => {
    const phaseConfig = {
      EARLY_BIRD: "text-green-600 bg-green-100 dark:bg-green-900/20",
      PHASE_1: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
      PHASE_2: "text-orange-600 bg-orange-100 dark:bg-orange-900/20"
    }
    return phaseConfig[phase as keyof typeof phaseConfig] || "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
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
              <Button onClick={fetchPaymentData}>Coba Lagi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Filter registrations that need payment attention
  const pendingPayments = data.registrations.filter(reg => 
    reg.status === 'PENDING_PAYMENT' || reg.status === 'PAYMENT_UPLOADED'
  )
  
  const completedPayments = data.registrations.filter(reg => 
    reg.status === 'VERIFIED' || reg.status === 'COMPLETED'
  )

  const totalAmount = data.registrations.reduce((sum, reg) => sum + reg.paymentAmount, 0)
  const paidAmount = completedPayments.reduce((sum, reg) => sum + reg.paymentAmount, 0)
  const pendingAmount = pendingPayments.reduce((sum, reg) => sum + reg.paymentAmount, 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Pembayaran
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Kelola pembayaran untuk semua pendaftaran lomba Anda
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

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendaftaran</p>
                <p className="text-2xl font-bold">{data.registrations.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Biaya</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <Clock className="mr-2 h-5 w-5" />
              Menunggu Pembayaran ({pendingPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.map((registration) => (
                <div key={registration.id} className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {registration.competition.name}
                        </h3>
                        {registration.teamName && (
                          <Badge variant="outline" className="text-xs">
                            {registration.teamName}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getPaymentPhaseColor(registration.paymentPhase)}`}>
                          {getPaymentPhaseText(registration.paymentPhase)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Biaya:</span>
                          <span className="ml-2 font-medium text-lg">{formatCurrency(registration.paymentAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className="ml-2">{getStatusBadge(registration.status)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Daftar:</span>
                          <span className="ml-2">{formatDate(registration.createdAt)}</span>
                        </div>
                      </div>

                      {registration.paymentCode && (
                        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          <span className="text-sm font-medium">Kode Pembayaran: </span>
                          <span className="font-mono text-lg bg-white dark:bg-gray-700 px-2 py-1 rounded">
                            {registration.paymentCode}
                          </span>
                        </div>
                      )}

                      {registration.status === 'PENDING_PAYMENT' && (
                        <div className="mt-3">
                          <Button className="bg-orange-600 hover:bg-orange-700">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Upload Bukti Pembayaran
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Payments Section */}
      {completedPayments.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              Pembayaran Selesai ({completedPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedPayments.map((registration) => (
                <div key={registration.id} className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {registration.competition.name}
                        </h3>
                        {registration.teamName && (
                          <Badge variant="outline" className="text-xs">
                            {registration.teamName}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getPaymentPhaseColor(registration.paymentPhase)}`}>
                          {getPaymentPhaseText(registration.paymentPhase)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Biaya:</span>
                          <span className="ml-2 font-medium text-lg text-green-600">{formatCurrency(registration.paymentAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className="ml-2">{getStatusBadge(registration.status)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Verifikasi:</span>
                          <span className="ml-2">{registration.verifiedAt ? formatDate(registration.verifiedAt) : 'TBD'}</span>
                        </div>
                      </div>

                      {registration.paymentProofUrl && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" asChild>
                            <a href={registration.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Bukti Pembayaran
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {data.registrations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
