// src/app/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  VideoIcon
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
      title: "Speech Competition",
      price: "Rp 135.000", 
      icon: BookOpen,
      description: "Demonstrate your public speaking abilities"
    },
    {
      name: "DCC",
      title: "Digital Creative Competition",
      price: "Rp 65.000",
      description: "Infographics & Short Video Creation",
      icon: VideoIcon
    }
  ]

  const timeline = [
    { phase: "Early Bird", date: "1-7 September 2025", discount: "20% OFF", active: false },
    { phase: "Phase 1", date: "8-19 September 2025", discount: "10% OFF", active: false },
    { phase: "Phase 2", date: "20-28 September 2025", discount: "Normal Price", active:  false},
    { phase: "Extended Phase", date: "30 September - 10 October 2025", discount: "Normal Price", active: true },
    { phase: "Awarding Ceremony", date: "6 November 2025", discount: null, active: false }
    
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

      <section>
        <Image src={Panflora} alt="UNAS FEST 2025" width={350} height={350} className="mx-auto h-full" />
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
           
            <h1 className="text-md  font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                WEBSITE REGISTRATION AND TABULATION FOR<br/> UNAS FEST 2025
            </h1>
            

              <div className="bg-card rounded-2xl p-6 mb-8 max-w-2xl mx-auto border py-20">
               <p className="text-sm text-muted-foreground mb-4">Extended registration ends in:</p>
               <div className="grid grid-cols-4 gap-4">
                 <div>
                   <div className="text-2xl md:text-3xl font-bold">{timeLeft.days}</div>
                   <div className="text-xs text-muted-foreground">Days</div>
                 </div>
                 <div>
                   <div className="text-2xl md:text-3xl font-bold">{timeLeft.hours}</div>
                   <div className="text-xs text-muted-foreground">Hours</div>
                 </div>
                 <div>
                   <div className="text-2xl md:text-3xl font-bold">{timeLeft.minutes}</div>
                   <div className="text-xs text-muted-foreground">Minutes</div>
                 </div>
                 <div>
                   <div className="text-2xl md:text-3xl font-bold">{timeLeft.seconds}</div>
                   <div className="text-xs text-muted-foreground">Seconds</div>
                 </div>
               </div>
             </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
               <Link href="/auth/signup">
                 <Button size="lg" className="w-full sm:w-auto">
                   Register Now
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </Link>
               <Link href="#kompetisi">
                 <Button size="lg" variant="outline" className="w-full sm:w-auto">
                   View Competitions
                   <ArrowDown className="ml-2 h-4 w-4" />
                 </Button>
               </Link>
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
                    <span className="text-2xl font-bold">{comp.price}</span>
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
      <section id="timeline" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Registration Timeline</h2>
            <p className="text-muted-foreground">
              Don't miss the discount periods!
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-4 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center border-2",
                    item.active 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background text-muted-foreground border-muted"
                  )}>
                    {index + 1}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-20 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1">
                  <Card className={item.active ? "border-primary" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{item.phase}</h3>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        {item.discount && (
                          <Badge variant={item.active ? "default" : "secondary"}>
                            {item.discount}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Footer */}
      <footer id="kontak" className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">

                <span className="font-bold">Caturnawa 2025</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Caturnawa Festival for high school students across Indonesia
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/guide" className="hover:text-primary">Guide</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Competitions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/competitions/kdbi" className="hover:text-primary">KDBI</Link></li>
                <li><Link href="/competitions/edc" className="hover:text-primary">EDC</Link></li>
                <li><Link href="/competitions/spc" className="hover:text-primary">SPC</Link></li>
                <li><Link href="/competitions/dcc" className="hover:text-primary">DCC</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: info@caturnawa2025.com</li>
                <li>WhatsApp: 0812-3456-7890</li>
                <li>Instagram: @caturnawa2025</li>
              </ul>
            </div>
          </div>
          
         
          
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Caturnawa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper function
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}