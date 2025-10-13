// src/app/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Timeline } from "@/components/ui/timeline"
import { SplineLazy } from "@/components/ui/spline-lazy"
import { Spotlight } from "@/components/ui/spotlight"
import { CompetitionCard } from "@/components/ui/competition-card"
import { CTASection } from "@/components/ui/cta-section"
import { useSession } from "next-auth/react"
import {
  ArrowRight,
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
      originalPrice: "Rp 312.500",
      icon: MessageSquare,
      description: "Showcase your Indonesian language debating skills",
      badge: "Phase 2",
      benefits: [
        { text: "Team of 3 debaters", checked: true },
        { text: "Preliminary & Final rounds", checked: true },
        { text: "Certificate for all participants", checked: true },
        { text: "Trophy for winners", checked: true },
        { text: "Early bird discount", checked: false },
      ]
    },
    {
      name: "EDC",
      title: "English Debate Competition",
      price: "Rp 250.000",
      originalPrice: "Rp 312.500",
      icon: MessageSquare,
      description: "Challenge your English debating skills",
      badge: "Phase 2",
      benefits: [
        { text: "Team of 3 debaters", checked: true },
        { text: "Preliminary & Final rounds", checked: true },
        { text: "Certificate for all participants", checked: true },
        { text: "Trophy for winners", checked: true },
        { text: "Early bird discount", checked: false },
      ]
    },
    {
      name: "SPC",
      title: "Scientific Paper Competition",
      price: "Rp 135.000",
      originalPrice: "Rp 168.750",
      icon: BookOpen,
      description: "Showcase your research and academic writing skills",
      badge: "Phase 2",
      benefits: [
        { text: "Individual or team (max 3)", checked: true },
        { text: "Abstract & full paper submission", checked: true },
        { text: "Certificate for all participants", checked: true },
        { text: "Publication opportunity", checked: true },
        { text: "Early bird discount", checked: false },
      ]
    },
    {
      name: "DCC",
      title: "Digital Creative Competition",
      price: "Rp 65.000",
      originalPrice: "Rp 81.250",
      description: "Infographics & Short Video Creation",
      icon: VideoIcon,
      badge: "Phase 2",
      benefits: [
        { text: "Individual competition", checked: true },
        { text: "2 categories: Infographic & Video", checked: true },
        { text: "Certificate for all participants", checked: true },
        { text: "Trophy for winners", checked: true },
        { text: "Early bird discount", checked: false },
      ]
    }
  ]

  const timelineData = [
    {
      title: "1-7 Sept 2025",
      content: (
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#2f3136] to-[#202225] border border-[#5865f2]/30 hover:border-[#5865f2]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#5865f2]/20">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-[#43b581] hover:bg-[#3ca374] text-white border-0">Early Bird</Badge>
            <Badge className="bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/50 hover:bg-[#5865f2]/30">20% OFF</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
            Early Bird Registration
          </h3>
          <p className="text-neutral-300 text-sm md:text-base mb-4">
            Get the best price! Register early and save 20% on all competition fees.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="group p-4 rounded-lg bg-[#36393f] hover:bg-[#40444b] transition-all duration-200 border border-transparent hover:border-[#5865f2]/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-[#5865f2]/20">
                  <Users className="h-4 w-4 text-[#5865f2]" />
                </div>
                <span className="font-semibold text-sm text-white">KDBI & EDC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 line-through">Rp 250.000</span>
                <span className="text-sm text-[#43b581] font-bold">→ Rp 200.000</span>
              </div>
            </div>
            <div className="group p-4 rounded-lg bg-[#36393f] hover:bg-[#40444b] transition-all duration-200 border border-transparent hover:border-[#5865f2]/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-[#5865f2]/20">
                  <Users className="h-4 w-4 text-[#5865f2]" />
                </div>
                <span className="font-semibold text-sm text-white">SPC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 line-through">Rp 135.000</span>
                <span className="text-sm text-[#43b581] font-bold">→ Rp 108.000</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "8-19 Sept 2025",
      content: (
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#2f3136] to-[#202225] border border-[#5865f2]/30 hover:border-[#5865f2]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#5865f2]/20">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-[#5865f2] hover:bg-[#4752c4] text-white border-0">Phase 1</Badge>
            <Badge className="bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/50 hover:bg-[#5865f2]/30">10% OFF</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
            Phase 1 Registration
          </h3>
          <p className="text-neutral-300 text-sm md:text-base mb-4">
            Still get a discount! Register during Phase 1 and save 10% on registration fees.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#36393f] hover:bg-[#40444b] transition-colors">
              <div className="p-2 rounded-md bg-[#5865f2]/20">
                <Calendar className="h-4 w-4 text-[#5865f2]" />
              </div>
              <span className="text-sm text-neutral-300">Registration period: <span className="text-white font-semibold">12 days</span></span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#36393f] hover:bg-[#40444b] transition-colors">
              <div className="p-2 rounded-md bg-[#5865f2]/20">
                <Clock className="h-4 w-4 text-[#5865f2]" />
              </div>
              <span className="text-sm text-neutral-300">Payment verification: <span className="text-white font-semibold">1-2 business days</span></span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "20 Sept - 10 Oct 2025",
      content: (
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#2f3136] to-[#202225] border border-[#faa61a]/30 hover:border-[#faa61a]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#faa61a]/20">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-[#faa61a] hover:bg-[#e89512] text-white border-0">Phase 2 Extended</Badge>
            <Badge className="bg-neutral-700 text-neutral-300 border border-neutral-600 hover:bg-neutral-600">Normal Price</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
            Phase 2 Registration (Extended)
          </h3>
          <p className="text-neutral-300 text-sm md:text-base mb-4">
            Final chance to register! Normal pricing applies. Registration closes on October 10, 2025.
          </p>
          <div className="relative p-4 rounded-lg bg-gradient-to-r from-[#ed4245]/20 to-[#ed4245]/10 border border-[#ed4245]/50 overflow-hidden">
            <div className="absolute inset-0 bg-[#ed4245]/5 animate-pulse"></div>
            <div className="relative flex items-start gap-3">
              <div className="mt-0.5">
                <div className="p-1.5 rounded-md bg-[#ed4245]/30">
                  <Clock className="h-4 w-4 text-[#ed4245]" />
                </div>
              </div>
              <div>
                <p className="text-sm text-[#ed4245] font-semibold mb-1">
                  ⚠️ Registration Deadline
                </p>
                <p className="text-sm text-neutral-300">
                  Last day to register: <span className="text-white font-bold">October 10, 2025 at 23:59 WIB</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "6 Nov 2025",
      content: (
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#2f3136] to-[#202225] border border-[#faa61a]/30 hover:border-[#faa61a]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#faa61a]/20">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-gradient-to-r from-[#faa61a] to-[#f0b232] hover:from-[#e89512] hover:to-[#dfa020] text-white border-0">Grand Finale</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
            Awarding Ceremony
          </h3>
          <p className="text-neutral-300 text-sm md:text-base mb-4">
            The moment we've all been waiting for! Winners will be announced and awards will be presented.
          </p>
          <div className="relative p-4 rounded-lg bg-gradient-to-r from-[#faa61a]/20 to-[#faa61a]/10 border border-[#faa61a]/50 overflow-hidden">
            <div className="absolute inset-0 bg-[#faa61a]/5 animate-pulse"></div>
            <div className="relative flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <p className="text-sm text-neutral-300">
                <span className="text-[#faa61a] font-semibold">Congratulations</span> to all participants and winners!
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-[#202225]">
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
              <div className="relative group">
                <button className="text-sm font-medium hover:text-primary transition">
                  Leaderboard
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/leaderboard/kdbi" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    KDBI Leaderboard
                  </Link>
                  <Link href="/leaderboard/edc" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    EDC Leaderboard
                  </Link>
                  <Link href="/leaderboard/spc" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    SPC Leaderboard
                  </Link>
                  <Link href="/leaderboard/dcc" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    DCC Leaderboard
                  </Link>
                </div>
              </div>
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
      <section className="relative overflow-hidden bg-[#202225] dark:bg-[#202225] min-h-[90vh] flex items-center">
        {/* Spotlight Effect */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#5865f2"
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
              <SplineLazy
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Competitions Section */}
      <section id="kompetisi" className="py-20 bg-[#202225] dark:bg-[#202225]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Competition Categories</h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Choose competitions that match your interests and talents. Phase 2 Extended pricing now available!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {competitions.map((comp, index) => (
              <CompetitionCard
                key={index}
                name={comp.name}
                title={comp.title}
                price={comp.price}
                originalPrice={comp.originalPrice}
                icon={comp.icon}
                description={comp.description}
                benefits={comp.benefits}
                badge={comp.badge}
                featured={index === 0} // Featured first competition
              />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="bg-[#202225] dark:bg-[#202225]">
        <Timeline
          data={timelineData}
          title="Registration Timeline"
          description="Don't miss the discount periods! Register early and save on competition fees."
        />
      </section>


      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

// Helper function
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}