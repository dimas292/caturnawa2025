// src/app/dashboard/judge/page.tsx
"use client"

import { useState } from "react"
import { useRequireRole } from "@/hooks/use-auth"
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
    badge: "15"
  },
  {
    title: "Peserta",
    href: "/dashboard/judge/participants",
    icon: Users,
    badge: "127"
  },
  {
    title: "Berkas",
    href: "/dashboard/judge/documents",
    icon: FileText,
    badge: "89"
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

  // Mock data for judge dashboard
  const stats = {
    totalParticipants: 127,
    scored: 89,
    pending: 38,
    averageScore: 8.7,
    totalFiles: 156,
    todayScoring: 12
  }

  const recentScoring = [
    { 
      id: 1, 
      participantName: "Ahmad Rizki", 
      competition: "KDBI", 
      score: 8.5,
      status: "scored",
      date: "2025-08-27",
      fileType: "Debate Script"
    },
    { 
      id: 2, 
      participantName: "Siti Nurhaliza", 
      competition: "EDC", 
      score: 9.2,
      status: "scored",
      date: "2025-08-27",
      fileType: "Video Recording"
    },
    { 
      id: 3, 
      participantName: "Budi Santoso", 
      competition: "SPC", 
      score: null,
      status: "pending",
      date: "2025-08-27",
      fileType: "Research Paper"
    }
  ]

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
                    <DropdownMenuItem>
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
                Selamat datang di panel penilaian Caturnawa 2025
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                  <p className="text-xs text-muted-foreground">
                    Semua kompetisi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sudah Dinilai</CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.scored}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.scored / stats.totalParticipants) * 100)}% selesai
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageScore}</div>
                  <p className="text-xs text-muted-foreground">
                    Dari 10 skala
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayScoring}</div>
                  <p className="text-xs text-muted-foreground">
                    Peserta dinilai
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Scoring Table */}
            <Card>
              <CardHeader>
                <CardTitle>Penilaian Terbaru</CardTitle>
                <CardDescription>
                  Daftar peserta yang baru saja dinilai atau menunggu penilaian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peserta</TableHead>
                      <TableHead>Kompetisi</TableHead>
                      <TableHead>Jenis Berkas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Nilai</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentScoring.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.participantName}</TableCell>
                        <TableCell>{item.competition}</TableCell>
                        <TableCell>{item.fileType}</TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell>
                          {item.score ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {item.score}/10
                            </Badge>
                          ) : (
                            <Badge variant="outline">-</Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {item.status === "pending" && (
                              <Button size="sm">
                                <CheckSquare className="h-4 w-4" />
                                Nilai
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Penilaian</CardTitle>
                  <CardDescription>
                    Status penilaian berdasarkan kompetisi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>KDBI</span>
                        <span>45/50</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>EDC</span>
                        <span>32/40</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>SPC</span>
                        <span>12/37</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline Penilaian</CardTitle>
                  <CardDescription>
                    Jadwal dan deadline penilaian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Early Bird Phase</p>
                        <p className="text-xs text-muted-foreground">25-31 Agustus 2025 (Selesai)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Phase 1</p>
                        <p className="text-xs text-muted-foreground">1-13 September 2025 (Berlangsung)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Phase 2</p>
                        <p className="text-xs text-muted-foreground">14-26 September 2025 (Mendatang)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}