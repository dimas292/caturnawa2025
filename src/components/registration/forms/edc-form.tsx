"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Info, Download, ExternalLink } from "lucide-react"
import { Member, CompetitionData } from "@/types/registration"

interface EDCFormProps {
  selectedCompetition: CompetitionData | null
  formData: {
    teamName: string
    members: Member[]
  }
  errors: Record<string, string>
  onFormDataChange: (data: { teamName?: string; members?: Member[] }) => void
}

export function EDCForm({
  selectedCompetition,
  formData,
  errors,
  onFormDataChange
}: EDCFormProps) {
  const updateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    onFormDataChange({ members: newMembers })
  }

  if (!selectedCompetition || selectedCompetition.id !== "edc") return null

  return (
    <div className="space-y-6">
      {/* Important Alerts */}
      <div className="space-y-4">
        {/* Alert 1: Debater Position */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">
                <strong>IMPORTANT:</strong> Debater 1 and Debater 2 positions will not change until the competition ends.
              </p>
            </div>
          </div>
        </div>

        {/* Alert 2: Team Name Theme */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm text-orange-800 font-medium">
                <strong>REQUIRED:</strong> Team name must be related to UNAS FEST 2025 theme.
              </p>
            </div>
          </div>
        </div>

        {/* Alert 3: Delegation Letter */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm text-purple-800 font-medium">
                <strong>REQUIREMENT:</strong> Official delegation letter from University for the debate team, signed by Vice Rector, Dean, or Vice Dean (one letter for the entire team).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Competition Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>English Debate Competition (EDC)</strong> - Tim terdiri dari 2 orang debater. 
              Semua anggota tim harus dari universitas yang sama.
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
              className="justify-start w-full"
              onClick={() => {
                window.open('/templates/edc/Surat pernyataan kesediaan hadir awarding peserta debat.pdf', '_blank')
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Template Statement of Willingness to Attend
            </Button>
            
            <Button
              variant="outline"
              className="justify-start w-full"
              onClick={() => {
                window.open('/templates/edc/TEMPLATE TWIBBON DAN CAPTION DEBATE.pdf', '_blank')
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Template Twibon dan Caption
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Download the required templates for EDC competition before uploading documents. Official delegation letter and statement of willingness to attend are required once for the entire team (not per member).
          </p>
        </CardContent>
      </Card>

     
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
              <Label htmlFor="teamName">Team Name <span className="text-red-500">*</span></Label>
              <Input
                id="teamName"
                placeholder="Enter a unique team name related to UNAS FEST 2025 theme"
                value={formData.teamName}
                onChange={(e) => onFormDataChange({ teamName: e.target.value })}
                className={errors.teamName ? "border-red-500" : ""}
              />
              {errors.teamName && (
                <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Team name must be related to UNAS FEST 2025 theme
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
              Debater 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Full name as per ID card"
                  value={formData.members[0].fullName}
                  onChange={(e) => updateMember(0, "fullName", e.target.value)}
                  className={errors["member0_fullName"] ? "border-red-500" : ""}
                />
                {errors["member0_fullName"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_fullName"]}</p>
                )}
              </div>
              
              <div>
                <Label>Gender <span className="text-red-500">*</span></Label>
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
              
              <div>
                <Label>University <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="University name"
                  value={formData.members[0].institution}
                  onChange={(e) => updateMember(0, "institution", e.target.value)}
                  className={errors["member0_institution"] ? "border-red-500" : ""}
                />
                {errors["member0_institution"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_institution"]}</p>
                )}
              </div>
              
              <div>
                <Label>Faculty <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Faculty"
                  value={formData.members[0].faculty || ""}
                  onChange={(e) => updateMember(0, "faculty", e.target.value)}
                  className={errors["member0_faculty"] ? "border-red-500" : ""}
                />
                {errors["member0_faculty"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_faculty"]}</p>
                )}
              </div>
              
              <div>
                <Label>Study Program</Label>
                <Input
                  placeholder="Study program"
                  value={formData.members[0].studyProgram || ""}
                  onChange={(e) => updateMember(0, "studyProgram", e.target.value)}
                />
              </div>
              
              <div>
                <Label>Student ID Number <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Student ID Number"
                  value={formData.members[0].studentId}
                  onChange={(e) => updateMember(0, "studentId", e.target.value)}
                  className={errors["member0_studentId"] ? "border-red-500" : ""}
                />
                {errors["member0_studentId"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member0_studentId"]}</p>
                )}
              </div>

              <div>
                <Label>Active Email <span className="text-red-500">*</span></Label>
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
                <Label>Active WhatsApp Number <span className="text-red-500">*</span></Label>
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
              
              <div className="md:col-span-2">
                <Label>Complete Address <span className="text-red-500">*</span></Label>
                <Textarea
                  placeholder="Complete address as per ID card"
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
                <Label>Full Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Full name as per ID card"
                  value={formData.members[1].fullName}
                  onChange={(e) => updateMember(1, "fullName", e.target.value)}
                  className={errors["member1_fullName"] ? "border-red-500" : ""}
                />
                {errors["member1_fullName"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_fullName"]}</p>
                )}
              </div>
              
              <div>
                <Label>Gender <span className="text-red-500">*</span></Label>
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
              
              <div>
                <Label>University <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="University name (must be same as Debater 1)"
                  value={formData.members[1].institution}
                  onChange={(e) => updateMember(1, "institution", e.target.value)}
                  className={errors["member1_institution"] ? "border-red-500" : ""}
                />
                {errors["member1_institution"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_institution"]}</p>
                )}
              </div>
              
              <div>
                <Label>Faculty <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Faculty"
                  value={formData.members[1].faculty || ""}
                  onChange={(e) => updateMember(1, "faculty", e.target.value)}
                  className={errors["member1_faculty"] ? "border-red-500" : ""}
                />
                {errors["member1_faculty"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_faculty"]}</p>
                )}
              </div>
              
              <div>
                <Label>Study Program</Label>
                <Input
                  placeholder="Study program"
                  value={formData.members[1].studyProgram || ""}
                  onChange={(e) => updateMember(1, "studyProgram", e.target.value)}
                />
              </div>
              
              <div>
                <Label>Student ID Number <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Student ID Number"
                  value={formData.members[1].studentId}
                  onChange={(e) => updateMember(1, "studentId", e.target.value)}
                  className={errors["member1_studentId"] ? "border-red-500" : ""}
                />
                {errors["member1_studentId"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_studentId"]}</p>
                )}
              </div>

              <div>
                <Label>Active Email <span className="text-red-500">*</span></Label>
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
                <Label>Active WhatsApp Number <span className="text-red-500">*</span></Label>
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
              
              <div className="md:col-span-2">
                <Label>Complete Address <span className="text-red-500">*</span></Label>
                <Textarea
                  placeholder="Complete address as per ID card"
                  value={formData.members[1].fullAddress}
                  onChange={(e) => updateMember(1, "fullAddress", e.target.value)}
                  className={errors["member1_fullAddress"] ? "border-red-500" : ""}
                />
                {errors["member1_fullAddress"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["member1_fullAddress"]}</p>
                )}
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
              instagramFollowProof: null,
              youtubeFollowProof: null,
              tiktokFollowProof: null,
              twibbonProof: null,
              delegationLetter: null,
              pddiktiProof: null,
              attendanceCommitmentLetter: null,
              achievementsProof: null
            }
            onFormDataChange({ members: [...formData.members, newMember] })
          }}
          className="w-full"
        >
          <Users className="h-4 w-4 mr-2" />
          Add Debater 2
        </Button>
      )}
    </div>
  )
}
