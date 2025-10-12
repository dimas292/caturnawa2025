"use client"

import Link from "next/link"
import { ArrowLeft, Trophy, Users, FileText, Video } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const competitions = [
  {
    id: "kdbi",
    name: "KDBI",
    fullName: "Kompetisi Debat Bahasa Indonesia",
    description: "Kompetisi debat dalam Bahasa Indonesia untuk mengasah kemampuan berargumentasi dan berpikir kritis",
    icon: Users,
    color: "bg-blue-500",
    badge: "Team",
    teamSize: "2 people",
    price: "Rp 250.000",
    href: "/competitions/kdbi"
  },
  {
    id: "edc",
    name: "EDC",
    fullName: "English Debate Competition",
    description: "English debate competition to sharpen argumentation skills and critical thinking in English",
    icon: Users,
    color: "bg-green-500",
    badge: "Team",
    teamSize: "2 people",
    price: "Rp 250.000",
    href: "/competitions/edc"
  },
  {
    id: "spc",
    name: "SPC",
    fullName: "Scientific Paper Competition",
    description: "Kompetisi karya tulis ilmiah untuk mengasah kemampuan penelitian dan penulisan akademik",
    icon: FileText,
    color: "bg-purple-500",
    badge: "Individual",
    teamSize: "Individual",
    price: "Rp 135.000",
    href: "/competitions/spc"
  },
  {
    id: "dcc",
    name: "DCC",
    fullName: "Digital Creative Competition",
    description: "Kompetisi konten digital kreatif dengan kategori Infografis dan Short Video",
    icon: Video,
    color: "bg-orange-500",
    badge: "Team",
    teamSize: "Max 3 people",
    price: "Rp 65.000",
    href: "/competitions/dcc"
  }
]

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Competitions</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Choose your competition and showcase your skills at UNAS FEST 2025. 
            We offer 4 exciting competitions across debate, academic writing, and digital creativity.
          </p>
        </div>
      </section>

      {/* Competitions Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {competitions.map((comp) => {
            const Icon = comp.icon
            return (
              <Card key={comp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${comp.color} p-3 rounded-xl text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline">{comp.badge}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{comp.name}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground/80">
                    {comp.fullName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {comp.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Team Size</p>
                      <p className="text-sm font-medium">{comp.teamSize}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-xs text-muted-foreground">Registration Fee</p>
                      <p className="text-sm font-medium">{comp.price}</p>
                    </div>
                  </div>

                  <Link href={comp.href} className="block">
                    <Button className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">Ready to Compete?</h2>
            <p className="text-muted-foreground mb-6">
              Registration is open until October 10, 2025. Don't miss your chance to participate in UNAS FEST 2025!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Register Now
                </Button>
              </Link>
              <Link href="/guide">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Registration Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

