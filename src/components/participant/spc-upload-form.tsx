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
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-semibold">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-all ${
            dragOver
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : error
              ? 'border-destructive bg-destructive/5'
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
          }`}
          onDragOver={(e) => handleDragOver(e, fieldName)}
          onDragLeave={(e) => handleDragLeave(e, fieldName)}
          onDrop={(e) => handleDrop(e, fieldName)}
        >
          {file ? (
            // File selected
            <div className="flex items-center justify-between bg-green-50 p-4 rounded-md">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFile(fieldName)}
                className="hover:bg-red-50 hover:border-red-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : existingFile ? (
            // Existing file
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-md">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">File sudah diupload sebelumnya</p>
                    <p className="text-xs text-gray-600">Upload file baru untuk mengganti</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(existingFile, '_blank')}
                  className="hover:bg-blue-100"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Lihat File
                </Button>
              </div>
              
              {/* Upload new file option */}
              <div className="text-center border-t pt-4">
                <Label
                  htmlFor={`${fieldName}-replace`}
                  className="cursor-pointer inline-flex items-center px-5 py-2.5 border-2 border-primary text-sm font-semibold rounded-lg text-primary bg-white hover:bg-primary hover:text-white transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File Baru
                </Label>
                <Input
                  id={`${fieldName}-replace`}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileChange(fieldName, file)
                  }}
                  disabled={isDeadlinePassed}
                />
              </div>
            </div>
          ) : (
            // Upload area
            <div className="text-center py-4">
              <Upload className="mx-auto h-14 w-14 text-gray-400 mb-4" />
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor={fieldName}
                    className="cursor-pointer inline-flex items-center px-6 py-3 border-2 border-primary text-base font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-all hover:shadow-md"
                  >
                    <Upload className="h-5 w-5 mr-2" />
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
                    disabled={isDeadlinePassed}
                  />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  atau drag & drop file PDF di sini
                </p>
                <p className="text-xs text-gray-500">
                  Format: PDF • Maksimal: 10MB
                </p>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700 flex items-center font-medium">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-6">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            Upload Karya SPC (Scientific Paper Competition)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-3 flex-1">
              <p className="text-sm text-foreground leading-relaxed">
                Upload karya ilmiah Anda beserta dokumen pendukung untuk mengikuti tahap semifinal SPC.
              </p>
              <div className="flex items-center gap-4 text-sm">
                {deadline && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Deadline: <span className="font-medium text-foreground">{new Date(deadline).toLocaleString('id-ID')}</span>
                    </span>
                  </div>
                )}
                <Badge variant={isDeadlinePassed ? "destructive" : "secondary"} className="font-medium">
                  {isDeadlinePassed ? "Deadline Terlewat" : "Masih Bisa Upload"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadline Alert */}
      {isDeadlinePassed && (
        <Alert className="border-destructive/50 bg-destructive/5 shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Deadline upload telah terlewat. Anda tidak dapat melakukan upload atau perubahan lagi.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Judul Karya */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">1. Informasi Karya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
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
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">2. Upload Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-0">
            {/* File Karya */}
            <div className="w-full">
              <FileUploadArea
                fieldName="fileKarya"
                label="File Karya (Karya Ilmiah)"
                description="Upload karya ilmiah dalam format PDF. File ini akan dinilai oleh juri di tahap semifinal."
                existingFile={existingSubmission?.fileKarya}
              />
            </div>

            {/* Surat Orisinalitas */}
            <div className="w-full">
              <FileUploadArea
                fieldName="suratOrisinalitas"
                label="Scan Surat Pernyataan Orisinalitas Karya"
                description="Upload scan surat pernyataan bahwa karya ini adalah hasil karya sendiri dan bukan plagiat."
                existingFile={existingSubmission?.suratOrisinalitas}
              />
            </div>

            {/* Surat Pengalihan Hak Cipta */}
            <div className="w-full">
              <FileUploadArea
                fieldName="suratPengalihanHakCipta"
                label="Scan Surat Pernyataan Pengalihan Hak Cipta"
                description="Upload scan surat pernyataan pengalihan hak cipta karya kepada penyelenggara."
                existingFile={existingSubmission?.suratPengalihanHakCipta}
              />
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Mengupload...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Card className="shadow-sm bg-muted/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Pastikan semua dokumen sudah benar sebelum upload</p>
              </div>
              <Button
                type="submit"
                disabled={isLoading || isDeadlinePassed}
                className="min-w-40 h-11"
                size="lg"
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