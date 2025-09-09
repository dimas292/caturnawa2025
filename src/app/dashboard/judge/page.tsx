// src/app/dashboard/judge/page.tsx
"use client"

import { useState } from "react"
import { useRequireRole } from "@/hooks/use-auth"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import React, { useEffect } from "react"
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
  LayoutDashboard,
  History,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  BarChart3,
  UserCog,
  Eye,
  Edit,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Mail,
  Activity,
  Award,
  Star,
  ClipboardList,
  CheckSquare,
  XSquare,
  MinusSquare
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
    title: "Penilaian",
    href: "/dashboard/judge/scoring",
    icon: CheckSquare,
    badge: null
  },
  {
    title: "Peserta",
    href: "/dashboard/judge/participants",
    icon: Users,
    badge: null
  },
  {
    title: "Berkas",
    href: "/dashboard/judge/documents",
    icon: FileText,
    badge: null
  },
  {
    title: "Hasil",
    href: "/dashboard/judge/results",
    icon: Award,
    badge: null
  },
  {
    title: "Timeline",
    href: "/dashboard/judge/timeline",
    icon: Calendar,
    badge: null
  }
]

const judgeSecondaryItems = [
  {
    title: "Riwayat Penilaian",
    href: "/dashboard/judge/history",
    icon: History
  },
  {
    title: "Pengaturan",
    href: "/dashboard/judge/settings",
    icon: Settings
  }
]

export default function JudgeDashboard() {
  const { user, isLoading } = useRequireRole("judge")
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  if (isLoading) {
    return <LoadingPage />
  }

  // Competition categories with different mechanisms
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [competitionsData, setCompetitionsData] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [debateParticipants, setDebateParticipants] = useState<any[]>([])
  const [debateMatches, setDebateMatches] = useState<any[]>([])
  const [debateStats, setDebateStats] = useState<any>({})
  const [isLoadingDebateData, setIsLoadingDebateData] = useState(false)

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

  // Competition categories and their mechanisms
  const competitionCategories = {
    "DEBATE": {
      name: "Debate Competitions",
      competitions: ["KDBI", "EDC"],
      mechanism: "live_scoring", // Real-time scoring during matches
      features: ["live_matches", "round_scoring", "team_vs_team", "speaker_scores"]
    },
    "ACADEMIC": {
      name: "Academic Competition", 
      competitions: ["SPC"],
      mechanism: "semifinal_submission", // Work submission in semifinal
      features: ["preliminary_pass", "semifinal_submission", "work_evaluation"]
    },
    "CREATIVE": {
      name: "Creative Competitions",
      competitions: ["DCC_INFOGRAFIS", "DCC_SHORT_VIDEO"], 
      mechanism: "portfolio_review", // Portfolio/work review
      features: ["portfolio_submission", "creative_evaluation", "technical_assessment"]
    }
  }

  // Load debate data when category is selected
  useEffect(() => {
    if (selectedCategory === "DEBATE" || selectedCategory === "ALL") {
      loadDebateData()
    }
  }, [selectedCategory])

  const loadDebateData = async () => {
    setIsLoadingDebateData(true)
    try {
      // Fetch participants
      const participantsResponse = await fetch('/api/judge/debate-participants')
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json()
        setDebateParticipants(participantsData.data.participants || [])
        setDebateStats(participantsData.data.stats || {})
      }

      // Fetch matches
      const matchesResponse = await fetch('/api/judge/debate-matches')
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json()
        setDebateMatches(matchesData.data.matches || [])
      }
    } catch (error) {
      console.error('Error loading debate data:', error)
    } finally {
      setIsLoadingDebateData(false)
    }
  }

  // Calculate dynamic stats based on actual data
  const stats = {
    totalAssignments: 15, // Total competitions assigned to this judge
    activeMatches: debateMatches.filter(m => m.isLive).length,
    pendingReviews: debateMatches.filter(m => m.needsScoring).length,
    completedScores: debateMatches.filter(m => m.status === 'completed').length,
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
              <nav className="space-y-2">
                {judgeSecondaryItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>
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
              
              <nav className="space-y-2">
                {judgeSecondaryItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  >
                    <item.icon className="h-4 w-4" />
                    {!isSidebarCollapsed && <span>{item.title}</span>}
                  </Link>
                ))}
              </nav>
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
                Dashboard Judge
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Selamat datang di panel penilaian Caturnawa 2025. Pilih kategori lomba untuk memulai penilaian.
              </p>
            </div>

            {/* Competition Categories */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 mb-4">
                <Button 
                  variant={selectedCategory === "ALL" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("ALL")}
                >
                  Semua Kategori
                </Button>
                {Object.entries(competitionCategories).map(([key, category]) => (
                  <Button 
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    onClick={() => setSelectedCategory(key)}
                  >
                    {category.name}
                  </Button>
                ))}
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

            {/* Category-based Content */}
            {selectedCategory === "ALL" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(competitionCategories).map(([key, category]) => (
                  <Card key={key} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedCategory(key)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {key === "DEBATE" && <Users className="h-5 w-5" />}
                        {key === "ACADEMIC" && <FileText className="h-5 w-5" />}
                        {key === "CREATIVE" && <Trophy className="h-5 w-5" />}
                        {category.name}
                      </CardTitle>
                      <CardDescription>
                        Mekanisme: {category.mechanism.replace('_', ' ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>Kompetisi:</strong> {category.competitions.join(", ")}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {category.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Kelola Penilaian →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Debate Category */}
            {selectedCategory === "DEBATE" && (
              <Tabs defaultValue="live-matches" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="live-matches">Live Matches</TabsTrigger>
                  <TabsTrigger value="rounds">Rounds</TabsTrigger>
                  <TabsTrigger value="scores">Scores</TabsTrigger>
                </TabsList>
                
                <TabsContent value="live-matches">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🔴 Live Debate Matches 
                        <Badge variant="destructive">{debateMatches.filter(m => m.isLive).length}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Pertandingan debate yang sedang berlangsung - beri nilai real-time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDebateData ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading matches...</span>
                        </div>
                      ) : debateMatches.filter(m => m.isLive).length > 0 ? (
                        <div className="space-y-4">
                          {debateMatches.filter(m => m.isLive).map((match) => (
                            <div key={match.id} className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-medium">{match.round.competition.name} - {match.round.roundName}</h4>
                                  <p className="text-sm text-gray-500">Match #{match.matchNumber}</p>
                                </div>
                                <Badge variant="destructive">LIVE</Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 border rounded bg-white dark:bg-gray-800">
                                  <h5 className="font-medium">{match.team1?.teamName}</h5>
                                  <p className="text-sm text-gray-500">{match.team1?.leader.fullName}</p>
                                  <p className="text-xs">{match.team1?.members.length} members</p>
                                </div>
                                <div className="text-center p-3 border rounded bg-white dark:bg-gray-800">
                                  <h5 className="font-medium">{match.team2?.teamName}</h5>
                                  <p className="text-sm text-gray-500">{match.team2?.leader.fullName}</p>
                                  <p className="text-xs">{match.team2?.members.length} members</p>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="text-sm">
                                  Scoring: {match.scoringProgress.completed}/{match.scoringProgress.total} 
                                  ({match.scoringProgress.percentage}%)
                                </div>
                                <Link href={`/dashboard/judge/score/${match.id}`}>
                                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Score Match
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="mx-auto h-12 w-12 mb-4" />
                          <p>Tidak ada pertandingan live saat ini</p>
                          <p className="text-sm">Pertandingan akan muncul saat dimulai oleh admin</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="rounds">
                  <Card>
                    <CardHeader>
                      <CardTitle>Debate Rounds</CardTitle>
                      <CardDescription>Kelola babak preliminary, semifinal, dan final</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDebateData ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading rounds...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {["PRELIMINARY", "SEMIFINAL", "FINAL"].map((stage) => {
                            const stageMatches = debateMatches.filter(m => m.round.stage === stage)
                            const completedMatches = stageMatches.filter(m => m.status === 'completed').length
                            const pendingMatches = stageMatches.filter(m => m.needsScoring).length
                            
                            return (
                              <div key={stage} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                  <div>
                                    <h4 className="font-medium">{stage.charAt(0) + stage.slice(1).toLowerCase()} Round</h4>
                                    <p className="text-sm text-gray-500">
                                      {completedMatches}/{stageMatches.length} matches completed
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {pendingMatches > 0 && (
                                      <Badge variant="secondary">
                                        {pendingMatches} need scoring
                                      </Badge>
                                    )}
                                    <Button variant="outline" size="sm">
                                      Lihat Detail ({stageMatches.length})
                                    </Button>
                                  </div>
                                </div>
                                
                                {stageMatches.length > 0 && (
                                  <div className="mt-3">
                                    <div className="flex justify-between text-sm mb-2">
                                      <span>Progress</span>
                                      <span>{Math.round((completedMatches / stageMatches.length) * 100)}%</span>
                                    </div>
                                    <Progress value={(completedMatches / stageMatches.length) * 100} className="h-2" />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="scores">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Speaker Scores
                        <Badge variant="outline">{debateParticipants.length} teams</Badge>
                      </CardTitle>
                      <CardDescription>Nilai individu untuk setiap speaker dan tim</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDebateData ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading participants...</span>
                        </div>
                      ) : debateParticipants.length > 0 ? (
                        <div className="space-y-6">
                          {/* Filter buttons */}
                          <div className="flex gap-2 mb-4">
                            <Button variant="outline" size="sm">
                              All Teams ({debateParticipants.length})
                            </Button>
                            <Button variant="outline" size="sm">
                              KDBI ({debateParticipants.filter(p => p.competition.type === 'KDBI').length})
                            </Button>
                            <Button variant="outline" size="sm">
                              EDC ({debateParticipants.filter(p => p.competition.type === 'EDC').length})
                            </Button>
                            <Button variant="outline" size="sm">
                              Needs Scoring ({debateParticipants.filter(p => p.hasUnscoredMatches).length})
                            </Button>
                          </div>

                          <div className="grid gap-4">
                            {debateParticipants.slice(0, 10).map((team) => (
                              <div key={team.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium">{team.teamName}</h4>
                                    <p className="text-sm text-gray-500">
                                      {team.competition.name} • Leader: {team.leader.fullName}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-semibold">
                                      {team.averageTeamScore.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Avg Score
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div className="text-sm">
                                    <span className="font-medium">Matches:</span> {team.matchesPlayed}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">W/L:</span> {team.wins}/{team.losses}
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {team.teamMembers.map((member: any, idx: number) => (
                                    <div key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                      {member.fullName}: {member.averageScore.toFixed(1)}
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className="flex gap-1">
                                    {team.fullyScored && (
                                      <Badge variant="default" className="text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Fully Scored
                                      </Badge>
                                    )}
                                    {team.hasUnscoredMatches && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Needs Scoring
                                      </Badge>
                                    )}
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {debateParticipants.length > 10 && (
                            <div className="text-center">
                              <Button variant="outline">
                                Show All {debateParticipants.length} Teams
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="mx-auto h-12 w-12 mb-4" />
                          <p>Belum ada tim debate yang terdaftar</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Academic Category (SPC) */}
            {selectedCategory === "ACADEMIC" && (
              <Tabs defaultValue="preliminary" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="preliminary">Preliminary</TabsTrigger>
                  <TabsTrigger value="semifinal">Semifinal Submission</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preliminary">
                  <Card>
                    <CardHeader>
                      <CardTitle>SPC - Preliminary Stage</CardTitle>
                      <CardDescription>
                        Review registrations and determine who advances to semifinal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Users className="mx-auto h-12 w-12 mb-4" />
                        <p>Preliminary review akan dimulai setelah registration ditutup</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="semifinal">
                  <Card>
                    <CardHeader>
                      <CardTitle>SPC - Semifinal Work Submissions</CardTitle>
                      <CardDescription>
                        Review dan nilai karya yang disubmit peserta di tahap semifinal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="mx-auto h-12 w-12 mb-4" />
                        <p>Belum ada submission yang masuk</p>
                        <p className="text-sm">Karya akan muncul setelah deadline submission</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Creative Category */}
            {selectedCategory === "CREATIVE" && (
              <Tabs defaultValue="infografis" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="infografis">DCC Infografis</TabsTrigger>
                  <TabsTrigger value="video">DCC Short Video</TabsTrigger>
                </TabsList>
                
                <TabsContent value="infografis">
                  <Card>
                    <CardHeader>
                      <CardTitle>DCC Infografis - Portfolio Review</CardTitle>
                      <CardDescription>
                        Review dan nilai karya infografis yang disubmit peserta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Trophy className="mx-auto h-12 w-12 mb-4" />
                        <p>Belum ada karya infografis yang disubmit</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

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
    </div>
  )
}