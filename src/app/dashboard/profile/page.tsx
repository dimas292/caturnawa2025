"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingPage } from "@/components/ui/loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ChevronLeft,
  User,
  Camera,
  Save,
  Edit3,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface ParticipantProfile {
  id: string
  fullName: string
  email: string
  gender: string
  fullAddress: string
  whatsappNumber: string
  institution: string
  faculty?: string
  studyProgram?: string
  studentId?: string
  createdAt: string
  updatedAt: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  role: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<ParticipantProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    fullAddress: "",
    whatsappNumber: "",
    institution: "",
    faculty: "",
    studyProgram: "",
    studentId: ""
  })

  const fetchProfile = async () => {
    setLoading(true)
    try {
      // Fetch user profile
      const userResponse = await fetch('/api/user/profile')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserProfile(userData)
      }

      // Fetch participant profile
      const participantResponse = await fetch('/api/participant/profile')
      if (participantResponse.ok) {
        const participantData = await participantResponse.json()
        setProfile(participantData)
        setFormData({
          fullName: participantData.fullName || "",
          email: participantData.email || "",
          gender: participantData.gender || "",
          fullAddress: participantData.fullAddress || "",
          whatsappNumber: participantData.whatsappNumber || "",
          institution: participantData.institution || "",
          faculty: participantData.faculty || "",
          studyProgram: participantData.studyProgram || "",
          studentId: participantData.studentId || ""
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error("Gagal memuat data profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update participant profile
      const profileResponse = await fetch('/api/participant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to update profile')
      }

      // Update avatar if changed
      if (avatarFile) {
        const formDataAvatar = new FormData()
        formDataAvatar.append('avatar', avatarFile)
        
        const avatarResponse = await fetch('/api/user/avatar', {
          method: 'POST',
          body: formDataAvatar
        })

        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json()
          // Update session with new avatar
          await update({
            ...session,
            user: {
              ...session?.user,
              image: avatarData.avatarUrl
            }
          })
        }
      }

      toast.success("Profile berhasil diperbarui")
      setEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      fetchProfile() // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("Gagal memperbarui profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
    // Reset form data to original values
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        gender: profile.gender || "",
        fullAddress: profile.fullAddress || "",
        whatsappNumber: profile.whatsappNumber || "",
        institution: profile.institution || "",
        faculty: profile.faculty || "",
        studyProgram: profile.studyProgram || "",
        studentId: profile.studentId || ""
      })
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  if (!profile || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Profile tidak ditemukan</p>
              <Button onClick={fetchProfile}>Coba Lagi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Profile Peserta
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Kelola informasi pribadi dan avatar Anda
            </p>
          </div>
          <Button asChild variant="outline">
            <a href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Foto Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-32 w-32 mx-auto">
                  <AvatarImage 
                    src={avatarPreview || userProfile.image || "/avatars/default.png"} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-4xl">
                    {profile.fullName?.charAt(0) || userProfile.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {editing && avatarFile && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Preview foto baru
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(null)
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )}

              {!editing && (
                <Button 
                  variant="outline" 
                  onClick={() => setEditing(true)}
                  className="w-full"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Role</Label>
                <p className="font-medium">{userProfile.role}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Member Sejak</Label>
                <p className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informasi Pribadi
                </span>
                {editing && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Batal
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Nama Lengkap *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!editing}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editing}
                    placeholder="email@example.com"
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender">Jenis Kelamin *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    disabled={!editing}
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

                {/* WhatsApp */}
                <div>
                  <Label htmlFor="whatsappNumber">Nomor WhatsApp *</Label>
                  <Input
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    disabled={!editing}
                    placeholder="+62 812-3456-7890"
                  />
                </div>

                {/* Institution */}
                <div className="md:col-span-2">
                  <Label htmlFor="institution">Institusi/Universitas *</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    disabled={!editing}
                    placeholder="Nama institusi atau universitas"
                  />
                </div>

                {/* Faculty */}
                <div>
                  <Label htmlFor="faculty">Fakultas</Label>
                  <Input
                    id="faculty"
                    value={formData.faculty}
                    onChange={(e) => handleInputChange('faculty', e.target.value)}
                    disabled={!editing}
                    placeholder="Nama fakultas"
                  />
                </div>

                {/* Study Program */}
                <div>
                  <Label htmlFor="studyProgram">Program Studi</Label>
                  <Input
                    id="studyProgram"
                    value={formData.studyProgram}
                    onChange={(e) => handleInputChange('studyProgram', e.target.value)}
                    disabled={!editing}
                    placeholder="Nama program studi"
                  />
                </div>

                {/* Student ID */}
                <div>
                  <Label htmlFor="studentId">NIM/NIS</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    disabled={!editing}
                    placeholder="Nomor induk mahasiswa/siswa"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <Label htmlFor="fullAddress">Alamat Lengkap *</Label>
                  <Textarea
                    id="fullAddress"
                    value={formData.fullAddress}
                    onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                    disabled={!editing}
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                  />
                </div>
              </div>

              {!editing && (
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={() => setEditing(true)}
                    className="w-full"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
