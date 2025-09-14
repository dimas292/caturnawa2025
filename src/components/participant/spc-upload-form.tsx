'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  File,
  Download,
  Clock,
  Info
} from 'lucide-react'

interface SPCUploadData {
  judulKarya: string
  fileKarya: File | null
  suratOrisinalitas: File | null
  suratPengalihanHakCipta: File | null
  catatan?: string
}

interface SPCUploadFormProps {
  onSubmit: (data: SPCUploadData) => void
  existingSubmission?: any
  isLoading?: boolean
  deadline?: string
}

export default function SPCUploadForm({
  onSubmit,
  existingSubmission,
  isLoading = false,
  deadline
}: SPCUploadFormProps) {
  const [formData, setFormData] = useState<SPCUploadData>({
    judulKarya: existingSubmission?.judulKarya || '',
    fileKarya: null,
    suratOrisinalitas: null,
    suratPengalihanHakCipta: null,
    catatan: existingSubmission?.catatan || ''
  })

  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDragOver, setIsDragOver] = useState<Record<string, boolean>>({})

  // Check if deadline has passed
  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false

  // File validation
  const validateFile = (file: File, fieldName: string): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf']

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'File harus berformat PDF' }))
      return false
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Ukuran file maksimal 10MB' }))
      return false
    }

    // Clear error if validation passes
    setErrors(prev => ({ ...prev, [fieldName]: '' }))
    return true
  }

  // Handle file selection
  const handleFileChange = (fieldName: keyof SPCUploadData, file: File | null) => {
    if (file && validateFile(file, fieldName)) {
      setFormData(prev => ({ ...prev, [fieldName]: file }))
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault()
    setIsDragOver(prev => ({ ...prev, [fieldName]: true }))
  }

  const handleDragLeave = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault()
    setIsDragOver(prev => ({ ...prev, [fieldName]: false }))
  }

  const handleDrop = (e: React.DragEvent, fieldName: keyof SPCUploadData) => {
    e.preventDefault()
    setIsDragOver(prev => ({ ...prev, [fieldName]: false }))
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileChange(fieldName, files[0])
    }
  }

  // Remove file
  const removeFile = (fieldName: keyof SPCUploadData) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }))
    setErrors(prev => ({ ...prev, [fieldName]: '' }))
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.judulKarya.trim()) {
      newErrors.judulKarya = 'Judul karya wajib diisi'
    }

    if (!formData.fileKarya && !existingSubmission?.fileKarya) {
      newErrors.fileKarya = 'File karya wajib diupload'
    }

    if (!formData.suratOrisinalitas && !existingSubmission?.suratOrisinalitas) {
      newErrors.suratOrisinalitas = 'Surat pernyataan orisinalitas wajib diupload'
    }

    if (!formData.suratPengalihanHakCipta && !existingSubmission?.suratPengalihanHakCipta) {
      newErrors.suratPengalihanHakCipta = 'Surat pengalihan hak cipta wajib diupload'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (isDeadlinePassed) return

    try {
      setUploadProgress(10)
      await onSubmit(formData)
      setUploadProgress(100)
    } catch (error) {
      setUploadProgress(0)
      console.error('Upload error:', error)
    }
  }

  // File upload component
  const FileUploadArea = ({ 
    fieldName, 
    label, 
    description, 
    required = true,
    existingFile 
  }: {
    fieldName: keyof SPCUploadData
    label: string
    description: string
    required?: boolean
    existingFile?: string
  }) => {
    const file = formData[fieldName] as File | null
    const error = errors[fieldName]
    const dragOver = isDragOver[fieldName]

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <p className="text-xs text-gray-600">{description}</p>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => handleDragOver(e, fieldName)}
          onDragLeave={(e) => handleDragLeave(e, fieldName)}
          onDrop={(e) => handleDrop(e, fieldName)}
        >
          {file ? (
            // File selected
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFile(fieldName)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : existingFile ? (
            // Existing file
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium">File sudah diupload sebelumnya</p>
                  <p className="text-xs text-gray-500">Klik upload baru untuk mengganti</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(existingFile, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Lihat
                </Button>
              </div>
            </div>
          ) : (
            // Upload area
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label
                  htmlFor={fieldName}
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Pilih File PDF
                </Label>
                <Input
                  id={fieldName}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileChange(fieldName, file)
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                atau drag & drop file PDF di sini
              </p>
              <p className="text-xs text-gray-400">
                Maksimal 10MB
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-red-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Upload Karya SPC (Speech Competition)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                Upload naskah pidato Anda beserta dokumen pendukung untuk mengikuti tahap semifinal SPC.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {deadline && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Deadline: {new Date(deadline).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <Badge variant={isDeadlinePassed ? "destructive" : "secondary"}>
                  {isDeadlinePassed ? "Deadline Terlewat" : "Masih Bisa Upload"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadline Alert */}
      {isDeadlinePassed && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Deadline upload telah terlewat. Anda tidak dapat melakukan upload atau perubahan lagi.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Judul Karya */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Informasi Karya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="judulKarya" className="text-sm font-medium">
                Judul Karya <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judulKarya"
                placeholder="Masukkan judul naskah pidato Anda"
                value={formData.judulKarya}
                onChange={(e) => setFormData(prev => ({ ...prev, judulKarya: e.target.value }))}
                className={errors.judulKarya ? 'border-red-300' : ''}
                disabled={isDeadlinePassed}
              />
              {errors.judulKarya && (
                <p className="text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.judulKarya}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan" className="text-sm font-medium">
                Catatan Tambahan (Opsional)
              </Label>
              <Textarea
                id="catatan"
                placeholder="Catatan atau keterangan tambahan tentang karya Anda"
                value={formData.catatan}
                onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                rows={3}
                disabled={isDeadlinePassed}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Upload Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Karya */}
            <FileUploadArea
              fieldName="fileKarya"
              label="File Karya (Naskah Pidato)"
              description="Upload naskah pidato dalam format PDF. File ini akan dinilai oleh juri di tahap semifinal."
              existingFile={existingSubmission?.fileKarya}
            />

            {/* Surat Orisinalitas */}
            <FileUploadArea
              fieldName="suratOrisinalitas"
              label="Scan Surat Pernyataan Orisinalitas Karya"
              description="Upload scan surat pernyataan bahwa karya ini adalah hasil karya sendiri dan bukan plagiat."
              existingFile={existingSubmission?.suratOrisinalitas}
            />

            {/* Surat Pengalihan Hak Cipta */}
            <FileUploadArea
              fieldName="suratPengalihanHakCipta"
              label="Scan Surat Pernyataan Pengalihan Hak Cipta"
              description="Upload scan surat pernyataan pengalihan hak cipta karya kepada penyelenggara."
              existingFile={existingSubmission?.suratPengalihanHakCipta}
            />
          </CardContent>
        </Card>

        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mengupload...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Pastikan semua dokumen sudah benar sebelum upload
              </div>
              <Button
                type="submit"
                disabled={isLoading || isDeadlinePassed}
                className="min-w-32"
              >
                {isLoading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Mengupload...
                  </>
                ) : existingSubmission ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Submission
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Karya
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}