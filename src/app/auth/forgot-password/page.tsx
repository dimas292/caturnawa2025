"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="w-full max-w-md">
          <div className="animate-element animate-delay-100 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold mb-2">Check Your Email</h1>
              <p className="text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-2xl text-sm text-muted-foreground">
              <p>Didn't receive the email? Check your spam folder or try again in a few minutes.</p>
            </div>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Back Button */}
          <Link
            href="/auth/signin"
            className="animate-element animate-delay-100 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          {/* Header */}
          <div className="animate-element animate-delay-200">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-2">
              <span className="font-light tracking-tighter">Reset Password</span>
            </h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="animate-element animate-delay-300">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm p-4 pl-12 rounded-2xl focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="animate-element animate-delay-400 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </form>

          {/* Info */}
          <div className="animate-element animate-delay-500 p-4 bg-muted/50 rounded-2xl text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> Password reset is currently not implemented. Please contact the administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

