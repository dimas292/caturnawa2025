// src/app/dashboard/page.tsx
"use client"

import { useState } from "react"
import { useRequireRole } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingPage } from "@/components/ui/loading"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  XCircle,
  Calendar,
  Settings,
  LogOut,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Award,
  Sparkles,
  Menu,
  LayoutDashboard,
  ClipboardList,
  Upload,
  History,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  DollarSign
} from "lucide-react"

// Component untuk ListItem di Navigation Menu
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

// Sidebar Navigation Items
const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "Pendaftaran",
    href: "/register",
    icon: ClipboardList,
    badge: null
  },
  {
    title: "Upload Berkas",
    href: "/upload",
    icon: Upload,
    badge: "Penting"
  },
  {
    title: "Pembayaran",
    href: "/payment",
    icon: DollarSign,
    badge: null
  },
  {
    title: "Status Verifikasi",
    href: "/verification",
    icon: FileCheck,
    badge: null
  },
  {
    title: "Riwayat",
    href: "/history",
    icon: History,
    badge: null
  },
]

const sidebarSecondaryItems = [
  {
    title: "Panduan",
    href: "/guide",
    icon: BookOpen
  },
  {
    title: "FAQ",
    href: "/faq",
    icon: HelpCircle
  },
  {
    title: "Hubungi Panitia",
    href: "/contact",
    icon: MessageSquare
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings
  }
]

export default function ParticipantDashboard() {
  const { user, isLoading } = useRequireRole("participant")
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  if (isLoading) {
    return <LoadingPage />
  }

  // Mock data - nanti akan diganti dengan real data
  const registrationStatus = "not_registered" // not_registered, pending_payment, payment_uploaded, verified, rejected
  const competitions = [
    { name: "KDBI", price: "Rp 150.000", deadline: "31 Agustus 2025", registered: false },
    { name: "EDC", price: "Rp 150.000", deadline: "31 Agustus 2025", registered: false },
    { name: "SPC", price: "Rp 115.000", deadline: "31 Agustus 2025", registered: false },
    { name: "DCC Infografis", price: "Rp 50.000", deadline: "31 Agustus 2025", registered: false },
    { name: "DCC Short Video", price: "Rp 50.000", deadline: "31 Agustus 2025", registered: false },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending_payment":
      case "payment_uploaded":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "verified":
        return "Terverifikasi"
      case "pending_payment":
        return "Menunggu Pembayaran"
      case "payment_uploaded":
        return "Menunggu Verifikasi"
      case "rejected":
        return "Ditolak"
      default:
        return "Belum Daftar"
    }
  }

  // Sidebar Component
  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {!isSidebarCollapsed && (
            <span className="font-bold text-lg">CATURNAWA</span>
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
            <AvatarImage src="/avatars/01.png" alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground">Peserta</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {sidebarNavItems.map((item) => (
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
                <span className="ml-auto flex h-5 items-center rounded-full bg-primary px-2 text-[10px] font-medium text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Secondary Navigation */}
        <div className="space-y-1 py-4">
          {!isSidebarCollapsed && (
            <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bantuan
            </h4>
          )}
          {sidebarSecondaryItems.map((item) => (
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

            {/* Right Section */}
            <div className="ml-auto flex items-center space-x-2">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
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
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Pengaturan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Bantuan</span>
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
                Dashboard Peserta
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Selamat datang kembali, {user?.name}! Kelola pendaftaran lomba Anda di sini.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Lomba</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <Trophy className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Menunggu</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="text-lg font-bold">31 Ags</p>
                    </div>
                    <Calendar className="h-8 w-8 text-red-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Aksi Cepat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link href="/register">
                        <Button className="w-full h-20 text-left justify-start">
                          <div>
                            <div className="font-medium">Daftar Lomba</div>
                            <div className="text-sm opacity-80">Pilih kategori lomba</div>
                          </div>
                        </Button>
                      </Link>
                      
                      <Link href="/profile">
                        <Button variant="outline" className="w-full h-20 text-left justify-start">
                          <div>
                            <div className="font-medium">Update Profile</div>
                            <div className="text-sm opacity-80">Kelola data pribadi</div>
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Registration Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Status Pendaftaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(registrationStatus)}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {getStatusText(registrationStatus)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {registrationStatus === "not_registered" 
                              ? "Belum mendaftar kompetisi apapun" 
                              : "Kompetisi: -"
                            }
                          </div>
                        </div>
                      </div>
                      
                      {registrationStatus === "not_registered" && (
                        <Link href="/register">
                          <Button size="sm">Daftar Sekarang</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Available Competitions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Kompetisi Tersedia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {competitions.map((comp, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {comp.name}
                            </h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {comp.price} • Deadline: {comp.deadline}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {comp.registered ? (
                              <span className="text-green-600 text-sm font-medium">
                                Terdaftar
                              </span>
                            ) : (
                              <Link href="/register">
                                <Button size="sm" variant="outline">
                                  Daftar
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar Content */}
              <div className="space-y-6">
                {/* Important Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Tanggal Penting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Early Bird</span>
                        <span className="font-medium">25-31 Ags</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Phase 1</span>
                        <span className="font-medium">1-13 Sep</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Phase 2</span>
                        <span className="font-medium">14-26 Sep</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Announcement */}
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-600 dark:text-orange-400">
                      <Bell className="mr-2 h-5 w-5" />
                      Pengumuman
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Pendaftaran Early Bird berakhir pada 31 Agustus 2025. Dapatkan diskon 20% untuk semua kategori lomba!
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Akses Cepat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/guide" className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Panduan Lengkap
                      </Link>
                      <Link href="/faq" className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Pertanyaan Umum
                      </Link>
                      <Link href="/contact" className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Hubungi Panitia
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}