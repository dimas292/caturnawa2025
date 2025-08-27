// src/app/auth/signin/page.tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { CircleCheck } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("from") || "/"
  const message = searchParams.get("message")

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
      } else if (result?.ok) {
        // Get updated session to check role
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        if (session?.user?.role) {
          // Redirect based on role
          switch (session.user.role) {
            case 'admin':
              window.location.href = '/dashboard/admin'
              break
            case 'judge':
              window.location.href = '/dashboard/judge'
              break
            case 'participant':
              window.location.href = '/dashboard'
              break
            default:
              window.location.href = callbackUrl
          }
        } else {
          window.location.href = callbackUrl
        }
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
            Sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {message === "registration-success" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                 <CircleCheck size={20} /> Registration successful! Please login with your account.
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <Input
                name="email"
                type="email"
                aria-label="Email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@email.com"
                required
              />

              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  aria-label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Masuk..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-black hover:text-gray-800 dark:text-white dark:hover:text-gray-200"
                >
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3 text-sm text-gray-900 dark:text-gray-100">Demo Accounts:</h3>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Admin:</strong> admin@caturnawa.com / admin123</p>
              <p><strong>Judge:</strong> judge.kdbi@caturnawa.com / admin123</p>
              <p><strong>Participant:</strong> test@example.com / test123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}