"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft,
  Mail,
  Phone,
  Instagram,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  MapPin
} from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "unasfest@gmail.com",
      description: "Send us an email anytime",
      link: "mailto:unasfest@gmail.com",
      color: "text-blue-500"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      value: "+62 852-1121-1923",
      description: "Chat with us on WhatsApp",
      link: "https://wa.me/6285211211923",
      color: "text-green-500"
    },
    {
      icon: Instagram,
      title: "Instagram",
      value: "@unasfest",
      description: "Follow us for updates",
      link: "https://instagram.com/unasfest",
      color: "text-pink-500"
    }
  ]

  const competitionContacts = [
    {
      name: "KDBI",
      title: "Indonesian Language Debate",
      contact: "+62 812-3456-7890",
      color: "bg-blue-500"
    },
    {
      name: "EDC",
      title: "English Debate Competition",
      contact: "+62 812-3456-7891",
      color: "bg-green-500"
    },
    {
      name: "SPC",
      title: "Scientific Paper Competition",
      contact: "+62 812-3456-7892",
      color: "bg-purple-500"
    },
    {
      name: "DCC",
      title: "Digital Creative Competition",
      contact: "+62 812-3456-7893",
      color: "bg-orange-500"
    }
  ]

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
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground">
            Get in touch with our team for any questions or support
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="py-12 text-center">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                      <p className="text-muted-foreground">
                        Thank you for contacting us. We'll respond to your message soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="What is this about?"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Competition-Specific Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle>Competition-Specific Contacts</CardTitle>
                  <CardDescription>
                    Contact the specific division for competition-related questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {competitionContacts.map((comp) => (
                      <div key={comp.name} className="p-4 rounded-lg border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`h-10 w-10 rounded-full ${comp.color} flex items-center justify-center text-white font-bold text-sm`}>
                            {comp.name}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{comp.name}</h4>
                            <p className="text-xs text-muted-foreground">{comp.title}</p>
                          </div>
                        </div>
                        <a 
                          href={`https://wa.me/${comp.contact.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Phone className="h-3 w-3" />
                          {comp.contact}
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact Information */}
            <div className="space-y-6">
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Choose your preferred contact method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactMethods.map((method) => (
                    <a
                      key={method.title}
                      href={method.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <method.icon className={`h-5 w-5 ${method.color} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{method.title}</h4>
                          <p className="text-sm text-primary font-medium mb-1 break-all">
                            {method.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-semibold">09:00 - 17:00 WIB</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-semibold">09:00 - 14:00 WIB</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-semibold text-red-500">Closed</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      * Response time may vary during peak registration periods
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">Universitas Nasional</p>
                    <p className="text-muted-foreground">
                      Jl. Sawo Manila No.61<br />
                      Pejaten, Pasar Minggu<br />
                      Jakarta Selatan 12520<br />
                      Indonesia
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Quick Links</h4>
                  <div className="space-y-2">
                    <Link href="/guide" className="block text-sm text-primary hover:underline">
                      → Registration Guide
                    </Link>
                    <Link href="/faq" className="block text-sm text-primary hover:underline">
                      → Frequently Asked Questions
                    </Link>
                    <Link href="/schedule" className="block text-sm text-primary hover:underline">
                      → Event Schedule
                    </Link>
                    <Link href="/terms" className="block text-sm text-primary hover:underline">
                      → Terms & Conditions
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

