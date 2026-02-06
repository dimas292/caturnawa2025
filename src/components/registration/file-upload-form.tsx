"use client"

import { useState, useRef, useMemo } from "react"
import { useFileValidation } from "@/hooks/use-file-validation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileText, CheckCircle, Loader2, Download, ExternalLink } from "lucide-react"
import { Member, CompetitionData, WorkSubmission } from "@/types/registration"

interface FileUploadFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    members: Member[]
    workSubmission?: WorkSubmission
  }
  onFormDataChange: (data: { members?: Member[]; workSubmission?: WorkSubmission }) => void
  registrationId?: string
  errors?: Record<string, string>
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
  error?: string
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
  memberId,
  error
}: FileUploadFieldProps & { registrationId?: string; memberId?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const parsedMaxSize = useMemo(() => parseInt(maxSize) || 10, [maxSize]);
  const allowedMimeTypes = useMemo(() => {
    const mimeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
    };
    return accept.split(',').map(ext => mimeMap[ext.trim()]).filter(Boolean);
  }, [accept]);

  const { error: fileError, validateFile, setError: setFileError } = useFileValidation({
    maxSize: parsedMaxSize,
    allowedTypes: allowedMimeTypes,
  });

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) {
      onFileChange(null);
      setFileError(null);
      return;
    }

    if (!validateFile(selectedFile)) {
      onFileChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    onFileChange(selectedFile);

    // If we have a registration ID, upload the file immediately
    if (registrationId) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('fileType', fieldName.toUpperCase());
        formData.append('registrationId', registrationId);
        if (memberId) {
          formData.append('memberId', memberId);
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        
        // In production, you would show a toast notification here
      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setFileError({ code: 'invalid-file-type', message: `Error: ${errorMessage}` });
        onFileChange(null); // Clear the file on upload error
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

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
    onFileChange(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              Format: {accept.replace(/\./g, '').toUpperCase()} | Max: {maxSize}
            </p>
            {fileError && (
              <p className="text-sm text-red-600 mt-1">{fileError.message}</p>
            )}
            {error && !currentFile && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
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
  registrationId,
  errors = {}
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
      {/* Template Downloads for DCC competitions */}
      {(selectedCompetition.id === "dcc-infografis" || selectedCompetition.id === "dcc-short-video") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            
              <Button 
                variant="outline" 
                className="justify-start w-full"
                onClick={() => {
                  window.open('/templates/dcc/Surat Pernyataan Kesediaan Hadir DCC.pdf', '_blank')
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Template Surat Kesediaan Hadir
              </Button>
              <Button 
                variant="outline" 
                className="justify-start w-full"
                onClick={() => {
                  window.open('/templates/dcc/TEMPLATE TWIBBON DCC.pdf', '_blank')
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Template Twibbon DCC
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Download template yang diperlukan untuk kompetisi DCC sebelum mengupload dokumen. Surat pernyataan kesediaan hadir dan bukti twibbon diperlukan untuk semua peserta.
            </p>
          </CardContent>
        </Card>
      )}
      
      {formData.members.map((member, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>
              Document Upload - {selectedCompetition.id === "kdbi" 
                ? (index === 0 ? "Debater 1" : "Debater 2")
                : selectedCompetition.id === "dcc-infografis" || selectedCompetition.id === "dcc-short-video"
                ? (index === 0 ? "Anggota 1 (PIC)" : `Anggota ${index + 1}`)
                : selectedCompetition.id === "edc"
                ? (index === 0 ? "Debater 1" : `Debater 2`)
                : (index === 0 ? "Anggota 1" : `Anggota 2`)
              }
            </CardTitle>
            <CardDescription>
              Upload all required documents according to the requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Student Card/Status - Different for DCC vs other competitions */}
            {selectedCompetition.id !== "dcc-infografis" && selectedCompetition.id !== "dcc-short-video" ? (
              <>
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
                  error={errors[`member${index}_ktm`]}
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
                  error={errors[`member${index}_photo`]}
                />
              </>
            ) : (
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
                  error={errors[`member${index}_ktm`]}
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
                  error={errors[`member${index}_photo`]}
                />
              </>
            )}
            
            {/* KHS and PDDikti are not required for DCC competitions */}
            {selectedCompetition.id !== "dcc-infografis" && selectedCompetition.id !== "dcc-short-video" && (
              <>
                <FileUploadField
                  title="Kartu Hasil Studi (KHS)"
                  description="Latest semester study results card (KHS)"
                  memberIndex={index}
                  fieldName="khs"
                  accept=".pdf"
                  currentFile={member.khs}
                  onFileChange={(file) => updateMemberFile(index, "khs", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_khs`]}
                />
                
                <FileUploadField
                  title="Screenshot Profil PDDikti"
                  description="Screenshot of your profile from PDDikti website"
                  memberIndex={index}
                  fieldName="pddiktiProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.pddiktiProof}
                  onFileChange={(file) => updateMemberFile(index, "pddiktiProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_pddiktiProof`]}
                />
              </>
            )}
            
            {/* Social Media and other fields - Different handling for DCC vs other competitions */}
            {selectedCompetition.id !== "dcc-infografis" && selectedCompetition.id !== "dcc-short-video" && (
              <>
                <FileUploadField
                  title="Bukti Follow Instagram UNAS FEST"
                  description="Screenshot proof of following Instagram @unasfest"
                  memberIndex={index}
                  fieldName="instagramFollowProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.instagramFollowProof}
                  onFileChange={(file) => updateMemberFile(index, "instagramFollowProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_instagramFollowProof`]}
                />
                
                <FileUploadField
                  title="Bukti Follow YouTube UNAS FEST"
                  description="Screenshot proof of following YouTube UNAS FEST"
                  memberIndex={index}
                  fieldName="youtubeFollowProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.youtubeFollowProof}
                  onFileChange={(file) => updateMemberFile(index, "youtubeFollowProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_youtubeFollowProof`]}
                />
                
                <FileUploadField
                  title="Bukti Follow TikTok UNAS FEST"
                  description="Screenshot proof of following TikTok @unasfest"
                  memberIndex={index}
                  fieldName="tiktokFollowProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.tiktokFollowProof}
                  onFileChange={(file) => updateMemberFile(index, "tiktokFollowProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_tiktokFollowProof`]}
                />
                
                <FileUploadField
                  title="Bukti Upload Twibbon"
                  description="Screenshot of uploading and sharing twibbon on social media"
                  memberIndex={index}
                  fieldName="twibbonProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.twibbonProof}
                  onFileChange={(file) => updateMemberFile(index, "twibbonProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_twibbonProof`]}
                />
                
                {/* For non-KDBI and non-EDC competitions, keep the original individual uploads */}
                {selectedCompetition.id !== "kdbi" && selectedCompetition.id !== "edc" && (
                  <>
                    <FileUploadField
                      title="Surat Pengantar Delegasi"
                      description="Delegation letter from university signed by Vice Rector, Dean, or Vice Dean (PDF)"
                      memberIndex={index}
                      fieldName="delegationLetter"
                      accept=".pdf"
                      currentFile={member.delegationLetter}
                      onFileChange={(file) => updateMemberFile(index, "delegationLetter", file)}
                      registrationId={registrationId}
                      memberId={`member-${index}`}
                      error={errors[`member${index}_delegationLetter`]}
                    />
                    
                    <FileUploadField
                      title="Surat Pernyataan Kesediaan Hadir"
                      description="Letter of commitment to attend the awarding ceremony (PDF)"
                      memberIndex={index}
                      fieldName="attendanceCommitmentLetter"
                      accept=".pdf"
                      currentFile={member.attendanceCommitmentLetter}
                      onFileChange={(file) => updateMemberFile(index, "attendanceCommitmentLetter", file)}
                      registrationId={registrationId}
                      memberId={`member-${index}`}
                      error={errors[`member${index}_attendanceCommitmentLetter`]}
                    />
                  </>
                )}
              </>
            )}
            
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
                error={errors[`member${index}_achievementsProof`]}
              />
            )}
            
            {/* DCC specific social media uploads - with correct field mappings */}
            {(selectedCompetition.id === "dcc-infografis" || selectedCompetition.id === "dcc-short-video") && (
              <>
                <FileUploadField
                  title="Bukti Follow Instagram UNAS FEST"
                  description="Screenshot bukti follow Instagram @unasfest"
                  memberIndex={index}
                  fieldName="instagramFollowProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.instagramFollowProof}
                  onFileChange={(file) => updateMemberFile(index, "instagramFollowProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_instagramFollowProof`]}
                />
                
                <FileUploadField
                  title="Bukti Follow YouTube UNAS FEST"
                  description="Screenshot bukti follow YouTube UNAS FEST"
                  memberIndex={index}
                  fieldName="youtubeFollowProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.youtubeFollowProof}
                  onFileChange={(file) => updateMemberFile(index, "youtubeFollowProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_youtubeFollowProof`]}
                />
                
                <FileUploadField
                  title="Bukti Follow TikTok UNAS FEST"
                  description="Screenshot bukti follow TikTok UNAS FEST"
                  memberIndex={index}
                  fieldName="tiktokFollowProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.tiktokFollowProof}
                  onFileChange={(file) => updateMemberFile(index, "tiktokFollowProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_tiktokFollowProof`]}
                />
                
                <FileUploadField
                  title="Bukti SS Twibbon"
                  description="Screenshot bukti share twibbon UNAS FEST"
                  memberIndex={index}
                  fieldName="twibbonProof"
                  accept=".jpg,.jpeg,.png"
                  currentFile={member.twibbonProof}
                  onFileChange={(file) => updateMemberFile(index, "twibbonProof", file)}
                  registrationId={registrationId}
                  memberId={`member-${index}`}
                  error={errors[`member${index}_twibbonProof`]}
                />
              </>
            )}
            
          </CardContent>
        </Card>
      ))}
      
      {/* DCC Team Documents */}
      {(selectedCompetition.id === "dcc-infografis" || selectedCompetition.id === "dcc-short-video") && (
        <Card>
          <CardHeader>
            <CardTitle>Dokumen Tim DCC</CardTitle>
            <CardDescription>
              Upload dokumen yang diperlukan untuk seluruh tim
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FileUploadField
              title="Surat Pengantar Delegasi"
              description="Surat dari sekolah yang ditandatangani oleh Kepala Sekolah atau Wakil Kepala Sekolah (untuk seluruh tim)"
              memberIndex={0}
              fieldName="delegationLetter"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={formData.members[0]?.delegationLetter || null}
              onFileChange={(file) => updateMemberFile(0, "delegationLetter", file)}
              registrationId={registrationId}
              memberId="dcc-delegation-letter"
              error={errors[`member0_delegationLetter`] || errors['team_delegationLetter']}
            />
            
            <FileUploadField
              title="Pernyataan Kesediaan Hadir"
              description="Upload pernyataan kesediaan hadir dari semua anggota tim"
              memberIndex={0}
              fieldName="attendanceCommitmentLetter"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={formData.members[0]?.attendanceCommitmentLetter || null}
              onFileChange={(file) => updateMemberFile(0, "attendanceCommitmentLetter", file)}
              registrationId={registrationId}
              memberId="dcc-statement-of-willingness"
              error={errors[`member0_attendanceCommitmentLetter`]}
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
                  error={errors['workFile']}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* KDBI & EDC Team Documents Section */}
      {(selectedCompetition.id === "kdbi" || selectedCompetition.id === "edc") && (
        <Card>
          <CardHeader>
            <CardTitle>Dokumen Tim {selectedCompetition.id === "kdbi" ? "KDBI" : "EDC"}</CardTitle>
            <CardDescription>
              Upload dokumen yang diperlukan untuk seluruh tim (tidak perlu per anggota)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FileUploadField
              title="Surat Pengantar Delegasi (Delegation Letter)"
              description="Surat dari universitas yang ditandatangani oleh Wakil Rektor, Dekan, atau Wakil Dekan (untuk seluruh tim)"
              memberIndex={0}
              fieldName="delegationLetter"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={formData.members[0]?.delegationLetter || null}
              onFileChange={(file) => updateMemberFile(0, "delegationLetter", file)}
              registrationId={registrationId}
              memberId="team-delegation-letter"
              error={errors['team_delegationLetter']}
            />
            
            <FileUploadField
              title="Surat Pernyataan Kesediaan Hadir"
              description="Surat pernyataan kesediaan hadir untuk seluruh anggota tim"
              memberIndex={0}
              fieldName="attendanceCommitmentLetter"
              accept=".pdf"
              currentFile={formData.members[0]?.attendanceCommitmentLetter || null}
              onFileChange={(file) => updateMemberFile(0, "attendanceCommitmentLetter", file)}
              registrationId={registrationId}
              memberId="team-attendance-commitment"
              error={errors[`member0_attendanceCommitmentLetter`]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
