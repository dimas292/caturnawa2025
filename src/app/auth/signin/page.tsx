// src/app/auth/signin/page.tsx
"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

function SignInForm() {
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
        setError("Email or password is incorrect")
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
      setError("An error occurred. Please try again.")
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
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] overflow-hidden">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="animate-element animate-delay-100">
              <Link href="/" className="inline-block mb-4">
                <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                  <span className="font-light tracking-tighter">Welcome Back</span>
                </h1>
              </Link>
              <p className="text-muted-foreground">
                Sign in to access your Caturnawa account and continue your competition journey
              </p>
            </div>

            {/* Messages */}
            {message === "registration-success" && (
              <div className="animate-element animate-delay-200 flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>Registration successful! Please sign in with your account.</span>
              </div>
            )}

            {message === "account-deleted" && (
              <div className="animate-element animate-delay-200 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>Your account has been deleted. Please contact administrator if this was done in error.</span>
              </div>
            )}

            {message === "session-invalid" && (
              <div className="animate-element animate-delay-200 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-2xl text-sm dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>Your session has expired or is invalid. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div className="animate-element animate-delay-200 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/5">
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/5">
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                  <span className="text-foreground/90">Keep me signed in</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="hover:underline text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="animate-element animate-delay-700 text-center text-sm text-muted-foreground">
              New to Caturnawa?{" "}
              <Link
                href="/auth/signup"
                className="text-primary hover:underline transition-colors font-medium"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image */}
      <section className="hidden md:block flex-1 relative p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80)` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="animate-testimonial animate-delay-1000 rounded-3xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 p-6 max-w-md">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-1">Join the Competition</p>
                  <p className="text-sm text-white/80 mb-3">
                    Participate in KDBI, EDC, SPC, and DCC competitions. Showcase your skills and win amazing prizes!
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>UNAS FEST 2025</span>
                    <span>•</span>
                    <span>4 Competitions Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}