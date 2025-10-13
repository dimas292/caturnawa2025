// src/app/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Timeline } from "@/components/ui/timeline"
import { SplineScene } from "@/components/ui/spline"
import { Spotlight } from "@/components/ui/spotlight"
import { useSession } from "next-auth/react"
import {
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  LogIn,
  UserPlus,
  MessageSquare,
  BookOpen,
  ArrowDown,
  LayoutDashboard,
  VideoIcon,
  Users,
  Calendar,
  Clock
} from "lucide-react"
import Image from "next/image"
import Panflora from "../../public/image/caturnawa/PANFLORA 2.png"

export default function LandingPage() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date("2025-10-10T23:59:59")
    
    const timer = setInterval(() => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const competitions = [
    {
      name: "KDBI",
      title: "Indonesian Language Debate Competition",
      price: "Rp 250.000",
      icon: MessageSquare,
      description: "Showcase your Indonesian language debating skills"
    },
    {
      name: "EDC", 
      title: "English Debate Competition",
      price: "Rp 250.000",
      icon: MessageSquare,
      description: "Challenge your English debating skills"
    },
    {
      name: "SPC",
      title: "Scientific Paper Competition",
      price: "Rp 135.000",
      icon: BookOpen,
      description: "Showcase your research and academic writing skills"
    },
    {
      name: "DCC",
      title: "Digital Creative Competition",
      price: "Rp 65.000",
      description: "Infographics & Short Video Creation",
      icon: VideoIcon
    }
  ]

  const timelineData = [
    {
      title: "1-7 Sept 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-green-500 hover:bg-green-600">Early Bird</Badge>
            <Badge variant="outline">20% OFF</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Early Bird Registration
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            Get the best price! Register early and save 20% on all competition fees.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">KDBI & EDC</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="line-through">Rp 250.000</span> → <span className="text-green-600 dark:text-green-400 font-bold">Rp 200.000</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-sm">SPC</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="line-through">Rp 135.000</span> → <span className="text-green-600 dark:text-green-400 font-bold">Rp 108.000</span>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "8-19 Sept 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">Phase 1</Badge>
            <Badge variant="outline">10% OFF</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Phase 1 Registration
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            Still get a discount! Register during Phase 1 and save 10% on registration fees.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-neutral-700 dark:text-neutral-300">Registration period: 12 days</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-neutral-700 dark:text-neutral-300">Payment verification: 1-2 business days</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "20 Sept - 10 Oct 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-orange-500 hover:bg-orange-600">Phase 2 Extended</Badge>
            <Badge variant="outline">Normal Price</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Phase 2 Registration (Extended)
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            Final chance to register! Normal pricing applies. Registration closes on October 10, 2025.
          </p>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
              ⚠️ Last day to register: October 10, 2025 at 23:59 WIB
            </p>
          </div>
        </div>
      )
    },
    {
      title: "6 Nov 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Grand Finale</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Awarding Ceremony
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            The moment we've all been waiting for! Winners will be announced and awards will be presented.
          </p>
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
              🎉 Congratulations to all participants and winners!
            </p>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
            
              <span className="text-xl font-bold">Caturnawa</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#kompetisi" className="text-sm font-medium hover:text-primary transition">
                Competitions
              </Link>
              <Link href="#timeline" className="text-sm font-medium hover:text-primary transition">
                Timeline
              </Link>
              <Link href="/results" className="text-sm font-medium hover:text-primary transition">
                Results
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition">
                Leaderboard
              </Link>
              <Link href="#timeline" className="text-sm font-medium hover:text-primary transition">
                Participants
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">  
              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center space-x-2">
                {session ? (
                  <Link href={session.user.role === 'admin' ? '/dashboard/admin' : 
                               session.user.role === 'judge' ? '/dashboard/judge' : 
                               '/dashboard'}>
                    <Button>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="ghost">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link href="#kompetisi" className="block py-2 text-sm font-medium">
                Competitions
              </Link>
              <Link href="#timeline" className="block py-2 text-sm font-medium">
                Timeline
              </Link>
              <Link href="#kontak" className="block py-2 text-sm font-medium">
                Contact
              </Link>
              <div className="pt-3 space-y-2">
                {session ? (
                  <Link href={session.user.role === 'admin' ? '/dashboard/admin' : 
                               session.user.role === 'judge' ? '/dashboard/judge' : 
                               '/dashboard'} className="block">
                    <Button className="w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin" className="block">
                      <Button variant="outline" className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" className="block">
                      <Button className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with 3D Spline */}
      <section className="relative overflow-hidden bg-black/[0.96] dark:bg-black min-h-[90vh] flex items-center">
        {/* Spotlight Effect */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Logo/Mascot Image */}
              <div className="mb-6">
                <Image
                  src={Panflora}
                  alt="UNAS FEST 2025"
                  width={200}
                  height={200}
                  className="mx-auto md:mx-0"
                />
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                UNAS FEST 2025
              </h1>

              <p className="text-lg md:text-xl text-neutral-300 max-w-lg">
                Website Registration and Tabulation for UNAS FEST 2025 Competitions
              </p>

              {/* Countdown Timer */}
              <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
                <p className="text-sm text-neutral-400 mb-4">Phase 2 Extended registration ends in:</p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.days}</div>
                    <div className="text-xs text-neutral-400">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.hours}</div>
                    <div className="text-xs text-neutral-400">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.minutes}</div>
                    <div className="text-xs text-neutral-400">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.seconds}</div>
                    <div className="text-xs text-neutral-400">Seconds</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#kompetisi">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-neutral-700 text-white hover:bg-neutral-800">
                    View Competitions
                    <ArrowDown className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - 3D Spline Scene */}
            <div className="relative h-[400px] md:h-[600px] hidden md:block">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-neutral-900/50 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
                </div>
              }>
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Competitions Section */}
      <section id="kompetisi" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Competition Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose competitions that match your interests and talents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-6">
            {competitions.map((comp, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    {comp.icon && <comp.icon className="h-6 w-6 text-primary" />}
                  </div>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {comp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold">{comp.price}</span>
                    <Badge variant="secondary">Extended</Badge>
                  </div>
                    <Link href="/auth/signup">
                    <Button className="w-full" variant="outline">
                      Register
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="bg-white dark:bg-neutral-950">
        <Timeline
          data={timelineData}
          title="Registration Timeline"
          description="Don't miss the discount periods! Register early and save on competition fees."
        />
      </section>


      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Compete?
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto text-primary-foreground">
                Don't miss the opportunity to showcase your skills at Caturnawa 2025
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Registration Guide
                    <BookOpen className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

// Helper function
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}