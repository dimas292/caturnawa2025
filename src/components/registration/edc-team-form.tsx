"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, X, Upload } from "lucide-react"
import { Member, CompetitionData } from "@/types/registration"

interface EDCTeamFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    teamName: string
    members: Member[]
  }
  errors: Record<string, string>
  onFormDataChange: (data: { teamName?: string; members?: Member[] }) => void
}

export function EDCTeamForm({
  selectedCompetition,
  formData,
  errors,
  onFormDataChange
}: EDCTeamFormProps) {
  const updateMember = (index: number, field: keyof Member, value: string | File | null) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    onFormDataChange({ members: newMembers })
  }

  const addMember = () => {
    const newMember: Member = {
      role: formData.members.length === 0 ? "LEADER" : "MEMBER",
      fullName: "",
      email: "",
      phone: "",
      institution: "",
      faculty: "",
      studentId: "",
      gender: "MALE",
      fullAddress: "",
      studyProgram: "",
      ktm: null,
      photo: null,
      khs: null,
      socialMediaProof: null,
      twibbonProof: null,
      delegationLetter: null,
      achievementsProof: null
    }
    onFormDataChange({ members: [...formData.members, newMember ] })
  }

  const removeMember = (index: number) => {
    const newMembers = formData.members.filter((_, i) => i !== index)
    onFormDataChange({ members: newMembers })
  }

  const handleFileUpload = (index: number, field: keyof Member, file: File | null) => {
    updateMember(index, field, file)
  }

  if (!selectedCompetition || selectedCompetition.type !== "EDC") return null

  return (
    <div className="space-y-6">
      {/* Team Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Nama Kelompok *</Label>
              <Input
                id="teamName"
                placeholder="Masukkan nama kelompok yang berkaitan dengan tema UNAS FEST 2025"
                value={formData.teamName}
                onChange={(e) => onFormDataChange({ teamName: e.target.value })}
                className={errors.teamName ? "border-red-500" : ""}
              />
              {errors.teamName && (
                <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Nama kelompok wajib berkaitan dengan tema UNAS FEST 2025
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debater 1 */}
      {formData.members[0] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold text-blue-600">Debater 1</span>
              <p className="text-sm text-muted-foreground">This position will not change until the competition ends.</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name *</Label>
                <Input
                  placeholder="Nama lengkap sesuai KTP"
                  value={formData.members[0].fullName}
                  onChange={(e) => updateMember(0, "fullName", e.target.value)}
                  className={errors["member0_fullName"] ? "border-red-500" : ""}
                />
                {errors["member0_fullName"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_fullName"]}</p>
                )}
              </div>
              
              <div>
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.members[0].email}
                  onChange={(e) => updateMember(0, "email", e.target.value)}
                  className={errors["member0_email"] ? "border-red-500" : ""}
                />
                {errors["member0_email"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_email"]}</p>
                )}
              </div>
              
              <div>
                <Label>Faculty *</Label>
                <Input
                  placeholder="Fakultas"
                  value={formData.members[0].faculty}
                  onChange={(e) => updateMember(0, "faculty", e.target.value)}
                  className={errors["member0_faculty"] ? "border-red-500" : ""}
                />
                {errors["member0_faculty"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_faculty"]}</p>
                )}
              </div>
              
              <div>
                <Label>NPM/NIM *</Label>
                <Input
                  placeholder="Nomor Pokok Mahasiswa"
                  value={formData.members[0].studentId}
                  onChange={(e) => updateMember(0, "studentId", e.target.value)}
                  className={errors["member0_studentId"] ? "border-red-500" : ""}
                />
                {errors["member0_studentId"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_studentId"]}</p>
                )}
              </div>
              
              <div>
                <Label>Agency Origin *</Label>
                <Input
                  placeholder="Nama universitas/instansi"
                  value={formData.members[0].institution}
                  onChange={(e) => updateMember(0, "institution", e.target.value)}
                  className={errors["member0_institution"] ? "border-red-500" : ""}
                />
                {errors["member0_institution"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_institution"]}</p>
                )}
              </div>
              
              <div>
                <Label>Gender *</Label>
                <Select
                  value={formData.members[0].gender}
                  onValueChange={(value) => updateMember(0, "gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors["member0_gender"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_gender"]}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label>Full Address *</Label>
                <Textarea
                  placeholder="Alamat lengkap sesuai KTP"
                  value={formData.members[0].fullAddress}
                  onChange={(e) => updateMember(0, "fullAddress", e.target.value)}
                  className={errors["member0_fullAddress"] ? "border-red-500" : ""}
                />
                {errors["member0_fullAddress"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_fullAddress"]}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label>Village/Sub-District, District, City *</Label>
                <Input
                  placeholder="Contoh: Kelurahan A, Kecamatan B, Kabupaten C, Kota D"
                  value={formData.members[0].studyProgram || ""}
                  onChange={(e) => updateMember(0, "studyProgram", e.target.value)}
                  className={errors["member0_studyProgram"] ? "border-red-500" : ""}
                />
                {errors["member0_studyProgram"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_studyProgram"]}</p>
                )}
              </div>
              
              <div>
                <Label>WhatsApp Number *</Label>
                <Input
                  placeholder="+62812345678"
                  value={formData.members[0].phone}
                  onChange={(e) => updateMember(0, "phone", e.target.value)}
                  className={errors["member0_phone"] ? "border-red-500" : ""}
                />
                {errors["member0_phone"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_phone"]}</p>
                )}
              </div>
            </div>

            {/* File Uploads for Debater 1 */}
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-gray-700">Required Documents:</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Student Identity Card (KTM) *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(0, "ktm", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[0].ktm && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[0].ktm.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Latest Formal Photograph (3x4) *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(0, "photo", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[0].photo && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[0].photo.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Screenshot proof of PDDikti student status *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(0, "socialMediaProof", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[0].socialMediaProof && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[0].socialMediaProof.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Screenshot proof of following Social Media UNAS FEST 2025 *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(0, "twibbonProof", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[0].twibbonProof && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[0].twibbonProof.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">TikTok, YouTube, Instagram</p>
                </div>
                
                <div>
                  <Label>Screenshot proof of sharing UNAS FEST 2025 Twibbon *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(0, "delegationLetter", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[0].delegationLetter && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[0].delegationLetter.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Student Record (KHS) *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileUpload(0, "khs", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[0].khs && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[0].khs.name}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debater 2 */}
      {formData.members[1] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold text-green-600">Debater 2</span>
              <p className="text-sm text-muted-foreground">This position will not change until the competition ends.</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name *</Label>
                <Input
                  placeholder="Nama lengkap sesuai KTP"
                  value={formData.members[1].fullName}
                  onChange={(e) => updateMember(1, "fullName", e.target.value)}
                  className={errors["member1_fullName"] ? "border-red-500" : ""}
                />
                {errors["member1_fullName"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_fullName"]}</p>
                )}
              </div>
              
              <div>
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.members[1].email}
                  onChange={(e) => updateMember(1, "email", e.target.value)}
                  className={errors["member1_email"] ? "border-red-500" : ""}
                />
                {errors["member1_email"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_email"]}</p>
                )}
              </div>
              
              <div>
                <Label>Faculty *</Label>
                <Input
                  placeholder="Fakultas"
                  value={formData.members[1].faculty}
                  onChange={(e) => updateMember(1, "faculty", e.target.value)}
                  className={errors["member1_faculty"] ? "border-red-500" : ""}
                />
                {errors["member1_faculty"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_faculty"]}</p>
                )}
              </div>
              
              <div>
                <Label>NPM/NIM *</Label>
                <Input
                  placeholder="Nomor Pokok Mahasiswa"
                  value={formData.members[1].studentId}
                  onChange={(e) => updateMember(1, "studentId", e.target.value)}
                  className={errors["member1_studentId"] ? "border-red-500" : ""}
                />
                {errors["member1_studentId"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_studentId"]}</p>
                )}
              </div>
              
              <div>
                <Label>Agency Origin *</Label>
                <Input
                  placeholder="Nama universitas/instansi"
                  value={formData.members[1].institution}
                  onChange={(e) => updateMember(1, "institution", e.target.value)}
                  className={errors["member1_institution"] ? "border-red-500" : ""}
                />
                {errors["member1_institution"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_institution"]}</p>
                )}
              </div>
              
              <div>
                <Label>Gender *</Label>
                <Select
                  value={formData.members[1].gender}
                  onValueChange={(value) => updateMember(1, "gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors["member1_gender"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_gender"]}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label>Full Address *</Label>
                <Textarea
                  placeholder="Alamat lengkap sesuai KTP"
                  value={formData.members[1].fullAddress}
                  onChange={(e) => updateMember(1, "fullAddress", e.target.value)}
                  className={errors["member1_fullAddress"] ? "border-red-500" : ""}
                />
                {errors["member1_fullAddress"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_fullAddress"]}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label>Village/Sub-District, District, City *</Label>
                <Input
                  placeholder="Contoh: Kelurahan A, Kecamatan B, Kabupaten C, Kota D"
                  value={formData.members[1].studyProgram || ""}
                  onChange={(e) => updateMember(1, "studyProgram", e.target.value)}
                  className={errors["member1_studyProgram"] ? "border-red-500" : ""}
                />
                {errors["member1_studyProgram"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_studyProgram"]}</p>
                )}
              </div>
              
              <div>
                <Label>WhatsApp Number *</Label>
                <Input
                  placeholder="+62812345678"
                  value={formData.members[1].phone}
                  onChange={(e) => updateMember(1, "phone", e.target.value)}
                  className={errors["member1_phone"] ? "border-red-500" : ""}
                />
                {errors["member1_phone"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_phone"]}</p>
                )}
              </div>
            </div>

            {/* File Uploads for Debater 2 */}
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-gray-700">Required Documents:</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Student Identity Card (KTM) *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(1, "ktm", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[1].ktm && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[1].ktm.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Latest Formal Photograph (3x4) *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(1, "photo", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[1].photo && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[1].photo.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Screenshot proof of PDDikti student status *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(1, "socialMediaProof", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[1].socialMediaProof && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[1].socialMediaProof.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Screenshot proof of following Social Media UNAS FEST 2025 *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(1, "twibbonProof", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[1].twibbonProof && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[1].twibbonProof.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">TikTok, YouTube, Instagram</p>
                </div>
                
                <div>
                  <Label>Screenshot proof of sharing UNAS FEST 2025 Twibbon *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(1, "delegationLetter", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[1].delegationLetter && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[1].delegationLetter.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Student Record (KHS) *</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileUpload(1, "khs", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.members[1].khs && (
                    <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[1].khs.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special requirement for Debater 2 */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Special Document for Debater 2:</h4>
              <div>
                <Label>Official Delegation Letter from University *</Label>
                <p className="text-sm text-blue-700 mb-2">
                  Letter signed by Vice Rector, Dean, or Vice Dean
                </p>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(1, "achievementsProof", e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                </div>
                {formData.members[1].achievementsProof && (
                  <p className="text-sm text-green-600 mt-1">✓ File uploaded: {formData.members[1].achievementsProof.name}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Member Button - Only show if we need to add the second member */}
      {formData.members.length < 2 && (
        <Button
          variant="outline"
          onClick={addMember}
          className="w-full"
        >
          <Users className="h-4 w-4 mr-2" />
          Add Debater 2
        </Button>
      )}
    </div>
  )
}
