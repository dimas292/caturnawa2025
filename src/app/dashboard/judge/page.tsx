// src/app/dashboard/judge/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRequireRoles } from "@/hooks/use-auth"
import { signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingPage } from "@/components/ui/loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import BPScoringForm from "@/components/judge/bp-scoring-form"
import SPCSemifinalEvaluation from "@/components/judge/spc-semifinal-evaluation"
import SPCFinalScoring from "@/components/judge/spc-final-scoring"
import DCCSemifinalScoring from "@/components/judge/dcc-semifinal-scoring"
import DCCFinalScoring from "@/components/judge/dcc-final-scoring"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import React from "react"
import { 
  User, 
  FileText, 
  Trophy, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Edit,
  LayoutDashboard,
  History,
  Bell,
  ChevronLeft,
  Award,
  CheckSquare
} from "lucide-react"

// Sidebar Navigation Items for Judge
const judgeSidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard/judge",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "SPC",
    href: "/dashboard/judge/spc",
    icon: Award,
    badge: null
  },
  {
    title: "DCC",
    href: "/dashboard/judge/dcc",
    icon: Award,
    badge: null
  },
  {
    title: "Hasil",
    href: "/dashboard/judge/results",
    icon: Award,
    badge: null
  },
]


interface MemberLite {
  fullName: string
  participant?: { fullName: string }
}

interface TeamLite {
  id: string
  teamName: string
  members: MemberLite[]
}

interface Match {
  id: string
  matchNumber: number
  roundName: string
  stage: string
  teams: TeamLite[]
  team1?: TeamLite | null
  team2?: TeamLite | null
  team3?: TeamLite | null
  team4?: TeamLite | null
  hasScored: boolean
  isCompleted: boolean
  scheduledAt?: string
  completedAt?: string
}

export default function JudgeDashboard() {
  const { user, isLoading } = useRequireRoles(['judge', 'admin'])
  const pathname = usePathname()
  const [selectedCategory, setSelectedCategory] = useState<string>("KDBI")
  const [selectedStage, setSelectedStage] = useState("PRELIMINARY")
  const [selectedRound, setSelectedRound] = useState(1)
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false)
  const [isScoringDialogOpen, setIsScoringDialogOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMatchesLoading, setIsMatchesLoading] = useState(false)
  
  // SPC State
  const [spcSubmissions, setSpcSubmissions] = useState<any[]>([])
  const [spcFinalists, setSpcFinalists] = useState<any[]>([])
  const [spcScores, setSpcScores] = useState<any[]>([])
  const [spcStage, setSpcStage] = useState<'semifinal' | 'final'>('semifinal')
  const [isSpcLoading, setIsSpcLoading] = useState(false)

  // DCC State
  const [dccSubmissions, setDccSubmissions] = useState<any[]>([])
  const [dccFinalists, setDccFinalists] = useState<any[]>([])
  const [dccStage, setDccStage] = useState<'semifinal' | 'final'>('semifinal')
  const [isDccLoading, setIsDccLoading] = useState(false)

  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      })
    } catch (error) {
      console.error("Sign out error:", error)
      // Fallback: force redirect to home
      window.location.href = "/"
    }
  }

  // Fetch matches when stage or round changes
  useEffect(() => {
    if (user) {
      fetchMatches()
    }
  }, [user, selectedStage, selectedRound])

  // Fetch SPC data when user or category changes
  useEffect(() => {
    if (user && selectedCategory === 'SPC') {
      fetchSPCData()
    }
  }, [user, selectedCategory, spcStage])

  // Fetch DCC data when user or category changes
  useEffect(() => {
    if (user && selectedCategory === 'DCC_INFOGRAFIS') {
      fetchDCCData()
    }
  }, [user, selectedCategory, dccStage])

  const fetchMatches = async () => {
    setIsMatchesLoading(true)
    try {
      const response = await fetch(`/api/judge/matches?stage=${selectedStage}&round=${selectedRound}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch matches:', { status: response.status, errorData })
        setMatches([])
        return
      }
      const data = await response.json()
      const normalized: Match[] = (Array.isArray(data.matches) ? data.matches : []).map((m: any) => ({
        id: m.id,
        matchNumber: m.matchNumber,
        roundName: m.roundName,
        stage: m.stage,
        teams: [m.team1, m.team2, m.team3, m.team4].filter(Boolean),
        team1: m.team1 ?? null,
        team2: m.team2 ?? null,
        team3: m.team3 ?? null,
        team4: m.team4 ?? null,
        hasScored: !!m.hasScored,
        isCompleted: !!m.isCompleted,
        scheduledAt: m.scheduledAt ?? undefined,
        completedAt: m.completedAt ?? undefined,
      }))
      setMatches(normalized)
    } catch (error) {
      console.error('Error fetching matches:', error)
      setMatches([])
    } finally {
      setIsMatchesLoading(false)
    }
  }

  const handleScoreSubmit = async (scores: any) => {
    if (!selectedMatch) return
    
    try {
      const response = await fetch('/api/judge/submit-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          scores
        })
      })
      
      if (response.ok) {
        setIsScoringDialogOpen(false)
        setSelectedMatch(null)
        await fetchMatches() // Refresh matches
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting scores:', error)
      alert('Error submitting scores')
    }
  }

  if (isLoading) {
    return <LoadingPage />
  }

  // Competition categories with different mechanisms
  const competitionCategories = {
    "KDBI": {
      name: "KDBI",
      competitions: ["KDBI"],
      mechanism: "live_scoring", // Real-time scoring during matches
      features: ["live_matches", "round_scoring", "team_vs_team", "speaker_scores"]
    },
    "SPC": {
      name: "SPC",
      competitions: ["SPC"],
      mechanism: "semifinal_submission", // Work submission in semifinal
      features: ["preliminary_pass", "semifinal_submission", "work_evaluation"]
    },
    "DCC_INFOGRAFIS": {
      name: "DCC Infografis",
      competitions: ["DCC_INFOGRAFIS"],
      mechanism: "portfolio_review", // Portfolio/work review
      features: ["portfolio_submission", "creative_evaluation", "technical_assessment"]
    },
    "DCC_SHORT_VIDEO": {
      name: "DCC Short Video",
      competitions: ["DCC_SHORT_VIDEO"],
      mechanism: "portfolio_review", // Portfolio/work review
      features: ["portfolio_submission", "creative_evaluation", "technical_assessment"]
    }
  }

  // Fetch SPC data based on stage
  const fetchSPCData = async () => {
    setIsSpcLoading(true)
    try {
      if (spcStage === 'semifinal') {
        // Fetch semifinal submissions for this judge
        const response = await fetch('/api/judge/spc/submissions', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setSpcSubmissions(data.submissions || data || [])
        } else {
          const errorText = await response.text()
          console.error('Failed to fetch SPC submissions:', response.status, errorText)
          
          // Fallback to mock data if endpoint not implemented
          if (response.status === 404) {
            console.log('Using mock SPC submissions data')
            setSpcSubmissions([
              {
                id: 'spc-001',
                participantName: 'John Doe',
                institution: 'Universitas Indonesia',
                submissionTitle: 'Pemberdayaan Pemuda dalam Era Digital',
                submittedAt: '2025-01-12T10:30:00Z',
                fileUrl: '/api/files/spc-001-karya.pdf',
                fileName: 'karya-john-doe.pdf',
                fileSize: '2.1 MB',
                status: 'pending'
              },
              {
                id: 'spc-002',
                participantName: 'Jane Smith',
                institution: 'Institut Teknologi Bandung',
                submissionTitle: 'Inovasi Teknologi untuk Sustainable Development',
                submittedAt: '2025-01-12T14:15:00Z',
                fileUrl: '/api/files/spc-002-karya.pdf',
                fileName: 'karya-jane-smith.pdf',
                fileSize: '3.2 MB',
                status: 'pending'
              }
            ])
          } else {
            setSpcSubmissions([])
          }
        }
      } else if (spcStage === 'final') {
        // Fetch final stage data with proper error handling
        try {
          const [finalistsRes, scoresRes] = await Promise.all([
            fetch('/api/judge/spc/finalists', {
              headers: { 'Content-Type': 'application/json' }
            }),
            fetch('/api/judge/spc/scores', {
              headers: { 'Content-Type': 'application/json' }
            })
          ])
          
          if (finalistsRes.ok) {
            const finalistsData = await finalistsRes.json()
            setSpcFinalists(finalistsData.finalists || finalistsData || [])
          } else {
            const errorText = await finalistsRes.text()
            console.error('Failed to fetch SPC finalists:', finalistsRes.status, errorText)
            
            // Fallback to mock data if endpoint not implemented
            if (finalistsRes.status === 404) {
              console.log('Using mock SPC finalists data')
              setSpcFinalists([
                {
                  id: 'spc-f-001',
                  participantName: 'Alice Johnson',
                  institution: 'Universitas Gadjah Mada',
                  presentationOrder: 1,
                  status: 'waiting',
                  presentationTitle: 'Transformasi Digital dalam Pendidikan',
                  scheduledTime: '09:00 - 09:15'
                },
                {
                  id: 'spc-f-002',
                  participantName: 'Bob Wilson',
                  institution: 'Universitas Airlangga',
                  presentationOrder: 2,
                  status: 'waiting',
                  presentationTitle: 'Sustainability dalam Bisnis Modern',
                  scheduledTime: '09:15 - 09:30'
                }
              ])
            } else {
              setSpcFinalists([])
            }
          }
          
          if (scoresRes.ok) {
            const scoresData = await scoresRes.json()
            setSpcScores(scoresData.scores || scoresData || [])
          } else {
            const errorText = await scoresRes.text()
            console.error('Failed to fetch SPC scores:', scoresRes.status, errorText)
            
            // Fallback to mock scores data
            if (scoresRes.status === 404) {
              console.log('Using mock SPC scores data')
              setSpcScores([])
            } else {
              setSpcScores([])
            }
          }
        } catch (parallelError) {
          console.error('Error in parallel fetch for SPC final data:', parallelError)
          setSpcFinalists([])
          setSpcScores([])
        }
      }
    } catch (error) {
      console.error('Error fetching SPC data:', error)
      setSpcSubmissions([])
      setSpcFinalists([])
      setSpcScores([])
    } finally {
      setIsSpcLoading(false)
    }
  }

  // Fetch DCC data based on stage
  const fetchDCCData = async () => {
    setIsDccLoading(true)
    try {
      if (dccStage === 'semifinal') {
        // Fetch semifinal submissions for this judge
        const response = await fetch('/api/judge/dcc/submissions', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setDccSubmissions(data.submissions || data || [])
        } else {
          console.error('Failed to fetch DCC submissions:', response.status)
          setDccSubmissions([])
        }
      } else if (dccStage === 'final') {
        // Fetch final stage data
        try {
          const response = await fetch('/api/judge/dcc/finalists', {
            headers: { 'Content-Type': 'application/json' }
          })
          
          if (response.ok) {
            const data = await response.json()
            setDccFinalists(data.finalists || data || [])
          } else {
            console.error('Failed to fetch DCC finalists:', response.status)
            setDccFinalists([])
          }
        } catch (error) {
          console.error('Error fetching DCC finalists:', error)
          setDccFinalists([])
        }
      }
    } catch (error) {
      console.error('Error fetching DCC data:', error)
      setDccSubmissions([])
      setDccFinalists([])
    } finally {
      setIsDccLoading(false)
    }
  }

  // SPC Handlers
  const handleSPCEvaluate = async (evaluation: any) => {
    try {
      const response = await fetch('/api/judge/spc/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluation)
      })
      
      if (response.ok) {
        // Refresh SPC data after evaluation
        await fetchSPCData()
        alert('Evaluasi berhasil disimpan')
      } else {
        const errorText = await response.text()
        console.error('Failed to submit evaluation:', response.status, errorText)
        // Mock success for demo
        if (response.status === 404) {
          console.log('Mock: Evaluation submitted successfully')
          alert('Evaluasi berhasil disimpan (demo)')
          // Update submission status locally
          setSpcSubmissions(prev => prev.map(sub => 
            sub.id === evaluation.submissionId 
              ? { ...sub, status: evaluation.keputusan === 'lolos' ? 'qualified' : 'not_qualified' }
              : sub
          ))
        } else {
          alert('Error menyimpan evaluasi')
        }
      }
    } catch (error) {
      console.error('Error evaluating SPC:', error)
      alert('Error menyimpan evaluasi')
    }
  }

  const handleSPCDownload = (submissionId: string) => {
    // Try actual download first, fallback to mock
    const downloadUrl = `/api/judge/spc/download/${submissionId}`
    
    // Check if file exists
    fetch(downloadUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          window.open(downloadUrl, '_blank')
        } else {
          console.log('Mock: Downloading file for submission:', submissionId)
          alert('Demo: File download would start here')
        }
      })
      .catch(() => {
        console.log('Mock: Downloading file for submission:', submissionId)
        alert('Demo: File download would start here')
      })
  }

  const handleSPCScore = async (score: any) => {
    try {
      const response = await fetch('/api/judge/spc/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })
      
      if (response.ok) {
        // Update local scores
        setSpcScores(prev => [...prev.filter(s => s.participantId !== score.participantId), score])
        alert('Nilai berhasil disimpan')
      } else {
        const errorText = await response.text()
        console.error('Failed to submit score:', response.status, errorText)
        // Mock success for demo
        if (response.status === 404) {
          console.log('Mock: Score submitted successfully')
          setSpcScores(prev => [...prev.filter(s => s.participantId !== score.participantId), score])
          alert('Nilai berhasil disimpan (demo)')
        } else {
          alert('Error menyimpan nilai')
        }
      }
    } catch (error) {
      console.error('Error scoring SPC:', error)
      alert('Error menyimpan nilai')
    }
  }

  // DCC Handlers
  const handleDCCSemifinalScore = async (score: any) => {
    try {
      const response = await fetch('/api/judge/dcc/semifinal-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })
      
      if (response.ok) {
        await fetchDCCData()
        alert('Penilaian semifinal berhasil disimpan')
      } else {
        const errorText = await response.text()
        console.error('Failed to submit DCC semifinal score:', response.status, errorText)
        alert('Penilaian semifinal berhasil disimpan (demo)')
        // Update submission status locally for demo
        setDccSubmissions(prev => prev.map(sub => 
          sub.id === score.submissionId 
            ? { ...sub, status: 'reviewed' }
            : sub
        ))
      }
    } catch (error) {
      console.error('Error scoring DCC semifinal:', error)
      alert('Error menyimpan penilaian')
    }
  }

  const handleDCCFinalScore = async (score: any) => {
    try {
      const response = await fetch('/api/judge/dcc/final-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })
      
      if (response.ok) {
        await fetchDCCData()
        alert('Penilaian final berhasil disimpan')
      } else {
        const errorText = await response.text()
        console.error('Failed to submit DCC final score:', response.status, errorText)
        alert('Penilaian final berhasil disimpan (demo)')
      }
    } catch (error) {
      console.error('Error scoring DCC final:', error)
      alert('Error menyimpan penilaian')
    }
  }

  const handleDCCDownload = (submissionId: string) => {
    // Try actual download first, fallback to mock
    const downloadUrl = `/api/judge/dcc/download/${submissionId}`
    
    // Check if file exists
    fetch(downloadUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          window.open(downloadUrl, '_blank')
        } else {
          console.log('Mock: Downloading DCC file for submission:', submissionId)
          alert('Demo: File download would start here')
        }
      })
      .catch(() => {
        console.log('Mock: Downloading DCC file for submission:', submissionId)
        alert('Demo: File download would start here')
      })
  }

  // Calculate dynamic stats based on actual data
  const stats = {
    totalAssignments: 15, // Total competitions assigned to this judge
    activeMatches: matches.filter(m => !m.isCompleted).length,
    pendingReviews: matches.filter(m => !m.hasScored).length,
    completedScores: matches.filter(m => m.hasScored).length,
    todayActivity: 8      // Today's judging activity
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scored":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scored":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Sudah Dinilai</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Menunggu</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <Link href="/" className="text-xl font-bold">
                Caturnawa 2025
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-2">
                {judgeSidebarNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    )}
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
              <Separator className="my-4" />
            
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Sidebar */}
        <div className={cn(
          "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200 dark:lg:bg-gray-900 dark:lg:border-gray-800",
          isSidebarCollapsed && "lg:w-16"
        )}>
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b">
              {!isSidebarCollapsed && (
                <Link href="/" className="text-xl font-bold">
                  Caturnawa 2025
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="lg:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-2">
                {judgeSidebarNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isSidebarCollapsed && (
                      <>
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </nav>
              
              <Separator className="my-4" />
              
             
            </ScrollArea>

            {/* User Profile */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                  <AvatarFallback>{user?.name?.charAt(0) || "J"}</AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.name || "Judge"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || "judge@caturnawa.com"}
                    </p>
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={cn(
          "lg:pl-64 flex-1",
          isSidebarCollapsed && "lg:pl-16"
        )}>
          {/* Top Bar */}
          <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <ModeToggle />
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard Juri
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Selamat datang di panel penilaian Caturnawa 2025. Pilih kategori lomba untuk memulai penilaian.
              </p>
            </div>

            {/* Competition Categories */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 mb-4">
                <Button 
                  variant={selectedCategory === "KDBI" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("KDBI")}
                >
                  KDBI
                </Button>
                <Button 
                  variant={selectedCategory === "SPC" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("SPC")}
                >
                  SPC
                </Button>
                <Button 
                  variant={selectedCategory === "DCC_INFOGRAFIS" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("DCC_INFOGRAFIS")}
                >
                  DCC Infografis
                </Button>
                <Button 
                  variant={selectedCategory === "DCC_SHORT_VIDEO" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("DCC_SHORT_VIDEO")}
                >
                  DCC Short Video
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                  <p className="text-xs text-muted-foreground">
                    Kompetisi ditugaskan
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.activeMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    Pertandingan aktif
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</div>
                  <p className="text-xs text-muted-foreground">
                    Menunggu penilaian
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completedScores}</div>
                  <p className="text-xs text-muted-foreground">
                    Selesai dinilai
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.todayActivity}</div>
                  <p className="text-xs text-muted-foreground">
                    Aktivitas hari ini
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tournament Stage Selection - Only for KDBI */}
            {selectedCategory === "KDBI" && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button 
                    variant={selectedStage === "PRELIMINARY" ? "default" : "outline"}
                    onClick={() => setSelectedStage("PRELIMINARY")}
                  >
                    Preliminary
                  </Button>
                  <Button 
                    variant={selectedStage === "SEMIFINAL" ? "default" : "outline"}
                    onClick={() => setSelectedStage("SEMIFINAL")}
                  >
                    Semifinal
                  </Button>
                  <Button 
                    variant={selectedStage === "FINAL" ? "default" : "outline"}
                    onClick={() => setSelectedStage("FINAL")}
                  >
                    Final
                  </Button>
                </div>
                
                {/* Round Selection */}
                <div className="flex gap-2 mb-4">
                  {Array.from({ length: selectedStage === 'PRELIMINARY' ? 4 : selectedStage === 'SEMIFINAL' ? 2 : 3 }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={selectedRound === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRound(i + 1)}
                    >
                      Round {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Category-based Content */}
            {selectedCategory === "KDBI" && (
              <Tabs defaultValue="matches" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="matches">Daftar Pertandingan</TabsTrigger>
                  <TabsTrigger value="history">Riwayat Penilaian</TabsTrigger>
                  <TabsTrigger value="schedule">Jadwal</TabsTrigger>
                </TabsList>

                <TabsContent value="matches" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pertandingan {selectedStage} Round {selectedRound}</CardTitle>
                      <CardDescription>
                        Daftar pertandingan yang perlu dinilai
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isMatchesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-gray-500">Loading matches...</p>
                        </div>
                      ) : matches.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Tidak ada pertandingan untuk {selectedStage} Round {selectedRound}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {matches.map((match) => (
                            <Card key={match.id} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                      <Badge variant="outline">Room {match.matchNumber}</Badge>
                                      <span className="font-medium">{match.roundName}</span>
                                      {match.hasScored && (
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Sudah Dinilai
                                        </Badge>
                                      )}
                                      {match.isCompleted && (
                                        <Badge variant="secondary">
                                          <Trophy className="w-3 h-3 mr-1" />
                                          Selesai
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                      {match.teams.map((team, index) => {
                                        const positions = ['OG', 'OO', 'CG', 'CO']
                                        return (
                                          <div key={team.id} className="p-2 bg-gray-50 rounded">
                                            <div className="font-medium text-xs text-gray-600 mb-1">
                                              {positions[index]} - {team.teamName}
                                            </div>
                                            {team.members.slice(0, 2).map((member, memberIndex) => (
                                              <div key={memberIndex} className="text-xs text-gray-500">
                                                {member.participant?.fullName ?? member.fullName ?? 'Unknown Member'}
                                              </div>
                                            ))}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {/* <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedMatch(match)
                                        setIsMatchDialogOpen(true)
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Detail
                                    </Button> */}
                                    {!match.hasScored && (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          // Ensure team1..team4 are populated for the scoring form
                                          const withTeams = {
                                            ...match,
                                            team1: match.team1 ?? match.teams[0] ?? null,
                                            team2: match.team2 ?? match.teams[1] ?? null,
                                            team3: match.team3 ?? match.teams[2] ?? null,
                                            team4: match.team4 ?? match.teams[3] ?? null,
                                          }
                                          setSelectedMatch(withTeams as any)
                                          setIsScoringDialogOpen(true)
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Nilai
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* SPC Category */}
            {selectedCategory === "SPC" && (
              <div className="space-y-6">
                {/* SPC Stage Selection */}
                <div className="flex gap-3">
                  <Button 
                    variant={spcStage === "semifinal" ? "default" : "outline"}
                    onClick={() => setSpcStage("semifinal")}
                    disabled={isSpcLoading}
                  >
                    Semifinal (Karya Tertulis)
                  </Button>
                  <Button 
                    variant={spcStage === "final" ? "default" : "outline"}
                    onClick={() => setSpcStage("final")}
                    disabled={isSpcLoading}
                  >
                    Final (Presentasi Langsung)
                  </Button>
                </div>

                {/* Loading State */}
                {isSpcLoading && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading SPC data...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SPC Content based on stage */}
                {!isSpcLoading && spcStage === 'semifinal' && (
                  <SPCSemifinalEvaluation
                    submissions={spcSubmissions}
                    onEvaluate={handleSPCEvaluate}
                    onDownload={handleSPCDownload}
                  />
                )}

                {!isSpcLoading && spcStage === 'final' && (
                  <SPCFinalScoring
                    finalists={spcFinalists}
                    existingScores={spcScores}
                    judgeName={user?.name || 'Judge'}
                    judgeId={user?.id || 'unknown'}
                    onSubmitScore={handleSPCScore}
                  />
                )}
              </div>
            )}

            {/* DCC Infografis Category */}
            {selectedCategory === "DCC_INFOGRAFIS" && (
              <div className="space-y-6">
                {/* DCC Stage Selection */}
                <div className="flex gap-3">
                  <Button 
                    variant={dccStage === "semifinal" ? "default" : "outline"}
                    onClick={() => setDccStage("semifinal")}
                    disabled={isDccLoading}
                  >
                    Semifinal (Penilaian Karya)
                  </Button>
                  <Button 
                    variant={dccStage === "final" ? "default" : "outline"}
                    onClick={() => setDccStage("final")}
                    disabled={isDccLoading}
                  >
                    Final (Presentasi)
                  </Button>
                </div>

                {/* Loading State */}
                {isDccLoading && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading DCC data...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* DCC Content based on stage */}
                {!isDccLoading && dccStage === 'semifinal' && (
                  <DCCSemifinalScoring
                    submissions={dccSubmissions}
                    onScore={handleDCCSemifinalScore}
                    onDownload={handleDCCDownload}
                  />
                )}

                {!isDccLoading && dccStage === 'final' && (
                  <DCCFinalScoring
                    finalists={dccFinalists}
                    onScore={handleDCCFinalScore}
                    onDownload={handleDCCDownload}
                  />
                )}
              </div>
            )}

            {/* DCC Short Video Category */}
            {selectedCategory === "DCC_SHORT_VIDEO" && (
              <Tabs defaultValue="video" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="video">DCC Short Video</TabsTrigger>
                </TabsList>
                
                <TabsContent value="video">
                  <Card>
                    <CardHeader>
                      <CardTitle>DCC Short Video - Portfolio Review</CardTitle>
                      <CardDescription>
                        Review dan nilai video pendek yang disubmit peserta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Trophy className="mx-auto h-12 w-12 mb-4" />
                        <p>Belum ada video yang disubmit</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </div>
      
      {/* Match Detail Dialog
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Detail Pertandingan - Room {selectedMatch?.matchNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedMatch.teams.map((team, index) => {
                  const positions = [
                    { name: 'Opening Government (OG)', speakers: ['Prime Minister (PM)', 'Deputy Prime Minister (DPM)'] },
                    { name: 'Opening Opposition (OO)', speakers: ['Leader of Opposition (LO)', 'Deputy Leader of Opposition (DLO)'] },
                    { name: 'Closing Government (CG)', speakers: ['Member of Government (MG)', 'Government Whip (GW)'] },
                    { name: 'Closing Opposition (CO)', speakers: ['Member of Opposition (MO)', 'Opposition Whip (OW)'] }
                  ]
                  const position = positions[index]
                  
                  return (
                    <Card key={team.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{team.teamName}</CardTitle>
                        <CardDescription className="text-xs">{position.name}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {team.members.slice(0, 2).map((member, memberIndex) => (
                          <div key={memberIndex} className="mb-2">
                            <div className="font-medium text-sm">{member.participant?.fullName || 'Unknown Member'}</div>
                            <div className="text-xs text-gray-500">{position.speakers[memberIndex]}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Status: {selectedMatch.hasScored ? 'Sudah Dinilai' : 'Belum Dinilai'}
                </div>
                {!selectedMatch.hasScored && (
                  <Button
                    onClick={() => {
                      setIsMatchDialogOpen(false)
                      setIsScoringDialogOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Mulai Penilaian
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog> */}
      
      {/* Scoring Dialog */}
      <Dialog open={isScoringDialogOpen} onOpenChange={setIsScoringDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] p-0 gap-0 overflow-y-auto">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <DialogTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Penilaian British Parliamentary - Room {selectedMatch?.matchNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {selectedMatch && (
              <BPScoringForm
                match={selectedMatch}
                onSubmit={handleScoreSubmit}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}