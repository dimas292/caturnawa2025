"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Info } from "lucide-react"
import { Member, CompetitionData } from "@/types/registration"

interface KDBIFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    teamName: string
    members: Member[]
  }
  errors: Record<string, string>
  onFormDataChange: (data: { teamName?: string; members?: Member[] }) => void
}

export function KDBIForm({
  selectedCompetition,
  formData,
  errors,
  onFormDataChange
}: KDBIFormProps) {
  const updateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    onFormDataChange({ members: newMembers })
  }

  if (!selectedCompetition || selectedCompetition.id !== "kdbi") return null

  return (
    <div className="space-y-6">
      {/* Competition Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Kompetisi Debat Bahasa Indonesia (KDBI)</strong> - Tim terdiri dari 2 orang debater. 
              Semua anggota tim harus dari universitas yang sama.
            </p>
          </div>
        </div>
      </div>

      {/* Team Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informasi Tim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Nama Tim *</Label>
              <Input
                id="teamName"
                placeholder="Masukkan nama tim yang unik dan berkaitan dengan tema UNAS FEST 2025"
                value={formData.teamName}
                onChange={(e) => onFormDataChange({ teamName: e.target.value })}
                className={errors.teamName ? "border-red-500" : ""}
              />
              {errors.teamName && (
                <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Nama tim harus berkaitan dengan tema UNAS FEST 2025
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debater 1 (Leader) */}
      {formData.members[0] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-600">
              Debater 1 (Team Leader)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Nama lengkap sesuai KTP/identitas"
                  value={formData.members[0].fullName}
                  onChange={(e) => updateMember(0, "fullName", e.target.value)}
                  className={errors["member0_fullName"] ? "border-red-500" : ""}
                />
                {errors["member0_fullName"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_fullName"]}</p>
                )}
              </div>
              
              <div>
                <Label>Email Aktif *</Label>
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
                <Label>Fakultas/Prodi *</Label>
                <Input
                  placeholder="Fakultas dan program studi"
                  value={formData.members[0].faculty || ""}
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
                <Label>Asal Universitas *</Label>
                <Input
                  placeholder="Nama universitas"
                  value={formData.members[0].institution}
                  onChange={(e) => updateMember(0, "institution", e.target.value)}
                  className={errors["member0_institution"] ? "border-red-500" : ""}
                />
                {errors["member0_institution"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_institution"]}</p>
                )}
              </div>
              
              <div>
                <Label>Jenis Kelamin *</Label>
                <Select
                  value={formData.members[0].gender}
                  onValueChange={(value) => updateMember(0, "gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Laki-laki</SelectItem>
                    <SelectItem value="FEMALE">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {errors["member0_gender"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_gender"]}</p>
                )}
              </div>

              <div>
                <Label>Nomor WhatsApp Aktif *</Label>
                <Input
                  placeholder="+628123456789"
                  value={formData.members[0].phone}
                  onChange={(e) => updateMember(0, "phone", e.target.value)}
                  className={errors["member0_phone"] ? "border-red-500" : ""}
                />
                {errors["member0_phone"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_phone"]}</p>
                )}
              </div>

              <div>
                <Label>Program Studi</Label>
                <Input
                  placeholder="Program studi (opsional)"
                  value={formData.members[0].studyProgram || ""}
                  onChange={(e) => updateMember(0, "studyProgram", e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label>Alamat Lengkap *</Label>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debater 2 */}
      {formData.members[1] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-600">
              Debater 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Nama lengkap sesuai KTP/identitas"
                  value={formData.members[1].fullName}
                  onChange={(e) => updateMember(1, "fullName", e.target.value)}
                  className={errors["member1_fullName"] ? "border-red-500" : ""}
                />
                {errors["member1_fullName"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_fullName"]}</p>
                )}
              </div>
              
              <div>
                <Label>Email Aktif *</Label>
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
                <Label>Fakultas/Prodi *</Label>
                <Input
                  placeholder="Fakultas dan program studi"
                  value={formData.members[1].faculty || ""}
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
                <Label>Asal Universitas *</Label>
                <Input
                  placeholder="Nama universitas (harus sama dengan Debater 1)"
                  value={formData.members[1].institution}
                  onChange={(e) => updateMember(1, "institution", e.target.value)}
                  className={errors["member1_institution"] ? "border-red-500" : ""}
                />
                {errors["member1_institution"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_institution"]}</p>
                )}
              </div>
              
              <div>
                <Label>Jenis Kelamin *</Label>
                <Select
                  value={formData.members[1].gender}
                  onValueChange={(value) => updateMember(1, "gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Laki-laki</SelectItem>
                    <SelectItem value="FEMALE">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {errors["member1_gender"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_gender"]}</p>
                )}
              </div>

              <div>
                <Label>Nomor WhatsApp Aktif *</Label>
                <Input
                  placeholder="+628123456789"
                  value={formData.members[1].phone}
                  onChange={(e) => updateMember(1, "phone", e.target.value)}
                  className={errors["member1_phone"] ? "border-red-500" : ""}
                />
                {errors["member1_phone"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_phone"]}</p>
                )}
              </div>

              <div>
                <Label>Program Studi</Label>
                <Input
                  placeholder="Program studi (opsional)"
                  value={formData.members[1].studyProgram || ""}
                  onChange={(e) => updateMember(1, "studyProgram", e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label>Alamat Lengkap *</Label>
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
            </div>

            {/* Special requirement alert for Debater 2 */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Dokumen Khusus untuk Debater 2:</strong> Surat Pengantar Delegasi dari universitas 
                    yang ditandatangani oleh Wakil Rektor, Dekan, atau Wakil Dekan akan diupload di langkah berikutnya.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add member button if needed */}
      {formData.members.length < 2 && (
        <Button
          variant="outline"
          onClick={() => {
            const newMember: Member = {
              role: "MEMBER",
              fullName: "",
              email: "",
              phone: "",
              institution: formData.members[0]?.institution || "", // Auto-fill same institution
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
            onFormDataChange({ members: [...formData.members, newMember] })
          }}
          className="w-full"
        >
          <Users className="h-4 w-4 mr-2" />
          Tambah Debater 2
        </Button>
      )}
    </div>
  )
}