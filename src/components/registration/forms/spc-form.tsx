"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Info, Download, ExternalLink } from "lucide-react"
import { Member, CompetitionData } from "@/types/registration"

interface SPCFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    teamName: string
    members: Member[]
  }
  errors: Record<string, string>
  onFormDataChange: (data: { teamName?: string; members?: Member[] }) => void
}

export function SPCForm({
  selectedCompetition,
  formData,
  errors,
  onFormDataChange
}: SPCFormProps) {
  const updateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    onFormDataChange({ members: newMembers })
  }

  const handleFileChange = (index: number, field: keyof Member, file: File | null) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: file }
    onFormDataChange({ members: newMembers })
  }

  if (!selectedCompetition || selectedCompetition.id !== "spc") return null

  return (
    <div className="space-y-6">
      {/* Competition Info */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm text-purple-800">
              <strong>Scientific Paper Competition (SPC)</strong> - Kompetisi karya ilmiah individu untuk mahasiswa. 
              Isi data diri dan upload semua dokumen yang diperlukan dalam satu form.
            </p>
          </div>
        </div>
      </div>

      {/* Template Downloads */}
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
              className="justify-start"
              onClick={() => {
                window.open('/templates/spc/Surat Pernyataan Kesediaan Hadir SPC.pdf', '_blank')
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Template Surat Pernyataan Kesediaan Hadir
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                window.open('/templates/spc/TEMPLATE TWIBBON DAN CAPTION SPC 2025.pdf', '_blank')
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Template Twibbon & Caption
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Download template surat pernyataan kesediaan hadir untuk awarding ceremony dan Twibbon template untuk awarding ceremony sebelum mengupload.
          </p>

          <p className="text-sm text-muted-foreground">
          Surat Pengantar Delegasi dari Universitas yang sudah di TTD oleh Warek, Dekan, atau Wakil Dekan." sama "Peserta hanya diperbolehkan mengirimkan maksimal 10 sertifikat prestasi/capaian unggulan.
          </p>
        </CardContent>
      </Card>

      {/* Combined Data & Document Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Data Peserta & Upload Dokumen</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.members.map((member, index) => (
            <div key={index} className="space-y-6 p-6 border rounded-lg bg-gray-50/50">
              
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h5 className="font-medium text-sm text-blue-600 border-b border-blue-200 pb-1">Data Pribadi</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`fullName-${index}`}>
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`fullName-${index}`}
                      value={member.fullName}
                      onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                      placeholder="Nama lengkap sesuai KTP"
                    />
                    {errors[`member${index}_fullName`] && (
                      <p className="text-red-500 text-sm">{errors[`member${index}_fullName`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`}>
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                      placeholder="email@example.com"
                    />
                    {errors[`member${index}_email`] && (
                      <p className="text-red-500 text-sm">{errors[`member${index}_email`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`phone-${index}`}>
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`phone-${index}`}
                      value={member.phone}
                      onChange={(e) => updateMember(index, 'phone', e.target.value)}
                      placeholder="+628123456789"
                    />
                    {errors[`member${index}_phone`] && (
                      <p className="text-red-500 text-sm">{errors[`member${index}_phone`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`gender-${index}`}>
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={member.gender}
                      onValueChange={(value) => updateMember(index, 'gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Laki-laki</SelectItem>
                        <SelectItem value="FEMALE">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`fullAddress-${index}`}>
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`fullAddress-${index}`}
                      value={member.fullAddress}
                      onChange={(e) => updateMember(index, 'fullAddress', e.target.value)}
                      placeholder="Alamat lengkap sesuai KTP"
                    />
                    {errors[`member${index}_fullAddress`] && (
                      <p className="text-red-500 text-sm">{errors[`member${index}_fullAddress`]}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="space-y-4">
                <h5 className="font-medium text-sm text-green-600 border-b border-green-200 pb-1">Data Akademik</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`institution-${index}`}>
                      Universitas <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`institution-${index}`}
                      value={member.institution}
                      onChange={(e) => updateMember(index, 'institution', e.target.value)}
                      placeholder="Nama universitas"
                    />
                    {errors[`member${index}_institution`] && (
                      <p className="text-red-500 text-sm">{errors[`member${index}_institution`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`faculty-${index}`}>
                      Fakultas <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`faculty-${index}`}
                      value={member.faculty}
                      onChange={(e) => updateMember(index, 'faculty', e.target.value)}
                      placeholder="Nama fakultas"
                    />
                    {errors[`member${index}_faculty`] && (
                      <p className="text-red-500 text-sm">{errors[`member${index}_faculty`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`studyProgram-${index}`}>
                      Program Studi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`studyProgram-${index}`}
                      value={member.studyProgram}
                      onChange={(e) => updateMember(index, 'studyProgram', e.target.value)}
                      placeholder="Nama program studi"
                    />
                    {errors[`member${index}_studyProgram`] && (
                      <p className="text-red-500 text-sm">{errors[`member${index}_studyProgram`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`studentId-${index}`}>
                      NIM <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`studentId-${index}`}
                      value={member.studentId}
                      onChange={(e) => updateMember(index, 'studentId', e.target.value)}
                      placeholder="Nomor Induk Mahasiswa"
                    />
                    {errors[`member${index}_studentId`] && (
                      <p className="text-red-500 text-sm">{errors[`member${index}_studentId`]}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <h5 className="font-medium text-sm text-orange-600 border-b border-orange-200 pb-1">Upload Dokumen Persyaratan</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <div className="space-y-2">
                    <Label htmlFor={`ktm-${index}`}>
                      Kartu Mahasiswa (KTM) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`ktm-${index}`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(index, 'ktm', e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`photo-${index}`}>
                      Pas Foto Background Merah 4x6 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`photo-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, 'photo', e.target.files?.[0] || null)}
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-2">
                    <Label htmlFor={`khs-${index}`}>
                      Kartu Hasil Studi (KHS) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`khs-${index}`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(index, 'khs', e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`pddiktiProof-${index}`}>
                      Screenshot Profil PDDikti <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`pddiktiProof-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, 'pddiktiProof', e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Screenshot halaman profil dari website PDDikti
                    </p>
                  </div>

                  {/* Row 3 - Instagram Follow */}
                  <div className="space-y-2">
                    <Label htmlFor={`instagramFollowProof-${index}`}>
                      Bukti Follow Instagram UNAS FEST <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`instagramFollowProof-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, 'instagramFollowProof', e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Screenshot bukti follow Instagram UNAS FEST
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`youtubeFollowProof-${index}`}>
                      Bukti Follow YouTube UNAS FEST <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`youtubeFollowProof-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, 'youtubeFollowProof', e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Screenshot bukti follow YouTube UNAS FEST
                    </p>
                  </div>

                  {/* Row 4 - TikTok Follow & Twibbon */}
                  <div className="space-y-2">
                    <Label htmlFor={`tiktokFollowProof-${index}`}>
                      Bukti Follow TikTok UNAS FEST <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`tiktokFollowProof-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, 'tiktokFollowProof', e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Screenshot bukti follow TikTok UNAS FEST
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`twibbonProof-${index}`}>
                      Bukti Upload Twibbon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`twibbonProof-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, 'twibbonProof', e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Screenshot bukti upload twibbon di media sosial
                    </p>
                  </div>

                  {/* Row 5 - Official Documents */}
                  <div className="space-y-2">
                    <Label htmlFor={`delegationLetter-${index}`}>
                      Surat Pengantar Delegasi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`delegationLetter-${index}`}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(index, 'delegationLetter', e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Surat pengantar dari kampus/fakultas (PDF)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`attendanceCommitmentLetter-${index}`}>
                      Surat Pernyataan Kesediaan Hadir <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`attendanceCommitmentLetter-${index}`}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(index, 'attendanceCommitmentLetter', e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Surat pernyataan kesediaan hadir saat awarding ceremony
                    </p>
                  </div>

                  {/* Row 6 - Optional */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`achievementsProof-${index}`}>
                      Bukti Prestasi (Opsional)
                    </Label>
                    <Input
                      id={`achievementsProof-${index}`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(index, 'achievementsProof', e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sertifikat atau bukti prestasi yang pernah diraih (maksimal 10 file)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}