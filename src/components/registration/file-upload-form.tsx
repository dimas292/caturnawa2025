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
        alert(`File is too large. Maximum size: ${maxSize}`)
        return
      }
      
      // Validate file type
      const allowedTypes = accept.split(',').map(type => type.trim())
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedTypes.some(type => type.includes(fileExtension))) {
        alert(`File format not supported. Use: ${accept}`)
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
            throw new Error(errorData.error || 'Upload failed')
          }

          const result = await response.json()
          
          // File uploaded successfully
          onFileChange(file)
          
          // Show success message
          console.log('File uploaded successfully:', result.message)
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
            <p className="text-sm">Click or drag file here</p>
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
              'Choose File'
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
              Document Upload - {member.role === "LEADER" ? "Team Leader" : `Member ${index}`}
            </CardTitle>
            <CardDescription>
              Upload all required documents according to the requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FileUploadField
              title="Scan of Student Card / Certificate of Active Student Status"
              description="Photo/scan of valid student ID card or active student certificate"
              memberIndex={index}
              fieldName="ktm"
              accept=".jpg,.jpeg,.png,.pdf"
              currentFile={member.ktm}
              onFileChange={(file) => updateMemberFile(index, "ktm", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            <FileUploadField
              title="Passport-Style Photo with Red Background (Size: 4x6 cm)"
              description="Formal passport-style photo with red background, size 4x6 cm"
              memberIndex={index}
              fieldName="photo"
              accept=".jpg,.jpeg,.png"
              currentFile={member.photo}
              onFileChange={(file) => updateMemberFile(index, "photo", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            <FileUploadField
              title="Study Plan Card (KRS)"
              description="Latest semester study plan card (KRS)"
              memberIndex={index}
              fieldName="khs"
              accept=".pdf"
              currentFile={member.khs}
              onFileChange={(file) => updateMemberFile(index, "khs", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            <FileUploadField
              title="Proof of Twibbon Upload and Participation in All Official UNAS FEST Social Media Accounts (Screenshot)"
              description="Screenshot of following IG, YouTube, TikTok @unasfest and sharing twibbon"
              memberIndex={index}
              fieldName="socialMediaProof"
              accept=".jpg,.jpeg,.png,.pdf"
              currentFile={member.socialMediaProof}
              onFileChange={(file) => updateMemberFile(index, "socialMediaProof", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            <FileUploadField
              title="Proof of Twibbon Upload and Participation in All Official UNAS FEST Social Media Accounts (Screenshot)"
              description="Screenshot of sharing UNAS FEST 2025 twibbon"
              memberIndex={index}
              fieldName="twibbonProof"
              accept=".jpg,.jpeg,.png"
              currentFile={member.twibbonProof}
              onFileChange={(file) => updateMemberFile(index, "twibbonProof", file)}
              registrationId={registrationId}
              memberId={`member-${index}`}
            />
            
            {/* Achievements proof for SPC */}
            {selectedCompetition.id === "spc" && (
              <FileUploadField
                title="Proof of Achievements / Outstanding Accomplishments"
                description="Upload proof of your achievements (Maximum 10 files, combined in one PDF)"
                memberIndex={index}
                fieldName="achievementsProof"
                accept=".pdf"
                currentFile={member.achievementsProof}
                onFileChange={(file) => updateMemberFile(index, "achievementsProof", file)}
                registrationId={registrationId}
                memberId={`member-${index}`}
              />
            )}
            
            {/* DCC specific file uploads */}
            {(selectedCompetition.id === "dcc-infografis" || selectedCompetition.id === "dcc-short-video") && (
              <>
                <FileUploadField
                  title="Kartu Pelajar/Surat Keterangan Siswa Aktif"
                  description="Foto/scan kartu pelajar atau surat keterangan siswa aktif"
                  memberIndex={index}
                  fieldName="ktm"
                  accept=".jpg,.jpeg,.png,.pdf"
                  currentFile={member.ktm}
                  onFileChange={(file) => updateMemberFile(index, "ktm", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                />
                
                <FileUploadField
                  title="Foto 3x4 Background Merah"
                  description="Foto 3x4 dengan background merah"
                  memberIndex={index}
                  fieldName="photo"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.photo}
                  onFileChange={(file) => updateMemberFile(index, "photo", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                />
                
                <FileUploadField
                  title="Bukti Follow Instagram UNAS FEST"
                  description="Screenshot bukti follow Instagram @unasfest"
                  memberIndex={index}
                  fieldName="socialMediaProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.socialMediaProof}
                  onFileChange={(file) => updateMemberFile(index, "socialMediaProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                />
                
                <FileUploadField
                  title="Bukti Follow YouTube UNAS FEST"
                  description="Screenshot bukti follow YouTube UNAS FEST"
                  memberIndex={index}
                  fieldName="twibbonProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.twibbonProof}
                  onFileChange={(file) => updateMemberFile(index, "twibbonProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                />
                
                <FileUploadField
                  title="Bukti Follow TikTok UNAS FEST"
                  description="Screenshot bukti follow TikTok UNAS FEST"
                  memberIndex={index}
                  fieldName="delegationLetter"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.delegationLetter}
                  onFileChange={(file) => updateMemberFile(index, "delegationLetter", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                />
                
                <FileUploadField
                  title="Bukti SS Twibbon"
                  description="Screenshot bukti share twibbon UNAS FEST"
                  memberIndex={index}
                  fieldName="achievementsProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.achievementsProof}
                  onFileChange={(file) => updateMemberFile(index, "achievementsProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                />
              </>
            )}
            
            {/* Delegation Letter for KDBI/EDC - Only for Debater 2 (index 1) */}
            {(selectedCompetition.id === "kdbi" || selectedCompetition.id === "edc") && index === 1 && (
              <FileUploadField
                title="Surat Pengantar Delegasi (Delegation Letter)"
                description="Surat dari universitas yang ditandatangani oleh Wakil Rektor, Dekan, atau Wakil Dekan"
                memberIndex={index}
                fieldName="delegationLetter"
                accept=".pdf,.jpg,.jpeg,.png"
                currentFile={member.delegationLetter}
                onFileChange={(file) => updateMemberFile(index, "delegationLetter", file)}
                registrationId={registrationId}
                memberId={`member-${index}`}
              />
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* DCC Statement of Willingness to Attend */}
      {(selectedCompetition.id === "dcc-infografis" || selectedCompetition.id === "dcc-short-video") && (
        <Card>
          <CardHeader>
            <CardTitle>Pernyataan Kesediaan Hadir</CardTitle>
            <CardDescription>
              Upload pernyataan kesediaan hadir dari semua anggota tim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadField
              title="Pernyataan Kesediaan Hadir"
              description="Upload pernyataan kesediaan hadir dari semua anggota tim"
              memberIndex={0}
              fieldName="workFile"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={formData.workSubmission?.file || null}
              onFileChange={(file) => updateWorkSubmission("file", file)}
              registrationId={registrationId}
              memberId="statement-of-willingness"
            />
          </CardContent>
        </Card>
      )}
      
      {/* Work Submission for non-debate competitions (excluding SPC and DCC) */}
      {selectedCompetition.category !== "debate" && selectedCompetition.id !== "spc" && selectedCompetition.id !== "dcc-infografis" && selectedCompetition.id !== "dcc-short-video" && (
        <Card>
          <CardHeader>
            <CardTitle>Work Submission (Optional)</CardTitle>
            <CardDescription>
              Upload your work now or later after registration is complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Work Title</Label>
              <Input
                placeholder="Enter work title"
                value={formData.workSubmission?.title || ""}
                onChange={(e) => updateWorkSubmission("title", e.target.value)}
              />
            </div>
            
            <div>
              <Label>Work Description</Label>
              <Textarea
                placeholder="Describe your work"
                value={formData.workSubmission?.description || ""}
                onChange={(e) => updateWorkSubmission("description", e.target.value)}
              />
            </div>

            {selectedCompetition.id === "dcc-video" ? (
              <div>
                <Label>Google Drive Video Link</Label>
                <Input
                  placeholder="https://drive.google.com/..."
                  value={formData.workSubmission?.link || ""}
                  onChange={(e) => updateWorkSubmission("link", e.target.value)}
                />
              </div>
            ) : (
              <div>
                <Label>Upload Work File</Label>
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
