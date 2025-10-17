'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Image,
  Video
} from 'lucide-react'

interface DCCUploadFormProps {
  category: 'DCC_INFOGRAFIS' | 'DCC_SHORT_VIDEO'
  onSubmit: (data: any) => Promise<void>
  existingSubmission?: any
  isLoading?: boolean
  deadline?: string
}

interface FileValidation {
  isValid: boolean
  error?: string
  size?: number
  type?: string
}

export default function DCCUploadForm({
  category,
  onSubmit,
  existingSubmission,
  isLoading = false,
  deadline
}: DCCUploadFormProps) {
  const [formData, setFormData] = useState({
    judulKarya: '',
    deskripsiKarya: '',
    videoLink: '' // For DCC_SHORT_VIDEO Google Drive link
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileValidation, setFileValidation] = useState<FileValidation>({ isValid: true })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileConstraints = () => {
    if (category === 'DCC_INFOGRAFIS') {
      return {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
        allowedExtensions: ['.png', '.jpg', '.jpeg', '.pdf']
      }
    } else {
      return {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
        allowedExtensions: ['.mp4', '.mov', '.avi']
      }
    }
  }

  const validateFile = (file: File): FileValidation => {
    const constraints = getFileConstraints()

    // Check file size
    if (file.size > constraints.maxSize) {
      const maxSizeMB = constraints.maxSize / (1024 * 1024)
      return {
        isValid: false,
        error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB`
      }
    }

    // Check file type
    if (!constraints.allowedTypes.includes(file.type)) {
      const allowedFormats = constraints.allowedExtensions.join(', ')
      return {
        isValid: false,
        error: `Format file tidak didukung. Gunakan: ${allowedFormats}`
      }
    }

    // Additional validation for video duration (if needed)
    if (category === 'DCC_SHORT_VIDEO') {
      // Note: We can't easily check video duration in the browser without loading the video
      // This would typically be done on the server side
    }

    return {
      isValid: true,
      size: file.size,
      type: file.type
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      setFileValidation({ isValid: true })
      return
    }

    const validation = validateFile(file)
    setFileValidation(validation)

    if (validation.isValid) {
      setSelectedFile(file)
      setErrors(prev => ({ ...prev, fileKarya: '' }))
    } else {
      setSelectedFile(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileValidation({ isValid: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.judulKarya.trim()) {
      newErrors.judulKarya = 'Judul karya harus diisi'
    }

    if (!formData.deskripsiKarya.trim()) {
      newErrors.deskripsiKarya = 'Deskripsi karya harus diisi'
    }

    // For DCC_SHORT_VIDEO, validate link instead of file
    if (category === 'DCC_SHORT_VIDEO') {
      if (!formData.videoLink.trim() && !existingSubmission?.submitted) {
        newErrors.videoLink = 'Link Google Drive video harus diisi'
      } else if (formData.videoLink.trim() && !formData.videoLink.includes('drive.google.com')) {
        newErrors.videoLink = 'Link harus dari Google Drive'
      }
    } else {
      // For DCC_INFOGRAFIS, validate file
      if (!selectedFile && !existingSubmission?.submitted) {
        newErrors.fileKarya = 'File karya harus diupload'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!fileValidation.isValid) {
      return
    }

    try {
      await onSubmit({
        ...formData,
        fileKarya: selectedFile
      })

      // Reset form after successful submission
      setFormData({ judulKarya: '', deskripsiKarya: '', videoLink: '' })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false
  const canSubmit = !existingSubmission?.submitted && !isDeadlinePassed

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {category === 'DCC_INFOGRAFIS' ? (
            <Image className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )}
          Upload {category === 'DCC_INFOGRAFIS' ? 'Infografis' : 'Short Video'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Deadline Warning */}
        {deadline && (
          <Alert className={`mb-6 ${isDeadlinePassed ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isDeadlinePassed ? (
                <span className="text-red-800">
                  <strong>Deadline telah berlalu.</strong> Upload sudah tidak dapat dilakukan.
                </span>
              ) : (
                <span className="text-yellow-800">
                  <strong>Deadline:</strong> {new Date(deadline).toLocaleString('id-ID')}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Already Submitted Warning */}
        {existingSubmission?.submitted && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <span className="text-blue-800">
                Anda sudah submit karya untuk kategori ini. Form di bawah hanya untuk melihat data yang telah disubmit.
              </span>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="judulKarya">
              Judul Karya *
            </Label>
            <Input
              id="judulKarya"
              type="text"
              value={formData.judulKarya}
              onChange={(e) => setFormData(prev => ({ ...prev, judulKarya: e.target.value }))}
              placeholder={`Masukkan judul ${category === 'DCC_INFOGRAFIS' ? 'infografis' : 'video'} Anda`}
              disabled={!canSubmit}
              className={errors.judulKarya ? 'border-red-500' : ''}
            />
            {errors.judulKarya && (
              <p className="text-sm text-red-600">{errors.judulKarya}</p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="deskripsiKarya">
              Deskripsi Karya *
            </Label>
            <Textarea
              id="deskripsiKarya"
              value={formData.deskripsiKarya}
              onChange={(e) => setFormData(prev => ({ ...prev, deskripsiKarya: e.target.value }))}
              placeholder={`Jelaskan konsep dan tujuan ${category === 'DCC_INFOGRAFIS' ? 'infografis' : 'video'} Anda`}
              rows={4}
              disabled={!canSubmit}
              className={errors.deskripsiKarya ? 'border-red-500' : ''}
            />
            {errors.deskripsiKarya && (
              <p className="text-sm text-red-600">{errors.deskripsiKarya}</p>
            )}
          </div>

          {/* File Upload or Link Input based on category */}
          {category === 'DCC_SHORT_VIDEO' ? (
            // Google Drive Link Input for Short Video
            <div className="space-y-2">
              <Label htmlFor="videoLink">
                Link Google Drive Video *
              </Label>
              <Input
                id="videoLink"
                type="url"
                value={formData.videoLink}
                onChange={(e) => setFormData(prev => ({ ...prev, videoLink: e.target.value }))}
                placeholder="https://drive.google.com/file/d/..."
                disabled={!canSubmit}
                className={errors.videoLink ? 'border-red-500' : ''}
              />
              {errors.videoLink && (
                <p className="text-sm text-red-600">{errors.videoLink}</p>
              )}
              <p className="text-sm text-gray-500">
                Pastikan link Google Drive dapat diakses oleh siapa saja (Anyone with the link)
              </p>
            </div>
          ) : (
            // File Upload for Infografis
            <div className="space-y-2">
              <Label htmlFor="fileKarya">
                File Infografis *
              </Label>

            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    {canSubmit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!canSubmit}
                    >
                      Pilih File
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      {category === 'DCC_INFOGRAFIS'
                        ? 'PNG, JPG, atau PDF (maks. 10MB)'
                        : 'MP4, MOV, atau AVI (maks. 100MB)'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={getFileConstraints().allowedExtensions.join(',')}
              onChange={handleFileChange}
              className="hidden"
              disabled={!canSubmit}
            />

            {/* File Validation Error */}
            {!fileValidation.isValid && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {fileValidation.error}
                </AlertDescription>
              </Alert>
            )}

              {errors.fileKarya && (
                <p className="text-sm text-red-600">{errors.fileKarya}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          {canSubmit && (
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !fileValidation.isValid}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Karya
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}