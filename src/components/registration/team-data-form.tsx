"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, X } from "lucide-react"
import { Member, CompetitionData } from "@/types/registration"

interface TeamDataFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    teamName: string
    members: Member[]
  }
  errors: Record<string, string>
  onFormDataChange: (data: { teamName?: string; members?: Member[] }) => void
}

export function TeamDataForm({
  selectedCompetition,
  formData,
  errors,
  onFormDataChange
}: TeamDataFormProps) {
  const updateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    onFormDataChange({ members: newMembers })
  }

  const addMember = () => {
    const newMember: Member = {
      role: "member",
      fullName: "",
      email: "",
      phone: "",
      institution: "",
      faculty: "",
      studentId: "",
      ktm: null,
      photo: null,
      khs: null,
      socialMediaProof: null,
      twibbonProof: null,
      delegationLetter: null
    }
    onFormDataChange({ members: [...formData.members, newMember] })
  }

  const removeMember = (index: number) => {
    const newMembers = formData.members.filter((_, i) => i !== index)
    onFormDataChange({ members: newMembers })
  }

  if (!selectedCompetition) return null

  return (
    <div className="space-y-6">
      {/* Team Name */}
      {selectedCompetition.maxMembers > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Nama Tim *</Label>
                <Input
                  id="teamName"
                  placeholder="Masukkan nama tim yang unik"
                  value={formData.teamName}
                  onChange={(e) => onFormDataChange({ teamName: e.target.value })}
                  className={errors.teamName ? "border-red-500" : ""}
                />
                {errors.teamName && (
                  <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members Data */}
      {formData.members.map((member, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {member.role === "leader" ? "Ketua Tim" : `Anggota ${index}`} 
                {selectedCompetition.maxMembers === 1 && " (Individual)"}
              </span>
              {formData.members.length > selectedCompetition.minMembers && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMember(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nama Lengkap *</Label>
                <Input
                  placeholder="Nama lengkap sesuai KTP"
                  value={member.fullName}
                  onChange={(e) => updateMember(index, "fullName", e.target.value)}
                  className={errors[`member${index}_fullName`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_fullName`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_fullName`]}</p>
                )}
              </div>
              
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={member.email}
                  onChange={(e) => updateMember(index, "email", e.target.value)}
                  className={errors[`member${index}_email`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_email`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_email`]}</p>
                )}
              </div>
              
              <div>
                <Label>No. WhatsApp *</Label>
                <Input
                  placeholder="+62812345678"
                  value={member.phone}
                  onChange={(e) => updateMember(index, "phone", e.target.value)}
                  className={errors[`member${index}_phone`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_phone`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_phone`]}</p>
                )}
              </div>
              
              <div>
                <Label>Institusi/Universitas *</Label>
                <Input
                  placeholder="Nama universitas/sekolah"
                  value={member.institution}
                  onChange={(e) => updateMember(index, "institution", e.target.value)}
                  className={errors[`member${index}_institution`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_institution`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_institution`]}</p>
                )}
              </div>
              
              <div>
                <Label>Fakultas/Jurusan</Label>
                <Input
                  placeholder="Fakultas atau jurusan"
                  value={member.faculty}
                  onChange={(e) => updateMember(index, "faculty", e.target.value)}
                />
              </div>
              
              <div>
                <Label>NPM/NIM *</Label>
                <Input
                  placeholder="Nomor induk mahasiswa"
                  value={member.studentId}
                  onChange={(e) => updateMember(index, "studentId", e.target.value)}
                  className={errors[`member${index}_studentId`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_studentId`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_studentId`]}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Member Button */}
      {formData.members.length < selectedCompetition.maxMembers && (
        <Button
          variant="outline"
          onClick={addMember}
        >
          <Users className="h-4 w-4 mr-2" />
          Tambah Anggota Tim ({formData.members.length}/{selectedCompetition.maxMembers})
        </Button>
      )}
    </div>
  )
}
