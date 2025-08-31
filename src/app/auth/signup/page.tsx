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
        setError("All fields must be filled")
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError("Password and confirmation password do not match")
        return
      }
      
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
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
      setError("All required fields must be filled")
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
        setError(data.error || "An error occurred")
        return
      }

      // Registration successful, redirect to login
      router.push("/auth/signin?message=registration-success")
    } catch (error) {
      setError("An error occurred. Please try again.")
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
            Caturnawa
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create a new account to join competitions
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
                    aria-label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    required
                  />

                  <Input
                    name="name"
                    type="text"
                    aria-label="Name (for login)"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Short name"
                    required
                  />

                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      aria-label="Password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      aria-label="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <Button type="submit" className="w-full">
                    Continue to Step 2
                  </Button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Input
                    name="fullName"
                    type="text"
                    aria-label="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full name as per ID card"
                    required
                  />

                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-white"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <Input
                    name="fullAddress"
                    type="text"
                    aria-label="Complete Address"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    placeholder="Sub-district/District, Regency, City"
                    required
                  />

                  <Input
                    name="whatsappNumber"
                    type="text"
                    aria-label="WhatsApp Number"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="+628123456789"
                    required
                  />

                  <Input
                    name="institution"
                    type="text"
                    aria-label="Institution/University"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Universitas Nasional"
                    required
                  />

                  <Input
                    name="faculty"
                    type="text"
                    aria-label="Faculty (Optional)"
                    value={formData.faculty}
                    onChange={handleChange}
                    placeholder="Faculty of Engineering"
                  />

                  <Input
                    name="studyProgram"
                    type="text"
                    aria-label="Study Program (Optional)"
                    value={formData.studyProgram}
                    onChange={handleChange}
                    placeholder="Informatics"
                  />

                  <Input
                    name="studentId"
                    type="text"
                    aria-label="Student ID (Optional)"
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
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-black hover:text-gray-800 dark:text-white dark:hover:text-gray-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}