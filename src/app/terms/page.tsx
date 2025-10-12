"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, AlertCircle } from "lucide-react"

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground">
            Last updated: October 12, 2025
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Important Notice */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Please Read Carefully
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">
                    By registering for UNAS FEST 2025 and using the Caturnawa platform, you agree to be bound by these Terms and Conditions. Please read them carefully before proceeding with your registration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                By accessing and using the Caturnawa registration and tabulation system ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                If you do not agree to these Terms and Conditions, you should not use this Platform or participate in UNAS FEST 2025.
              </p>
            </CardContent>
          </Card>

          {/* 2. Registration and Account */}
          <Card>
            <CardHeader>
              <CardTitle>2. Registration and Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>2.1 Account Creation:</strong> You must create an account to register for competitions. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p>
                <strong>2.2 Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                <strong>2.3 Account Security:</strong> You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.
              </p>
              <p>
                <strong>2.4 One Account Per Person:</strong> Each participant may only create one account. Multiple accounts by the same person are prohibited and may result in disqualification.
              </p>
            </CardContent>
          </Card>

          {/* 3. Competition Rules */}
          <Card>
            <CardHeader>
              <CardTitle>3. Competition Rules and Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>3.1 Eligibility:</strong> Participants must meet the eligibility requirements specified for each competition category.
              </p>
              <p>
                <strong>3.2 Original Work:</strong> All submissions must be original work created by the participant(s). Plagiarism or copyright infringement will result in immediate disqualification.
              </p>
              <p>
                <strong>3.3 Deadlines:</strong> All submissions must be completed before the specified deadlines. Late submissions will not be accepted.
              </p>
              <p>
                <strong>3.4 Fair Play:</strong> Participants must compete fairly and ethically. Any form of cheating, manipulation, or unfair advantage is strictly prohibited.
              </p>
              <p>
                <strong>3.5 Conduct:</strong> Participants must maintain respectful and professional conduct throughout the competition. Harassment, discrimination, or inappropriate behavior will not be tolerated.
              </p>
            </CardContent>
          </Card>

          {/* 4. Payment and Refunds */}
          <Card>
            <CardHeader>
              <CardTitle>4. Payment and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>4.1 Registration Fees:</strong> All registration fees must be paid in full before the registration deadline. Fees vary by competition and registration period.
              </p>
              <p>
                <strong>4.2 Payment Verification:</strong> Payment verification typically takes 1-2 business days. Your registration is not complete until payment is verified.
              </p>
              <p>
                <strong>4.3 Refund Policy:</strong> Registration fees are non-refundable after payment verification. Refunds may be considered only in exceptional circumstances at the sole discretion of the organizers.
              </p>
              <p>
                <strong>4.4 Pricing:</strong> The organizers reserve the right to modify pricing and discount periods. Prices are subject to change without prior notice.
              </p>
            </CardContent>
          </Card>

          {/* 5. Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>5.1 Participant Content:</strong> You retain ownership of your submitted work. However, by submitting, you grant UNAS FEST 2025 a non-exclusive, worldwide license to use, display, and promote your work for event-related purposes.
              </p>
              <p>
                <strong>5.2 Platform Content:</strong> All content on the Caturnawa platform, including text, graphics, logos, and software, is the property of UNAS FEST 2025 and is protected by copyright laws.
              </p>
              <p>
                <strong>5.3 Prohibited Use:</strong> You may not reproduce, distribute, modify, or create derivative works from any content on the Platform without express written permission.
              </p>
            </CardContent>
          </Card>

          {/* 6. Judging and Results */}
          <Card>
            <CardHeader>
              <CardTitle>6. Judging and Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>6.1 Judging Criteria:</strong> All submissions will be judged according to the criteria specified for each competition category.
              </p>
              <p>
                <strong>6.2 Judge Decisions:</strong> All decisions made by the judges are final and binding. No appeals or disputes will be entertained.
              </p>
              <p>
                <strong>6.3 Results Publication:</strong> Results will be published on the Platform and announced during the awarding ceremony.
              </p>
              <p>
                <strong>6.4 Disqualification:</strong> The organizers reserve the right to disqualify any participant who violates these terms or engages in misconduct.
              </p>
            </CardContent>
          </Card>

          {/* 7. Liability and Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>7.1 Platform Availability:</strong> While we strive to maintain the Platform's availability, we do not guarantee uninterrupted access. The Platform may be unavailable due to maintenance, technical issues, or other circumstances.
              </p>
              <p>
                <strong>7.2 Data Loss:</strong> We are not responsible for any loss of data, submissions, or content. Participants are advised to keep backup copies of their work.
              </p>
              <p>
                <strong>7.3 Third-Party Links:</strong> The Platform may contain links to third-party websites. We are not responsible for the content or practices of these external sites.
              </p>
              <p>
                <strong>7.4 Disclaimer:</strong> The Platform is provided "as is" without warranties of any kind, either express or implied.
              </p>
            </CardContent>
          </Card>

          {/* 8. Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle>8. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your use of the Platform is also governed by our Privacy Policy. Please review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your personal information.
              </p>
            </CardContent>
          </Card>

          {/* 9. Modifications */}
          <Card>
            <CardHeader>
              <CardTitle>9. Modifications to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the Platform. Your continued use of the Platform after changes are posted constitutes your acceptance of the modified terms.
              </p>
            </CardContent>
          </Card>

          {/* 10. Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Jakarta, Indonesia.
              </p>
            </CardContent>
          </Card>

          {/* 11. Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email: unasfest@gmail.com</li>
                <li>WhatsApp: +62 852-1121-1923</li>
                <li>Instagram: @unasfest</li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          {/* Acceptance */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-center text-muted-foreground">
                By using the Caturnawa platform and participating in UNAS FEST 2025, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="flex justify-center gap-4">
            <Link href="/privacy">
              <Button variant="outline">
                Privacy Policy
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

