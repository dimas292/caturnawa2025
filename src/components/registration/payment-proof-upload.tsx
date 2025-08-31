"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, Loader2 } from "lucide-react"

interface PaymentProofUploadProps {
  onFileChange: (file: File | null) => void
  currentFile: File | null
  registrationId?: string
}

export function PaymentProofUpload({ onFileChange, currentFile, registrationId }: PaymentProofUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (file: File | null) => {
    if (file) {
      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSizeBytes = 5 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        alert("File is too large. Maximum size: 5MB")
        return
      }
      
      // Validate file type
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedTypes.includes(fileExtension)) {
        alert("File format not supported. Use: JPG, PNG, PDF")
        return
      }
      
      // If we have a registration ID, upload the file
      if (registrationId) {
        setIsUploading(true)
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('registrationId', registrationId)

          const response = await fetch('/api/payment-proof', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Upload failed')
          }

          const result = await response.json()
          
          // File uploaded successfully
          onFileChange(file)
          
          // Show success message
          console.log('Payment proof uploaded successfully:', result.message)
          // In production, you would show a toast notification here
        } catch (error) {
          console.error('Upload error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          alert(`Error: ${errorMessage}`)
          return
        } finally {
          setIsUploading(false)
        }
      } else {
        // Just store the file for now
        onFileChange(file)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    if (isUploading) return
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (isUploading) return
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    if (isUploading) return
    setIsDragOver(false)
  }

  const removeFile = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <Label>Upload Payment Proof *</Label>
      
      {currentFile ? (
        <div className="border rounded-lg p-3 bg-muted/50 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{currentFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              {isUploading && (
                <div className="flex items-center space-x-1 text-xs text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-6 w-6 p-0"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center mt-2 transition-colors ${
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <div className="space-y-1">
            <p className="text-sm">Click or drag file here</p>
            <p className="text-xs text-muted-foreground">Format: JPG, PNG, PDF | Max: 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
            disabled={isUploading}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Choose File'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
