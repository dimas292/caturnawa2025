"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Info } from "lucide-react"
import { Member, CompetitionData } from "@/types/registration"

interface DCCInfografisFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    teamName: string
    members: Member[]
  }
  errors: Record<string, string>
  onFormDataChange: (data: { teamName?: string; members?: Member[] }) => void
}

export function DCCInfografisForm({
  selectedCompetition,
  formData,
  errors,
  onFormDataChange
}: DCCInfografisFormProps) {
  const updateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    onFormDataChange({ members: newMembers })
  }

  if (!selectedCompetition || selectedCompetition.type !== "DCC_INFOGRAFIS") return null

  return (
    <div className="space-y-6">
      {/* Competition Info */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm text-purple-800">
              <strong>DCC Infografis</strong> - Tim terdiri dari maksimal 3 orang peserta. 
              Kompetisi desain infografis dengan tema UNAS FEST 2025.
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

      {/* Asal Sekolah */}
      <Card>
        <CardHeader>
          <CardTitle>Asal Sekolah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schoolName">Nama Sekolah/Universitas *</Label>
              <Input
                id="schoolName"
                placeholder="Masukkan nama sekolah atau universitas"
                value={formData.members[0]?.institution || ""}
                onChange={(e) => {
                  // Update all members with the same institution
                  const newMembers = formData.members.map(member => ({
                    ...member,
                    institution: e.target.value
                  }))
                  onFormDataChange({ members: newMembers })
                }}
                className={errors.institution ? "border-red-500" : ""}
              />
              {errors.institution && (
                <p className="text-red-500 text-sm mt-1">{errors.institution}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peserta Pertama */}
      {formData.members[0] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-600">
              DATA PESERTA PERTAMA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nama Lengkap Peserta Pertama *</Label>
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
                <Label>Email Peserta Pertama *</Label>
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
                <Label>Kelas/Jurusan Peserta Pertama *</Label>
                <Input
                  placeholder="Kelas (contoh: XII IPA 1) atau Jurusan"
                  value={formData.members[0].faculty || ""}
                  onChange={(e) => updateMember(0, "faculty", e.target.value)}
                  className={errors["member0_faculty"] ? "border-red-500" : ""}
                />
                {errors["member0_faculty"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_faculty"]}</p>
                )}
              </div>
              
              <div>
                <Label>Nomor WhatsApp Peserta Pertama *</Label>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peserta Kedua */}
      {formData.members[1] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-600">
              DATA PESERTA KEDUA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nama Lengkap Peserta Kedua *</Label>
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
                <Label>Email Peserta Kedua *</Label>
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
                <Label>Kelas/Jurusan Peserta Kedua *</Label>
                <Input
                  placeholder="Kelas (contoh: XII IPA 1) atau Jurusan"
                  value={formData.members[1].faculty || ""}
                  onChange={(e) => updateMember(1, "faculty", e.target.value)}
                  className={errors["member1_faculty"] ? "border-red-500" : ""}
                />
                {errors["member1_faculty"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_faculty"]}</p>
                )}
              </div>
              
              <div>
                <Label>Nomor WhatsApp Peserta Kedua *</Label>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peserta Ketiga */}
      {formData.members[2] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-orange-600">
              DATA PESERTA KETIGA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nama Lengkap Peserta Ketiga *</Label>
                <Input
                  placeholder="Nama lengkap sesuai KTP/identitas"
                  value={formData.members[2].fullName}
                  onChange={(e) => updateMember(2, "fullName", e.target.value)}
                  className={errors["member2_fullName"] ? "border-red-500" : ""}
                />
                {errors["member2_fullName"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member2_fullName"]}</p>
                )}
              </div>
              
              <div>
                <Label>Email Peserta Ketiga *</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.members[2].email}
                  onChange={(e) => updateMember(2, "email", e.target.value)}
                  className={errors["member2_email"] ? "border-red-500" : ""}
                />
                {errors["member2_email"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member2_email"]}</p>
                )}
              </div>
              
              <div>
                <Label>Kelas/Jurusan Peserta Ketiga *</Label>
                <Input
                  placeholder="Kelas (contoh: XII IPA 1) atau Jurusan"
                  value={formData.members[2].faculty || ""}
                  onChange={(e) => updateMember(2, "faculty", e.target.value)}
                  className={errors["member2_faculty"] ? "border-red-500" : ""}
                />
                {errors["member2_faculty"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member2_faculty"]}</p>
                )}
              </div>
              
              <div>
                <Label>Nomor WhatsApp Peserta Ketiga *</Label>
                <Input
                  placeholder="+628123456789"
                  value={formData.members[2].phone}
                  onChange={(e) => updateMember(2, "phone", e.target.value)}
                  className={errors["member2_phone"] ? "border-red-500" : ""}
                />
                {errors["member2_phone"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member2_phone"]}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add member buttons */}
      {formData.members.length < 3 && (
        <div className="space-y-2">
          {formData.members.length < 2 && (
            <Button
              variant="outline"
              onClick={() => {
                const newMember: Member = {
                  role: "MEMBER",
                  fullName: "",
                  email: "",
                  phone: "",
                  institution: formData.members[0]?.institution || "",
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
              Tambah Peserta Kedua
            </Button>
          )}
          
          {formData.members.length === 2 && (
            <Button
              variant="outline"
              onClick={() => {
                const newMember: Member = {
                  role: "MEMBER",
                  fullName: "",
                  email: "",
                  phone: "",
                  institution: formData.members[0]?.institution || "",
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
              Tambah Peserta Ketiga
            </Button>
          )}
        </div>
      )}

      {/* File Upload Info */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Dokumen yang akan diupload di langkah berikutnya:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Kartu Pelajar/Surat Keterangan Siswa Aktif (untuk setiap peserta)</li>
              <li>• Foto 3x4 Background Merah (untuk setiap peserta)</li>
              <li>• Bukti Follow Instagram UNAS FEST (untuk setiap peserta)</li>
              <li>• Bukti Follow YouTube UNAS FEST (untuk setiap peserta)</li>
              <li>• Bukti Follow TikTok UNAS FEST (untuk setiap peserta)</li>
              <li>• Bukti SS Twibbon (untuk setiap peserta)</li>
              <li>• Pernyataan Kesediaan Hadir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}