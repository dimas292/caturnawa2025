"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CreditCard,
  Upload,
  Calendar,
  Users,
  FileText
} from "lucide-react"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>("registration")
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  const faqCategories = [
    {
      id: "registration",
      title: "Registration",
      icon: FileText,
      color: "text-blue-500",
      questions: [
        {
          id: "reg-1",
          q: "How do I register for UNAS FEST 2025?",
          a: "Click the 'Register Now' button on the homepage, create an account, select your competition, fill in the registration form, upload required documents, and complete the payment process."
        },
        {
          id: "reg-2",
          q: "Can I register for multiple competitions?",
          a: "Yes, you can register for multiple competitions. However, you need to complete separate registration forms and payments for each competition."
        },
        {
          id: "reg-3",
          q: "What is the registration deadline?",
          a: "The final registration deadline is October 10, 2025. However, we recommend registering early to take advantage of early bird discounts."
        },
        {
          id: "reg-4",
          q: "Can I edit my registration after submission?",
          a: "You can edit certain information before payment verification. After verification, please contact our support team for any changes."
        },
        {
          id: "reg-5",
          q: "What are the early bird discount periods?",
          a: "Early Bird (20% OFF): September 1-7, 2025. Phase 1 (10% OFF): September 8-19, 2025. Phase 2 (Normal Price): September 20 - October 10, 2025."
        }
      ]
    },
    {
      id: "payment",
      title: "Payment & Verification",
      icon: CreditCard,
      color: "text-green-500",
      questions: [
        {
          id: "pay-1",
          q: "What payment methods are accepted?",
          a: "We accept bank transfer to BNI account. Details will be provided after you complete the registration form."
        },
        {
          id: "pay-2",
          q: "How long does payment verification take?",
          a: "Payment verification typically takes 1-2 business days. You will receive an email notification once your payment is verified."
        },
        {
          id: "pay-3",
          q: "What should I do if my payment is not verified?",
          a: "If your payment hasn't been verified after 2 business days, please contact our support team with your registration ID and payment proof."
        },
        {
          id: "pay-4",
          q: "Can I get a refund if I cancel my registration?",
          a: "Refunds are only available if you cancel before the payment verification. After verification, registration fees are non-refundable."
        },
        {
          id: "pay-5",
          q: "What format should my payment proof be in?",
          a: "Payment proof should be in JPG, PNG, or PDF format, maximum 5MB, and must clearly show the transaction details including amount, date, and account information."
        }
      ]
    },
    {
      id: "upload",
      title: "Document & Work Upload",
      icon: Upload,
      color: "text-purple-500",
      questions: [
        {
          id: "upload-1",
          q: "What documents do I need to upload?",
          a: "You need to upload: 1) Student ID Card or Identity Card, 2) Certificate of Active Student (for students). All documents must be clear and readable."
        },
        {
          id: "upload-2",
          q: "What is the maximum file size for uploads?",
          a: "Documents: 2MB max. Payment proof: 5MB max. DCC Infografis: 10MB max. Videos (DCC & SPC): 100MB max."
        },
        {
          id: "upload-3",
          q: "When is the deadline for work submission (DCC & SPC)?",
          a: "The deadline for DCC and SPC work submission is October 28, 2025. Late submissions will not be accepted."
        },
        {
          id: "upload-4",
          q: "Can I re-upload my work if I made a mistake?",
          a: "Yes, you can re-upload your work before the deadline. The latest submission will be considered for judging."
        },
        {
          id: "upload-5",
          q: "What video formats are accepted for DCC and SPC?",
          a: "We accept MP4 and MOV formats. Make sure your video meets the duration and size requirements for your specific competition."
        }
      ]
    },
    {
      id: "competition",
      title: "Competition Details",
      icon: Users,
      color: "text-orange-500",
      questions: [
        {
          id: "comp-1",
          q: "What competitions are available?",
          a: "We offer 4 competitions: KDBI (Indonesian Debate), EDC (English Debate), SPC (Scientific Paper Competition), and DCC (Digital Creative Competition with Infografis and Short Video categories)."
        },
        {
          id: "comp-2",
          q: "Can I participate as an individual in team competitions?",
          a: "No, KDBI and EDC require exactly 2 team members. However, SPC (Scientific Paper) is individual, and DCC allows 1-3 members."
        },
        {
          id: "comp-3",
          q: "What are the judging criteria?",
          a: "Judging criteria vary by competition. Please visit the specific competition detail page for complete scoring criteria and rubrics."
        },
        {
          id: "comp-4",
          q: "When will the competitions be held?",
          a: "Competitions will be held from November 1-5, 2025. Specific dates for each competition will be announced closer to the event."
        },
        {
          id: "comp-5",
          q: "Will the competitions be online or offline?",
          a: "KDBI and EDC will be held offline. SPC and DCC are online competitions where you submit your work through the platform."
        }
      ]
    },
    {
      id: "schedule",
      title: "Schedule & Timeline",
      icon: Calendar,
      color: "text-red-500",
      questions: [
        {
          id: "sched-1",
          q: "What is the complete timeline for UNAS FEST 2025?",
          a: "Early Bird: Sept 1-7. Phase 1: Sept 8-19. Phase 2: Sept 20-Oct 10. Work Submission Deadline: Oct 28. Competitions: Nov 1-5. Awarding Ceremony: Nov 6."
        },
        {
          id: "sched-2",
          q: "When will I know if I'm selected for the next round?",
          a: "Results for each round will be announced through the leaderboard and your dashboard. You will also receive email notifications."
        },
        {
          id: "sched-3",
          q: "Can I check my competition schedule?",
          a: "Yes, detailed schedules will be available on your dashboard and the schedule page closer to the competition dates."
        },
        {
          id: "sched-4",
          q: "What happens if I miss the submission deadline?",
          a: "Late submissions will not be accepted. Please ensure you submit your work before the deadline to be eligible for judging."
        },
        {
          id: "sched-5",
          q: "When will the winners be announced?",
          a: "Winners will be announced during the Awarding Ceremony on November 6, 2025. Results will also be published on the website."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Support",
      icon: HelpCircle,
      color: "text-cyan-500",
      questions: [
        {
          id: "tech-1",
          q: "I forgot my password. How can I reset it?",
          a: "Click 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your inbox."
        },
        {
          id: "tech-2",
          q: "The website is not loading properly. What should I do?",
          a: "Try clearing your browser cache, using a different browser, or checking your internet connection. If the problem persists, contact our technical support."
        },
        {
          id: "tech-3",
          q: "I'm having trouble uploading files. What can I do?",
          a: "Ensure your file meets the size and format requirements. Try using a different browser or compressing your file. If issues continue, contact support."
        },
        {
          id: "tech-4",
          q: "How can I contact the support team?",
          a: "You can contact us through the Contact page, email us at unasfest@gmail.com, WhatsApp at 085211211923, or DM us on Instagram @unasfest."
        },
        {
          id: "tech-5",
          q: "Is my personal data secure?",
          a: "Yes, we take data security seriously. All personal information is encrypted and stored securely. Please read our Privacy Policy for more details."
        }
      ]
    }
  ]

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId)
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
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about UNAS FEST 2025
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {faqCategories.map((category) => (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setExpandedCategory(category.id)
                  setSearchQuery("")
                }}
              >
                <CardContent className="pt-6 text-center">
                  <category.icon className={`h-8 w-8 mx-auto mb-2 ${category.color}`} />
                  <h3 className="font-semibold text-sm">{category.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.questions.length} questions
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Categories */}
          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or browse all categories
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                      <div>
                        <CardTitle>{category.title}</CardTitle>
                        <CardDescription>{category.questions.length} questions</CardDescription>
                      </div>
                    </div>
                    {expandedCategory === category.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </CardHeader>
                {expandedCategory === category.id && (
                  <CardContent className="space-y-3">
                    {category.questions.map((question) => (
                      <div key={question.id} className="border rounded-lg">
                        <button
                          onClick={() => toggleQuestion(question.id)}
                          className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-sm pr-4">{question.q}</span>
                          {expandedQuestion === question.id ? (
                            <ChevronUp className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                        {expandedQuestion === question.id && (
                          <div className="px-4 pb-4 text-sm text-muted-foreground">
                            {question.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))
          )}

          {/* Still Have Questions */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <HelpCircle className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Still Have Questions?</h3>
                <p className="text-muted-foreground">
                  Can't find what you're looking for? Our support team is here to help!
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/contact">
                    <Button>
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/guide">
                    <Button variant="outline">
                      View Registration Guide
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

