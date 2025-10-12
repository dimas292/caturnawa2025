"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Shield, AlertCircle } from "lucide-react"

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: October 12, 2025
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Important Notice */}
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Your Privacy Matters
                  </p>
                  <p className="text-green-800 dark:text-green-200">
                    UNAS FEST 2025 is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use the Caturnawa platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                This Privacy Policy describes how UNAS FEST 2025 ("we," "us," or "our") collects, uses, and shares your personal information when you use the Caturnawa registration and tabulation platform ("the Platform").
              </p>
              <p>
                By using the Platform, you consent to the collection and use of your information as described in this Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* 2. Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-2">2.1 Personal Information</p>
                <p className="mb-2">When you register for UNAS FEST 2025, we collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Institution/school name</li>
                  <li>Student ID or Identity Card number</li>
                  <li>Emergency contact information</li>
                  <li>Team member information (for team competitions)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-2">2.2 Documents and Files</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Student ID Card or Identity Card copies</li>
                  <li>Certificate of Active Student</li>
                  <li>Payment proof/receipts</li>
                  <li>Competition submissions (videos, infographics, etc.)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-2">2.3 Technical Information</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Login timestamps</li>
                  <li>Platform usage data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 3. How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Registration Processing:</strong> To process and manage your competition registration</li>
                <li><strong>Communication:</strong> To send you important updates, notifications, and announcements about the competition</li>
                <li><strong>Verification:</strong> To verify your identity and eligibility for participation</li>
                <li><strong>Payment Processing:</strong> To process and verify your registration payments</li>
                <li><strong>Competition Management:</strong> To organize and conduct the competitions, including judging and scoring</li>
                <li><strong>Results Publication:</strong> To publish competition results and leaderboards</li>
                <li><strong>Platform Improvement:</strong> To improve our Platform's functionality and user experience</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-2">4.1 With Judges and Organizers</p>
                <p>
                  We share your submissions and relevant information with competition judges and organizers for evaluation purposes.
                </p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-2">4.2 Public Information</p>
                <p>
                  The following information may be made public:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Team names and member names</li>
                  <li>Competition results and rankings</li>
                  <li>Winning submissions (with your consent)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-2">4.3 Third-Party Service Providers</p>
                <p>
                  We may share information with trusted third-party service providers who assist us in operating the Platform, such as hosting services and payment processors. These providers are bound by confidentiality agreements.
                </p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-2">4.4 Legal Requirements</p>
                <p>
                  We may disclose your information if required by law or in response to valid legal requests.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Data Security */}
          <Card>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                Security measures include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encrypted data transmission (HTTPS/SSL)</li>
                <li>Secure password hashing</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Secure file storage</li>
              </ul>
              <p className="mt-3">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          {/* 6. Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
              </p>
              <p>
                Specifically:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Registration data: Retained for the duration of the event and up to 2 years after for record-keeping</li>
                <li>Competition submissions: Retained for archival purposes with your consent</li>
                <li>Payment records: Retained as required by financial regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* 7. Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> You can request access to your personal information</li>
                <li><strong>Correction:</strong> You can request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> You can request deletion of your information (subject to legal requirements)</li>
                <li><strong>Objection:</strong> You can object to certain processing of your information</li>
                <li><strong>Data Portability:</strong> You can request a copy of your data in a portable format</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us using the information provided in Section 10.
              </p>
            </CardContent>
          </Card>

          {/* 8. Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>8. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on the Platform. Cookies are small data files stored on your device.
              </p>
              <p>
                We use cookies for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Authentication and session management</li>
                <li>Remembering your preferences</li>
                <li>Analytics and performance monitoring</li>
                <li>Security purposes</li>
              </ul>
              <p className="mt-3">
                You can control cookies through your browser settings, but disabling cookies may affect Platform functionality.
              </p>
            </CardContent>
          </Card>

          {/* 9. Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                The Platform is intended for users who are at least 13 years old. If you are under 18, you should have parental or guardian consent before using the Platform.
              </p>
              <p>
                We do not knowingly collect personal information from children under 13 without parental consent. If we become aware of such collection, we will take steps to delete the information.
              </p>
            </CardContent>
          </Card>

          {/* 10. Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>10. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on the Platform and updating the "Last updated" date.
              </p>
              <p>
                Your continued use of the Platform after changes are posted constitutes your acceptance of the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* 11. Contact Us */}
          <Card>
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email: unasfest@gmail.com</li>
                <li>WhatsApp: +62 852-1121-1923</li>
                <li>Instagram: @unasfest</li>
                <li>Address: Universitas Nasional, Jl. Sawo Manila No.61, Jakarta Selatan 12520</li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          {/* Acceptance */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-center text-muted-foreground">
                By using the Caturnawa platform, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
              </p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="flex justify-center gap-4">
            <Link href="/terms">
              <Button variant="outline">
                Terms & Conditions
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

