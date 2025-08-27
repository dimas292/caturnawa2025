"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText } from "lucide-react"

interface PaymentProofUploadProps {
  onFileChange: (file: File | null) => void
  currentFile: File | null
}

export function PaymentProofUpload({ onFileChange, currentFile }: PaymentProofUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSizeBytes = 5 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        alert("File terlalu besar. Maksimal 5MB")
        return
      }
      
      // Validate file type
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedTypes.includes(fileExtension)) {
        alert("Format file tidak didukung. Gunakan: JPG, PNG, PDF")
        return
      }
      
      onFileChange(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
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
      <Label>Upload Bukti Pembayaran *</Label>
      
      {currentFile ? (
        <div className="border rounded-lg p-3 bg-muted/50 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{currentFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-6 w-6 p-0"
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
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm">Upload screenshot/foto bukti transfer</p>
          <p className="text-xs text-muted-foreground">Format: JPG, PNG, PDF | Max: 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => fileInputRef.current?.click()}
          >
            Pilih File
          </Button>
        </div>
      )}
    </div>
  )
}
