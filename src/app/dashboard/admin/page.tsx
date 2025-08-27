// src/app/admin/dashboard/page.tsx
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
  UserPlus,
  FileCheck,
  DollarSign,
  BarChart3,
  UserCog,
  FolderOpen,
  Download,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Mail,
  Activity,
  Database,
  Megaphone,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock3
} from "lucide-react"

// Sidebar Navigation Items for Admin
const adminSidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "Peserta",
    href: "/admin/participants",
    icon: Users,
    badge: "127"
  },
  {
    title: "Verifikasi",
    href: "/admin/verification",
    icon: FileCheck,
    badge: "12"
  },
  {
    title: "Pembayaran",
    href: "/admin/payments",
    icon: DollarSign,
    badge: "8"
  },
  {
    title: "Kompetisi",
    href: "/admin/competitions",
    icon: Trophy,
    badge: null
  },
  {
    title: "Berkas",
    href: "/admin/documents",
    icon: FolderOpen,
    badge: null
  },
  {
    title: "Laporan",
    href: "/admin/reports",
    icon: FileSpreadsheet,
    badge: null
  },
  {
    title: "Pengumuman",
    href: "/admin/announcements",
    icon: Megaphone,
    badge: null
  },
]

const adminSecondaryItems = [
  {
    title: "Statistik",
    href: "/admin/statistics",
    icon: BarChart3
  },
  {
    title: "Database",
    href: "/admin/database",
    icon: Database
  },
  {
    title: "Email Blast",
    href: "/admin/email",
    icon: Mail
  },
  {
    title: "Activity Log",
    href: "/admin/logs",
    icon: Activity
  },
  {
    title: "Pengaturan",
    href: "/admin/settings",
    icon: Settings
  }
]

export default function AdminDashboard() {
  const { user, isLoading } = useRequireRole("admin")
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  if (isLoading) {
    return <LoadingPage />
  }

  // Mock data for admin dashboard
  const stats = {
    totalParticipants: 127,
    verified: 85,
    pending: 34,
    rejected: 8,
    totalRevenue: "Rp 19.050.000",
    todayRegistrations: 12,
    weeklyGrowth: 23.5
  }

  const recentRegistrations = [
    { 
      id: 1, 
      name: "Ahmad Rizki", 
      email: "ahmad.rizki@email.com", 
      competition: "KDBI", 
      status: "pending",
      date: "2025-08-27",
      payment: "uploaded"
    },
    { 
      id: 2, 
      name: "Siti Nurhaliza", 
      email: "siti.n@email.com", 
      competition: "EDC", 
      status: "verified",
      date: "2025-08-27",
      payment: "verified"
    },
    { 
      id: 3, 
      name: "Budi Santoso", 
      email: "budi.s@email.com", 
      competition: "SPC", 
      status: "pending",
      date: "2025-08-26",
      payment: "pending"
    },
    { 
      id: 4, 
      name: "Maya Putri", 
      email: "maya.p@email.com", 
      competition: "DCC Infografis", 
      status: "rejected",
      date: "2025-08-26",
      payment: "rejected"
    },
  ]

  const competitionStats = [
    { name: "KDBI", participants: 45, revenue: "Rp 6.750.000", capacity: 60 },
    { name: "EDC", participants: 38, revenue: "Rp 5.700.000", capacity: 60 },
    { name: "SPC", participants: 30, revenue: "Rp 3.450.000", capacity: 40 },
    { name: "DCC Infografis", participants: 8, revenue: "Rp 400.000", capacity: 30 },
    { name: "DCC Short Video", participants: 6, revenue: "Rp 300.000", capacity: 30 },
  ]

  // Sidebar Component
  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="flAex h-16 items-center px-6 border-b">
        <Link href="/admin" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          {!isSidebarCollapsed && (
            <span className="font-bold text-lg">Admin Panel</span>
          )}
        </Link>
      </div>

      {/* User Info */}
      <div className={cn(
        "px-3 py-4 border-b",
        isSidebarCollapsed ? "px-2" : ""
      )}>
        <div className={cn(
          "flex items-center space-x-3",
          isSidebarCollapsed ? "justify-center" : ""
        )}>
          <Avatar className={cn(
            "transition-all",
            isSidebarCollapsed ? "h-8 w-8" : "h-10 w-10"
          )}>
            <AvatarImage src="/avatars/admin.png" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {adminSidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && "bg-accent text-accent-foreground",
                isSidebarCollapsed && "justify-center"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn(
                  "h-4 w-4",
                  isSidebarCollapsed && "h-5 w-5"
                )} />
                {!isSidebarCollapsed && (
                  <span>{item.title}</span>
                )}
              </div>
              {!isSidebarCollapsed && item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Secondary Navigation */}
        <div className="space-y-1 py-4">
          {!isSidebarCollapsed && (
            <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tools & Analytics
            </h4>
          )}
          {adminSecondaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && "bg-accent text-accent-foreground",
                isSidebarCollapsed && "justify-center"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4",
                isSidebarCollapsed ? "h-5 w-5" : "mr-3"
              )} />
              {!isSidebarCollapsed && (
                <span>{item.title}</span>
              )}
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950",
            isSidebarCollapsed && "justify-center"
          )}
        >
          <LogOut className={cn(
            "h-4 w-4",
            !isSidebarCollapsed && "mr-2"
          )} />
          {!isSidebarCollapsed && "Keluar"}
        </Button>
      </div>
    </>
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Terverifikasi</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Menunggu</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPaymentBadge = (payment: string) => {
    switch (payment) {
      case "verified":
        return <Badge variant="default">Lunas</Badge>
      case "uploaded":
        return <Badge variant="secondary">Perlu Verifikasi</Badge>
      case "pending":
        return <Badge variant="outline">Belum Bayar</Badge>
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex md:flex-col bg-background border-r transition-all duration-300",
        isSidebarCollapsed ? "md:w-16" : "md:w-64"
      )}>
        <SidebarContent />
        
        {/* Collapse Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-20 z-10 h-8 w-8 rounded-full border bg-background shadow-md"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4 gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Cari peserta, kompetisi..."
                  className="h-9 w-full rounded-md border bg-transparent pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="ml-auto flex items-center space-x-2">
              {/* Refresh Button */}
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-5 w-5" />
              </Button>

              {/* Notification Bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Pendaftaran Baru</p>
                      <p className="text-xs text-muted-foreground">Ahmad Rizki mendaftar KDBI</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Pembayaran Diterima</p>
                      <p className="text-xs text-muted-foreground">3 pembayaran menunggu verifikasi</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center">
                    <Link href="/admin/notifications" className="text-sm">
                      Lihat semua notifikasi
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ModeToggle />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/admin.png" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Admin</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Pengaturan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                Dashboard Administrator
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Selamat datang, {user?.name}! Kelola seluruh kompetisi Caturnawa 2025.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Peserta</p>
                      <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+{stats.weeklyGrowth}%</span>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Terverifikasi</p>
                      <p className="text-2xl font-bold">{stats.verified}</p>
                      <Progress value={66} className="h-1 mt-2" />
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Menunggu</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                      <Badge variant="secondary" className="mt-1">Perlu Tindakan</Badge>
                    </div>
                    <Clock3 className="h-8 w-8 text-yellow-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                      <p className="text-lg font-bold">{stats.totalRevenue}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">Hari ini: +12</span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Registrations - Takes 2 columns */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Pendaftaran Terbaru</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-1" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Kompetisi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Pembayaran</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentRegistrations.map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{reg.name}</div>
                                <div className="text-xs text-muted-foreground">{reg.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{reg.competition}</TableCell>
                            <TableCell>{getStatusBadge(reg.status)}</TableCell>
                            <TableCell>{getPaymentBadge(reg.payment)}</TableCell>
                            <TableCell className="text-muted-foreground">{reg.date}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileCheck className="mr-2 h-4 w-4" />
                                    Verifikasi
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4">
                      <Link href="/admin/participants">
                        <Button variant="outline" size="sm" className="w-full">
                          Lihat Semua Peserta
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Competition Statistics */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Statistik per Kompetisi</CardTitle>
                    <CardDescription>
                      Overview peserta dan pendapatan per kategori lomba
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {competitionStats.map((comp, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{comp.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {comp.participants}/{comp.capacity} peserta
                            </span>
                          </div>
                          <Progress 
                            value={(comp.participants / comp.capacity) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{comp.revenue}</span>
                            <span>{Math.round((comp.participants / comp.capacity) * 100)}% kapasitas</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar Content */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Tambah Peserta Manual
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Verifikasi Pembayaran
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Megaphone className="mr-2 h-4 w-4" />
                      Buat Pengumuman
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Kirim Email Blast
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>

                {/* Alerts & Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                      Perlu Perhatian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Clock3 className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">34 Verifikasi Menunggu</p>
                          <p className="text-xs text-muted-foreground">Perlu diverifikasi dalam 24 jam</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">8 Pembayaran Ditolak</p>
                          <p className="text-xs text-muted-foreground">Perlu follow up dengan peserta</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">12 Berkas Belum Lengkap</p>
                          <p className="text-xs text-muted-foreground">Menunggu upload dokumen</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2 h-5 w-5" />
                      Status Sistem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm">Server</span>
                        </div>
                        <span className="text-xs text-green-600">Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm">Database</span>
                        </div>
                        <span className="text-xs text-green-600">Operational</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm">Payment Gateway</span>
                        </div>
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                      <Separator />
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground">Last backup: 2 hours ago</p>
                        <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="mr-2 h-5 w-5" />
                      Aktivitas Terbaru
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                          <div className="flex-1">
                            <p className="font-medium">Pendaftaran Baru</p>
                            <p className="text-xs text-muted-foreground">Ahmad Rizki - KDBI</p>
                            <p className="text-xs text-muted-foreground">5 menit yang lalu</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                          <div className="flex-1">
                            <p className="font-medium">Pembayaran Terverifikasi</p>
                            <p className="text-xs text-muted-foreground">Siti Nurhaliza - EDC</p>
                            <p className="text-xs text-muted-foreground">15 menit yang lalu</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5" />
                          <div className="flex-1">
                            <p className="font-medium">Dokumen Diupload</p>
                            <p className="text-xs text-muted-foreground">Budi Santoso - SPC</p>
                            <p className="text-xs text-muted-foreground">30 menit yang lalu</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5" />
                          <div className="flex-1">
                            <p className="font-medium">Pembayaran Ditolak</p>
                            <p className="text-xs text-muted-foreground">Maya Putri - DCC</p>
                            <p className="text-xs text-muted-foreground">1 jam yang lalu</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5" />
                          <div className="flex-1">
                            <p className="font-medium">Email Blast Terkirim</p>
                            <p className="text-xs text-muted-foreground">127 penerima</p>
                            <p className="text-xs text-muted-foreground">2 jam yang lalu</p>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tabs for Additional Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
                    <TabsTrigger value="participants">Peserta</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Conversion Rate</p>
                        <p className="text-2xl font-bold">67%</p>
                        <Progress value={67} className="h-2" />
                        <p className="text-xs text-muted-foreground">Dari visitor ke registrasi</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Payment Success Rate</p>
                        <p className="text-2xl font-bold">89%</p>
                        <Progress value={89} className="h-2" />
                        <p className="text-xs text-muted-foreground">Pembayaran berhasil</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Document Completion</p>
                        <p className="text-2xl font-bold">75%</p>
                        <Progress value={75} className="h-2" />
                        <p className="text-xs text-muted-foreground">Kelengkapan berkas</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="revenue" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Target Pendapatan</span>
                        <span className="text-sm text-muted-foreground">Rp 50.000.000</span>
                      </div>
                      <Progress value={38} className="h-3" />
                      <div className="flex justify-between text-xs">
                        <span>Tercapai: Rp 19.050.000</span>
                        <span>38% dari target</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">Breakdown per Phase:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Early Bird</span>
                          <span>Rp 8.500.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phase 1</span>
                          <span>Rp 7.250.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phase 2</span>
                          <span>Rp 3.300.000</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="participants" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="font-medium">Demographics</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SMA</span>
                            <span>78 peserta</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SMK</span>
                            <span>49 peserta</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">Wilayah</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Jakarta</span>
                            <span>45 peserta</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Luar Jakarta</span>
                            <span>82 peserta</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="timeline" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Early Bird Phase</p>
                          <p className="text-xs text-muted-foreground">25-31 Agustus 2025 (Completed)</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Phase 1 Registration</p>
                          <p className="text-xs text-muted-foreground">1-13 September 2025 (Ongoing)</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Phase 2 Registration</p>
                          <p className="text-xs text-muted-foreground">14-26 September 2025 (Upcoming)</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}