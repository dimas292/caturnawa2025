"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileText, CheckCircle, Loader2 } from "lucide-react"
import { Member, CompetitionData, WorkSubmission } from "@/types/registration"

interface FileUploadFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    members: Member[]
    workSubmission?: WorkSubmission
  }
  onFormDataChange: (data: { members?: Member[]; workSubmission?: WorkSubmission }) => void
  registrationId?: string
}

interface FileUploadFieldProps {
  title: string
  description: string
  memberIndex: number
  fieldName: keyof Member | "workFile"
  accept?: string
  maxSize?: string
  currentFile: File | null
  onFileChange: (file: File | null) => void
}

function FileUploadField({
  title,
  description,
  memberIndex,
  fieldName,
  accept = ".jpg,.jpeg,.png,.pdf",
  maxSize = "10MB",
  currentFile,
  onFileChange,
  registrationId,
  memberId
}: FileUploadFieldProps & { registrationId?: string; memberId?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (file: File | null) => {
    if (file) {
      // Validate file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSizeBytes = 10 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        alert(`File terlalu besar. Maksimal ${maxSize}`)
        return
      }
      
      // Validate file type
      const allowedTypes = accept.split(',').map(type => type.trim())
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedTypes.some(type => type.includes(fileExtension))) {
        alert(`Format file tidak didukung. Gunakan: ${accept}`)
        return
      }
      
      // If we have a registration ID, upload the file
      if (registrationId) {
        setIsUploading(true)
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('fileType', fieldName.toUpperCase())
          formData.append('registrationId', registrationId)
          if (memberId) {
            formData.append('memberId', memberId)
          }

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Upload gagal')
          }

          const result = await response.json()
          
          // File uploaded successfully
          onFileChange(file)
          
          // Show success message
          console.log('File uploaded successfully:', result.message)
          // In production, you would show a toast notification here
        } catch (error) {
          console.error('Upload error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Upload gagal'
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
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title} *</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      
      {currentFile ? (
        <div className="border rounded-lg p-3 bg-muted/50">
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
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
            <p className="text-sm">Klik atau drag file ke sini</p>
            <p className="text-xs text-muted-foreground">
              Format: {accept} | Max: {maxSize}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
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
              'Pilih File'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export function FileUploadForm({
  selectedCompetition,
  formData,
  onFormDataChange,
  registrationId
}: FileUploadFormProps) {
  const updateMemberFile = (memberIndex: number, fieldName: keyof Member, file: File | null) => {
    const newMembers = [...formData.members]
    newMembers[memberIndex] = { ...newMembers[memberIndex], [fieldName]: file }
    onFormDataChange({ members: newMembers })
  }

  const updateWorkSubmission = (field: keyof WorkSubmission, value: string | File | null) => {
    const newWorkSubmission = {
      ...formData.workSubmission,
      [field]: value
    }
    onFormDataChange({ workSubmission: newWorkSubmission })
  }

  if (!selectedCompetition) return null

  return (
    <div className="space-y-6">
      {formData.members.map((member, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>
              Upload Berkas - {member.role === "LEADER" ? "Ketua Tim" : `Anggota ${index}`}
            </CardTitle>
            <CardDescription>
              Upload semua dokumen yang diperlukan sesuai ketentuan
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FileUploadField
              title="Kartu Tanda Mahasiswa (KTM)"
              description="Foto/scan KTM yang masih berlaku"
              memberIndex={index}
              fieldName="ktm"
              accept=".jpg,.jpeg,.png,.pdf"
              currentFile={member.ktm}
              onFileChange={(file) => updateMemberFile(index, "ktm", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            <FileUploadField
              title="Pas Foto 3x4"
              description="Foto formal dengan background merah"
              memberIndex={index}
              fieldName="photo"
              accept=".jpg,.jpeg,.png"
              currentFile={member.photo}
              onFileChange={(file) => updateMemberFile(index, "photo", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            <FileUploadField
              title="Kartu Hasil Studi (KHS)"
              description="KHS semester terakhir"
              memberIndex={index}
              fieldName="khs"
              accept=".pdf"
              currentFile={member.khs}
              onFileChange={(file) => updateMemberFile(index, "khs", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            <FileUploadField
              title="Bukti Follow Sosial Media"
              description="Screenshot follow IG, YouTube, TikTok @unasfest"
              memberIndex={index}
              fieldName="socialMediaProof"
              accept=".jpg,.jpeg,.png,.pdf"
              currentFile={member.socialMediaProof}
              onFileChange={(file) => updateMemberFile(index, "socialMediaProof", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            <FileUploadField
              title="Bukti Share Twibbon"
              description="Screenshot share twibbon UNAS FEST 2025"
              memberIndex={index}
              fieldName="twibbonProof"
              accept=".jpg,.jpeg,.png"
              currentFile={member.twibbonProof}
              onFileChange={(file) => updateMemberFile(index, "twibbonProof", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            {selectedCompetition.category === "debate" && index === 0 && (
              <FileUploadField
                title="Surat Pengantar Delegasi"
                description="Surat dari universitas yang ditandatangani pejabat berwenang"
                memberIndex={index}
                fieldName="delegationLetter"
                accept=".pdf"
                currentFile={member.delegationLetter}
                onFileChange={(file) => updateMemberFile(index, "delegationLetter", file)}
                registrationId={registrationId}
                memberId={`member-${index}`}
              />
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Work Submission for non-debate competitions */}
      {selectedCompetition.category !== "debate" && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Karya (Opsional)</CardTitle>
            <CardDescription>
              Upload karya Anda sekarang atau nanti setelah pendaftaran selesai
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Judul Karya</Label>
              <Input
                placeholder="Masukkan judul karya"
                value={formData.workSubmission?.title || ""}
                onChange={(e) => updateWorkSubmission("title", e.target.value)}
              />
            </div>
            
            <div>
              <Label>Deskripsi Karya</Label>
              <Textarea
                placeholder="Jelaskan tentang karya Anda"
                value={formData.workSubmission?.description || ""}
                onChange={(e) => updateWorkSubmission("description", e.target.value)}
              />
            </div>

            {selectedCompetition.id === "dcc-video" ? (
              <div>
                <Label>Link Google Drive Video</Label>
                <Input
                  placeholder="https://drive.google.com/..."
                  value={formData.workSubmission?.link || ""}
                  onChange={(e) => updateWorkSubmission("link", e.target.value)}
                />
              </div>
            ) : (
              <div>
                <Label>Upload File Karya</Label>
                <FileUploadField
                  title=""
                  description=""
                  memberIndex={0}
                  fieldName="workFile"
                  accept={selectedCompetition.id === "spc" ? ".pdf" : ".jpg,.png,.pdf"}
                  currentFile={formData.workSubmission?.file || null}
                  onFileChange={(file) => updateWorkSubmission("file", file)}
                  registrationId={registrationId}
                  memberId="work-submission"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
