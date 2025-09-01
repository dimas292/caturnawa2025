"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
      role: "MEMBER",
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
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  placeholder="Enter a unique team name"
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
                {member.role === "LEADER" ? "Team Leader" : `Member ${index}`} 
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
                <Label>Full Name *</Label>
                <Input
                  placeholder="Full name as per ID card"
                  value={member.fullName}
                  onChange={(e) => updateMember(index, "fullName", e.target.value)}
                  className={errors[`member${index}_fullName`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_fullName`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_fullName`]}</p>
                )}
              </div>
              
              <div>
                <Label>Active Email *</Label>
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
                <Label>Gender *</Label>
                <Select
                  value={member.gender}
                  onValueChange={(value) => updateMember(index, "gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors[`member${index}_gender`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_gender`]}</p>
                )}
              </div>
              
              <div>
                <Label>Active WhatsApp Number *</Label>
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
                <Label>University / Institution *</Label>
                <Input
                  placeholder="University/school name"
                  value={member.institution}
                  onChange={(e) => updateMember(index, "institution", e.target.value)}
                  className={errors[`member${index}_institution`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_institution`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_institution`]}</p>
                )}
              </div>
              
              <div>
                <Label>Faculty/Department</Label>
                <Input
                  placeholder="Faculty or department"
                  value={member.faculty}
                  onChange={(e) => updateMember(index, "faculty", e.target.value)}
                />
              </div>
              
              <div>
                <Label>Study Program</Label>
                <Input
                  placeholder="Study program"
                  value={member.studyProgram}
                  onChange={(e) => updateMember(index, "studyProgram", e.target.value)}
                />
              </div>
              
              <div>
                <Label>Student ID Number (NPM) *</Label>
                <Input
                  placeholder="Student identification number"
                  value={member.studentId}
                  onChange={(e) => updateMember(index, "studentId", e.target.value)}
                  className={errors[`member${index}_studentId`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_studentId`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_studentId`]}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label>Full Address *</Label>
                <Textarea
                  placeholder="Complete address as per ID card"
                  value={member.fullAddress}
                  onChange={(e) => updateMember(index, "fullAddress", e.target.value)}
                  className={errors[`member${index}_fullAddress`] ? "border-red-500" : ""}
                />
                {errors[`member${index}_fullAddress`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`member${index}_fullAddress`]}</p>
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
          Add Team Member ({formData.members.length}/{selectedCompetition.maxMembers})
        </Button>
      )}
    </div>
  )
}
