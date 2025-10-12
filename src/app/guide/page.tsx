"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  CheckCircle2,
  FileText,
  Upload,
  CreditCard,
  UserCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Video,
  Image as ImageIcon,
  FileCheck
} from "lucide-react"

export default function GuidePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("registration")

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Registration Guide</h1>
          <p className="text-muted-foreground">
            Complete step-by-step guide for registering and participating in UNAS FEST 2025
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Quick Overview
              </CardTitle>
              <CardDescription>
                Follow these 5 simple steps to complete your registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                {[
                  { icon: UserCheck, label: "Create Account", step: 1 },
                  { icon: FileText, label: "Fill Form", step: 2 },
                  { icon: Upload, label: "Upload Documents", step: 3 },
                  { icon: CreditCard, label: "Payment", step: 4 },
                  { icon: CheckCircle2, label: "Verification", step: 5 }
                ].map((item) => (
                  <div key={item.step} className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Step {item.step}</div>
                    <div className="text-sm font-semibold">{item.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Registration */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection("registration")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="h-8 w-8 rounded-full flex items-center justify-center">1</Badge>
                  <CardTitle>Create Account & Choose Competition</CardTitle>
                </div>
                {expandedSection === "registration" ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            {expandedSection === "registration" && (
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Step 1.1: Create Your Account
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-6">
                    <li>Click "Sign Up" button on the homepage</li>
                    <li>Fill in your email address and create a strong password</li>
                    <li>Verify your email address (check your inbox)</li>
                    <li>Log in with your credentials</li>
                  </ol>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Step 1.2: Select Competition
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Choose from the following competitions:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { name: "KDBI", desc: "Indonesian Language Debate", price: "Rp 250.000", team: "2 people" },
                      { name: "EDC", desc: "English Debate Competition", price: "Rp 250.000", team: "2 people" },
                      { name: "SPC", desc: "Scientific Paper Competition", price: "Rp 135.000", team: "Individual" },
                      { name: "DCC", desc: "Digital Creative Competition", price: "Rp 65.000", team: "Max 3 people" }
                    ].map((comp) => (
                      <div key={comp.name} className="p-3 rounded-lg border bg-muted/50">
                        <div className="font-semibold text-sm">{comp.name}</div>
                        <div className="text-xs text-muted-foreground">{comp.desc}</div>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="outline" className="text-xs">{comp.team}</Badge>
                          <span className="text-xs font-semibold text-primary">{comp.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Important Note:</p>
                      <p className="text-blue-800 dark:text-blue-200">
                        Registration deadline is <strong>October 10, 2025</strong>. Early bird discounts are available until September 7, 2025.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Step 2: Fill Registration Form */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection("form")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="h-8 w-8 rounded-full flex items-center justify-center">2</Badge>
                  <CardTitle>Fill Registration Form</CardTitle>
                </div>
                {expandedSection === "form" ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            {expandedSection === "form" && (
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Complete all required information accurately. The form includes:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Personal Information:</strong> Full name, email, phone number, institution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Team Information:</strong> Team name, member details (for team competitions)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Emergency Contact:</strong> Name and phone number of emergency contact</span>
                  </li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Tips:</p>
                      <ul className="text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                        <li>Double-check all information before submitting</li>
                        <li>Use a valid email address for communication</li>
                        <li>Ensure phone numbers are active and reachable</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Step 3: Upload Documents */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection("documents")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="h-8 w-8 rounded-full flex items-center justify-center">3</Badge>
                  <CardTitle>Upload Required Documents</CardTitle>
                </div>
                {expandedSection === "documents" ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            {expandedSection === "documents" && (
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Prepare and upload the following documents:
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Student ID Card / Identity Card</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Format: JPG, PNG, or PDF • Max size: 2MB • Must be clear and readable
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Certificate of Active Student (for students)</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Format: PDF • Max size: 2MB • Must be signed and stamped by institution
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Important:</p>
                      <p className="text-red-800 dark:text-red-200">
                        All documents must be valid and authentic. Fake or manipulated documents will result in disqualification.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Step 4: Payment */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection("payment")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="h-8 w-8 rounded-full flex items-center justify-center">4</Badge>
                  <CardTitle>Payment & Upload Proof</CardTitle>
                </div>
                {expandedSection === "payment" ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            {expandedSection === "payment" && (
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Payment Methods:</h4>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <p className="font-semibold text-sm mb-2">Bank Transfer:</p>
                    <div className="space-y-1 text-sm">
                      <p><strong>Bank:</strong> BNI</p>
                      <p><strong>Account Number:</strong> 1234567890</p>
                      <p><strong>Account Name:</strong> UNAS FEST 2025</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Upload Payment Proof:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                    <li>Make payment according to your selected competition fee</li>
                    <li>Take a clear screenshot or photo of the payment receipt</li>
                    <li>Upload the proof through your dashboard</li>
                    <li>Wait for admin verification (usually within 1-2 business days)</li>
                  </ol>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Accepted Formats:</p>
                      <p className="text-green-800 dark:text-green-200">
                        JPG, PNG, or PDF • Max size: 5MB • Must show transaction details clearly
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Step 5: Work Submission (for DCC & SPC) */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection("submission")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="h-8 w-8 rounded-full flex items-center justify-center">5</Badge>
                  <CardTitle>Work Submission (DCC & SPC Only)</CardTitle>
                </div>
                {expandedSection === "submission" ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            {expandedSection === "submission" && (
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For DCC and SPC participants, you need to submit your work before the deadline.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">DCC Infografis</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Format: JPG, PNG</li>
                      <li>• Max size: 10MB</li>
                      <li>• Resolution: Min 1920x1080px</li>
                      <li>• Deadline: October 28, 2025</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">DCC Short Video</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Format: MP4, MOV</li>
                      <li>• Max size: 100MB</li>
                      <li>• Duration: Max 3 minutes</li>
                      <li>• Deadline: October 28, 2025</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border md:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">SPC Video</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Format: MP4, MOV</li>
                      <li>• Max size: 100MB</li>
                      <li>• Duration: 5-7 minutes</li>
                      <li>• Deadline: October 28, 2025</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Troubleshooting Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    q: "I can't upload my documents",
                    a: "Make sure your file size doesn't exceed the limit and the format is correct. Try using a different browser or clearing your cache."
                  },
                  {
                    q: "Payment verification is taking too long",
                    a: "Verification usually takes 1-2 business days. If it's been longer, contact our support team with your registration ID."
                  },
                  {
                    q: "I made a mistake in my registration form",
                    a: "Contact our support team immediately with your registration ID and the details you need to change."
                  },
                  {
                    q: "I forgot my password",
                    a: "Click 'Forgot Password' on the login page and follow the instructions sent to your email."
                  }
                ].map((item, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-muted/30">
                    <p className="font-semibold text-sm mb-1">Q: {item.q}</p>
                    <p className="text-sm text-muted-foreground">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Still Need Help?</h3>
                <p className="text-muted-foreground">
                  Our support team is ready to assist you
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/contact">
                    <Button>
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button variant="outline">
                      View FAQ
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

