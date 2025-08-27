// src/app/auth/signup/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface FormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  fullName: string
  gender: "MALE" | "FEMALE" | ""
  fullAddress: string
  whatsappNumber: string
  institution: string
  faculty: string
  studyProgram: string
  studentId: string
}

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    fullName: "",
    gender: "",
    fullAddress: "",
    whatsappNumber: "",
    institution: "",
    faculty: "",
    studyProgram: "",
    studentId: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleNextStep = () => {
    setError("")
    
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
        setError("Semua field harus diisi")
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError("Password dan konfirmasi password tidak sama")
        return
      }
      
      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter")
        return
      }
    }
    
    setCurrentStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate step 2
    if (!formData.fullName || !formData.gender || !formData.fullAddress || 
        !formData.whatsappNumber || !formData.institution) {
      setError("Semua field wajib harus diisi")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          fullName: formData.fullName,
          gender: formData.gender,
          fullAddress: formData.fullAddress,
          whatsappNumber: formData.whatsappNumber,
          institution: formData.institution,
          faculty: formData.faculty || null,
          studyProgram: formData.studyProgram || null,
          studentId: formData.studentId || null,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan")
        return
      }

      // Registration successful, redirect to login
      router.push("/auth/signin?message=registration-success")
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-black dark:text-white">
            UNAS FEST 2025
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Buat akun baru untuk mengikuti lomba
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Sign Up - Step {currentStep} of 2
            </CardTitle>
            <div className="flex space-x-2">
              <div className={`h-2 flex-1 rounded ${currentStep >= 1 ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`} />
              <div className={`h-2 flex-1 rounded ${currentStep >= 2 ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              {currentStep === 1 && (
                <>
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    required
                  />

                  <Input
                    name="name"
                    type="text"
                    label="Nama (untuk login)"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama pendek"
                    required
                  />

                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      label="Konfirmasi Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Ulangi password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <Button type="submit" className="w-full">
                    Lanjut ke Step 2
                  </Button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Input
                    name="fullName"
                    type="text"
                    label="Nama Lengkap"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nama lengkap sesuai KTP"
                    required
                  />

                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-white"
                      required
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="MALE">Laki-laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  </div>

                  <Input
                    name="fullAddress"
                    type="text"
                    label="Alamat Lengkap"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    placeholder="Kelurahan/Kecamatan, Kabupaten, Kota"
                    required
                  />

                  <Input
                    name="whatsappNumber"
                    type="text"
                    label="Nomor WhatsApp"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="+628123456789"
                    required
                  />

                  <Input
                    name="institution"
                    type="text"
                    label="Institusi/Universitas"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Universitas Nasional"
                    required
                  />

                  <Input
                    name="faculty"
                    type="text"
                    label="Fakultas (Opsional)"
                    value={formData.faculty}
                    onChange={handleChange}
                    placeholder="Fakultas Teknik"
                  />

                  <Input
                    name="studyProgram"
                    type="text"
                    label="Program Studi (Opsional)"
                    value={formData.studyProgram}
                    onChange={handleChange}
                    placeholder="Informatika"
                  />

                  <Input
                    name="studentId"
                    type="text"
                    label="NPM/NIM (Opsional)"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="2023001"
                  />

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      loading={isLoading}
                    >
                      {isLoading ? "Creating..." : "Buat Akun"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sudah punya akun?{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-black hover:text-gray-800 dark:text-white dark:hover:text-gray-200"
                >
                  Sign in di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}