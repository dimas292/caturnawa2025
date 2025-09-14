"use client"

import { useState, useEffect } from "react"
import { useFileValidation } from "@/hooks/use-file-validation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingPage } from "@/components/ui/loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Clock,
  FileText,
  Eye,
  ChevronLeft,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  UploadCloud,
  Receipt,
  Download,
  Upload,
  Edit3,
  RefreshCw
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
  teamMembers?: Array<{
    id: string
    fullName: string
    email: string
    institution: string
    role: string
    position: number
  }>
  files?: Array<{
    id: string
    fileName: string
    fileType: string
    fileUrl: string
    memberId?: string
    originalName: string
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
  const [uploadModal, setUploadModal] = useState<{isOpen: boolean, registration: PaymentRegistration | null}>({isOpen: false, registration: null})
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { error: fileError, validateFile, setError: setFileError } = useFileValidation({
    maxSize: 5, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  });

  const fetchPaymentData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/participant/registrations')
      if (!response.ok) {
        throw new Error("Failed to fetch payment data")
      }
      
      const result = await response.json()
      if (result.success) {
        setData({ registrations: result.data })
      } else {
        throw new Error(result.error || "Failed to fetch data")
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (validateFile(file)) {
        setUploadFile(file);
      } else {
        setUploadFile(null); // Clear the file if validation fails
      }
    } else {
      setUploadFile(null);
      setFileError(null); // Clear error if file is removed
    }
  }

  const handleUpdatePayment = async () => {
    if (!uploadFile || !uploadModal.registration) {
      alert("Please select a valid file.");
      return;
    }

    // Re-validate before uploading
    if (!validateFile(uploadFile)) {
      return;
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('registrationId', uploadModal.registration.id)

      const response = await fetch('/api/payment-proof', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      if (result.message) {
        setUploadModal({isOpen: false, registration: null})
        setUploadFile(null)
        await fetchPaymentData() // Refresh data
        alert(result.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to update payment proof')
    } finally {
      setIsUploading(false)
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

  // Invoice generation function
  const generateInvoice = (registration: PaymentRegistration) => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${registration.competition.name}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; }
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .invoice-container {
              position: relative;
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 72px;
              font-weight: bold;
              color: #f0f0f0;
              z-index: 0;
              pointer-events: none;
              text-transform: uppercase;
              letter-spacing: 8px;
            }
            .content {
              position: relative;
              z-index: 1;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin: 20px 0;
              text-align: center;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 30px 0;
            }
            .detail-group {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }
            .detail-item {
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .detail-label {
              font-weight: 600;
              color: #374151;
              margin-right: 10px;
            }
            .detail-value {
              font-weight: 500;
              color: #1f2937;
            }
            .amount-section {
              background: linear-gradient(135deg, #2563eb, #3b82f6);
              color: white;
              padding: 25px;
              border-radius: 8px;
              text-align: center;
              margin: 30px 0;
            }
            .amount-label {
              font-size: 16px;
              margin-bottom: 8px;
              opacity: 0.9;
            }
            .amount-value {
              font-size: 36px;
              font-weight: bold;
            }
            .team-section {
              margin: 30px 0;
              padding: 20px;
              background: #f1f5f9;
              border-radius: 8px;
            }
            .team-member {
              background: white;
              padding: 15px;
              margin: 10px 0;
              border-radius: 6px;
              border-left: 4px solid #10b981;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #2563eb;
              color: white;
              border: none;
              padding: 12px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              z-index: 1000;
            }
            .verification-badge {
              background: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="watermark">
              PAID
            </div>
            
            <div class="content">
              <div class="header">
                <div class="logo">UNAS FEST 2025</div>
                <div>Festival Kompetisi Nasional</div>
              </div>

              <div class="invoice-title">INVOICE</div>

              <div class="invoice-details">
                <div class="detail-group">
                  <h3 style="margin-top: 0; color: #2563eb;">Invoice Details</h3>
                  <div class="detail-item">
                    <span class="detail-label">Invoice Date:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Payment Code:</span>
                    <span class="detail-value">${registration.paymentCode || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Registration ID:</span>
                    <span class="detail-value">${registration.id}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="verification-badge">VERIFIED</span>
                  </div>
                </div>
                
                <div class="detail-group">
                  <h3 style="margin-top: 0; color: #2563eb;">Competition Details</h3>
                  <div class="detail-item">
                    <span class="detail-label">Competition:</span>
                    <span class="detail-value">${registration.competition.name}</span>
                  </div>
                  ${registration.teamName ? `
                  <div class="detail-item">
                    <span class="detail-label">Team Name:</span>
                    <span class="detail-value">${registration.teamName}</span>
                  </div>
                  ` : ''}
                  <div class="detail-item">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${registration.competition.category}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Payment Phase:</span>
                    <span class="detail-value">${getPaymentPhaseText(registration.paymentPhase)}</span>
                  </div>
                </div>
              </div>

              ${registration.teamMembers && registration.teamMembers.length > 0 ? `
              <div class="team-section">
                <h3 style="margin-top: 0; color: #2563eb;">Team Members</h3>
                ${registration.teamMembers?.map(member => `
                  <div class="team-member">
                    <div>
                      <strong>${member.fullName}</strong><br>
                      <small>${member.institution}</small>
                    </div>
                    <div style="text-align: right;">
                      <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${member.role === 'LEADER' ? 'Leader' : 'Member'}
                      </span>
                    </div>
                  </div>
                `).join('') || ''}
              </div>
              ` : ''}

              <div class="amount-section">
                <div class="amount-label">Total Amount Paid</div>
                <div class="amount-value">${formatCurrency(registration.paymentAmount)}</div>
              </div>

              <div class="footer">
                <p><strong>UNAS FEST 2025 - Festival Kompetisi Nasional</strong></p>
                <p>Invoice generated on ${formatDate(new Date().toISOString())}</p>
                <p>Thank you for participating in UNAS FEST 2025!</p>
              </div>
            </div>
          </div>

          <button class="print-button no-print" onclick="window.print()">
            🖨️ Print Invoice
          </button>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
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

                      <div className="mt-3 flex gap-2">
                        {registration.status === 'PENDING_PAYMENT' && (
                          <Button 
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() => setUploadModal({isOpen: true, registration})}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Bukti Pembayaran
                          </Button>
                        )}
                        {registration.status === 'PAYMENT_UPLOADED' && (
                          <>
                            <Button 
                              variant="outline"
                              onClick={() => setUploadModal({isOpen: true, registration})}
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Update Bukti Pembayaran
                            </Button>
                            {registration.paymentProofUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={registration.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat Bukti Saat Ini
                                </a>
                              </Button>
                            )}
                          </>
                        )}
                      </div>
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
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={registration.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Bukti Pembayaran
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateInvoice(registration)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
                            </Button>
                          </div>
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
            <Button>
              <a href="/register">Daftar Kompetisi</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Payment Proof Modal */}
      <Dialog open={uploadModal.isOpen} onOpenChange={(open) => setUploadModal({isOpen: open, registration: null})}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {uploadModal.registration?.status === 'PENDING_PAYMENT' ? 'Upload' : 'Update'} Bukti Pembayaran
            </DialogTitle>
            <DialogDescription>
              {uploadModal.registration?.status === 'PENDING_PAYMENT' 
                ? 'Upload bukti pembayaran untuk'
                : 'Update bukti pembayaran untuk'
              } {uploadModal.registration?.competition.name}
            </DialogDescription>
          </DialogHeader>
          
          {/* Show admin notes if payment was rejected */}
          {uploadModal.registration?.status === 'REJECTED' && uploadModal.registration?.adminNotes && (
            <Alert className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <p className="font-medium text-red-800 dark:text-red-200">Payment was rejected</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Reason: {uploadModal.registration.adminNotes}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Payment Info */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium text-green-600">
                  {uploadModal.registration && formatCurrency(uploadModal.registration.paymentAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phase:</span>
                <span className="font-medium">
                  {uploadModal.registration && getPaymentPhaseText(uploadModal.registration.paymentPhase)}
                </span>
              </div>
              {uploadModal.registration?.paymentCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Code:</span>
                  <span className="font-mono text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                    {uploadModal.registration.paymentCode}
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="paymentFile">Choose Payment Proof File</Label>
              <Input
                id="paymentFile"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="mt-1"
              />
              {fileError && (
                <p className="text-sm text-red-600 mt-1">{fileError.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPG, PNG, PDF | Max size: 5MB
              </p>
            </div>
            
            {uploadFile && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{uploadFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadModal({isOpen: false, registration: null})
                setUploadFile(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePayment}
              disabled={!uploadFile || isUploading || !!fileError}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadModal.registration?.status === 'PENDING_PAYMENT' ? 'Upload' : 'Update'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
