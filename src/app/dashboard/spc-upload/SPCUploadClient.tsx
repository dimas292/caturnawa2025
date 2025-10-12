'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import SPCUploadForm from '@/components/participant/spc-upload-form'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Info
} from 'lucide-react'

interface SPCUploadClientProps {
  user: any
}

interface SubmissionStatus {
  submitted: boolean
  submittedAt?: string
  status: 'pending' | 'reviewed' | 'qualified' | 'not_qualified'
  feedback?: string
  judulKarya?: string
  fileUrls?: {
    karya?: string
    orisinalitas?: string
    hakCipta?: string
  }
}

export default function SPCUploadClient({ user }: SPCUploadClientProps) {
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Fetch existing submission
  useEffect(() => {
    fetchSubmissionStatus()
  }, [])

  const fetchSubmissionStatus = async () => {
    try {
      setIsInitialLoading(true)
      const response = await fetch('/api/participant/spc/submission-status')
      if (response.ok) {
        const data = await response.json()
        setSubmissionStatus(data)
      }
    } catch (error) {
      console.error('Error fetching submission status:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('judulKarya', formData.judulKarya)
      submitData.append('catatan', formData.catatan || '')
      
      if (formData.fileKarya) {
        submitData.append('fileKarya', formData.fileKarya)
      }
      if (formData.suratOrisinalitas) {
        submitData.append('suratOrisinalitas', formData.suratOrisinalitas)
      }
      if (formData.suratPengalihanHakCipta) {
        submitData.append('suratPengalihanHakCipta', formData.suratPengalihanHakCipta)
      }

      const response = await fetch('/api/participant/spc/upload', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        const result = await response.json()
        setSubmissionStatus({
          submitted: true,
          submittedAt: new Date().toISOString(),
          status: 'pending',
          judulKarya: formData.judulKarya
        })
        alert('Karya berhasil disubmit! Menunggu review dari juri.')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Gagal mengupload karya'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Terjadi kesalahan saat mengupload karya')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu Review</Badge>
      case 'reviewed':
        return <Badge variant="outline">Sudah Direview</Badge>
      case 'qualified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Lolos ke Final</Badge>
      case 'not_qualified':
        return <Badge variant="destructive">Tidak Lolos</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading submission data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 pt-8 pb-6">
          <div className="space-y-4">
            {/* Back Button */}
            <div className="flex justify-start pt-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            {/* Title Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-base text-muted-foreground">
                  Scientific Paper Competition - Semifinal Stage
                </p>
              </div>
              
              <div className="text-right space-y-0.5">
                <p className="text-sm font-medium text-gray-700">Peserta: {user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-0 pb-8">
        {/* Submission Status Card */}
        {submissionStatus?.submitted && (
          <Card className="w-full max-w-4xl mx-auto mb-6 border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Status Submission
                </CardTitle>
                {getStatusBadge(submissionStatus.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Judul Karya:</p>
                    <p className="text-gray-900">{submissionStatus.judulKarya}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Tanggal Submit:</p>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {submissionStatus.submittedAt 
                        ? new Date(submissionStatus.submittedAt).toLocaleString('id-ID')
                        : '-'
                      }
                    </p>
                  </div>
                </div>

                {submissionStatus.feedback && (
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="font-medium text-blue-900 mb-1">Feedback Juri:</p>
                    <p className="text-blue-800 text-sm">{submissionStatus.feedback}</p>
                  </div>
                )}

                {submissionStatus.status === 'qualified' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Selamat!</strong> Anda lolos ke tahap final. Informasi lebih lanjut akan dikirimkan melalui email.
                    </AlertDescription>
                  </Alert>
                )}

                {submissionStatus.status === 'not_qualified' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Mohon maaf, karya Anda belum memenuhi kriteria untuk melanjutkan ke tahap final. 
                      Terima kasih atas partisipasi Anda.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Form */}
        <SPCUploadForm
          onSubmit={handleSubmit}
          existingSubmission={submissionStatus}
          isLoading={isLoading}
          deadline="2025-12-31T23:59:59" // Deadline diperpanjang
        />
      </main>
    </div>
  )
}