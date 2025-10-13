// src/app/dashboard/judge/page.tsx
"use client"

import { useState } from "react"
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
import { ModeToggle } from "@/components/ui/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  User, 
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Bell,
  Award,
  ArrowRight
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
    title: "KDBI",
    href: "/dashboard/judge/kdbi",
    icon: Award,
    badge: null
  },
  {
    title: "EDC",
    href: "/dashboard/judge/edc",
    icon: Award,
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
]

export default function JudgeDashboard() {
  const { user, isLoading } = useRequireRoles(['judge', 'admin'])
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      })
    } catch (error) {
      console.error("Sign out error:", error)
      window.location.href = "/"
    }
  }

  if (isLoading) {
    return <LoadingPage />
  }

  // Competition cards data
  const competitions = [
    {
      id: 'kdbi',
      name: 'KDBI',
      fullName: 'Kompetisi Debat Bahasa Indonesia',
      description: 'British Parliamentary debate format dengan 4 teams per room',
      href: '/dashboard/judge/kdbi',
      color: 'bg-blue-500',
      icon: '🗨️'
    },
    {
      id: 'edc',
      name: 'EDC',
      fullName: 'English Debate Competition',
      description: 'British Parliamentary debate format dengan 4 teams per room',
      href: '/dashboard/judge/edc',
      color: 'bg-green-500',
      icon: '💬'
    },
    {
      id: 'spc',
      name: 'SPC',
      fullName: 'Scientific Paper Competition',
      description: 'Penilaian karya tertulis (semifinal) dan presentasi langsung (final)',
      href: '/dashboard/judge/spc',
      color: 'bg-purple-500',
      icon: '📄'
    },
    {
      id: 'dcc',
      name: 'DCC',
      fullName: 'Digital Content Competition',
      description: 'Penilaian karya digital: Infografis dan Short Video',
      href: '/dashboard/judge/dcc',
      color: 'bg-orange-500',
      icon: '🎨'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <Link href="/" className="text-xl font-bold">
          Caturnawa 2025
        </Link>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                  <AvatarFallback>{user?.name?.charAt(0) || "J"}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">{user?.name || "Judge"}</span>
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

      {/* Page Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard Juri
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Selamat datang di panel penilaian Caturnawa 2025. Pilih kompetisi untuk memulai penilaian.
          </p>
        </div>

        {/* Competition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {competitions.map((comp) => (
            <Card 
              key={comp.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(comp.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${comp.color} flex items-center justify-center text-2xl`}>
                      {comp.icon}
                    </div>
                    <div>
                      <CardTitle>{comp.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{comp.fullName}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{comp.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Informasi Penting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="font-medium">KDBI & EDC</p>
                <p className="text-sm text-muted-foreground">
                  Menggunakan British Parliamentary format. Nilai 4 teams per room dengan speaker scores 0-100.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div>
                <p className="font-medium">SPC (Scientific Paper Competition)</p>
                <p className="text-sm text-muted-foreground">
                  Semifinal: Evaluasi karya tertulis. Final: Penilaian presentasi langsung.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <div>
                <p className="font-medium">DCC (Digital Content Competition)</p>
                <p className="text-sm text-muted-foreground">
                  Semifinal: Penilaian karya digital. Final: Penilaian presentasi karya.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
