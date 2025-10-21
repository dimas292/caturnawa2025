// src/app/admin/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import React from "react"
import { 
  User, 
  FileText, 
  Trophy, 
  AlertCircle,
  Users,
  LogOut,
  Menu,
  X,
  LayoutDashboard,

  ChevronLeft,
  ChevronRight,
  UserPlus,
  FileCheck,
  DollarSign,

  FolderOpen,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  TrendingUp,
  Mail,

  Megaphone,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  ArrowRightLeft,
  Home
} from "lucide-react"

// Sidebar Navigation Items for Admin (focused mode)
const adminSidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "KDBI Pairing",
    href: "/dashboard/admin/kdbi/pairing",
    icon: ArrowRightLeft,
    badge: null
  },
  {
    title: "EDC Pairing",
    href: "/dashboard/admin/edc/pairing",
    icon: ArrowRightLeft,
    badge: null
  },
  {
    title: "SPC Semifinal Scores",
    href: "/dashboard/admin/spc-semifinal-scores",
    icon: Trophy,
    badge: null
  },
]


export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<string>("ALL")
  const [allParticipants, setAllParticipants] = useState<any[]>([])
  const [isLoading2, setIsLoading2] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [paymentModal, setPaymentModal] = useState<{isOpen: boolean, participant: any}>({isOpen: false, participant: null})
  const [detailModal, setDetailModal] = useState<{isOpen: boolean, participant: any}>({isOpen: false, participant: null})
  const [documentsModal, setDocumentsModal] = useState<{isOpen: boolean, participant: any, documents: any}>({isOpen: false, participant: null, documents: null})
  const [isMigrating, setIsMigrating] = useState(false)
  const [stats, setStats] = useState({
    totalParticipants: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    totalRevenue: "Rp 0",
    todayRegistrations: 0,
    weeklyGrowth: 0
  })

  // Check if user has admin role
  const isAdmin = user?.role === "admin"

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

  if (isLoading) {
    return <LoadingPage />
  }

  // Check authentication and admin role
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to access the admin dashboard.</p>
          <Button onClick={() => window.location.href = "/auth/signin"}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You don't have permission to access the admin dashboard.</p>
          <Button onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">There was an error loading the admin dashboard.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Fetch ALL participants data once (no filtering on API)
  const fetchAllParticipants = async () => {
    try {
      setIsDataLoading(true)
      setHasError(false)
      console.log('Fetching all participants data...')
      
      const response = await fetch(`/api/admin/participants?competition=ALL`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add credentials to ensure session is sent
        credentials: 'include'
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in again.')
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.')
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`Failed to fetch participants: ${response.status}`)
        }
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.success) {
        const data = result.data || []
        console.log('Participants data:', data.map(p => ({ id: p.id, status: p.status, leaderName: p.leaderName })))
        setAllParticipants(data)
        
        // Calculate stats from all data
        const allData = data
        
        // Count total registrations and individual participants
        const totalRegistrations = allData.length
        const totalIndividuals = allData.reduce((sum: number, registration: any) => {
          return sum + 1 + (registration.teamMembers ? registration.teamMembers.length : 0)
        }, 0)
        
        // Count registrations by status
        const verified = allData.filter((p: any) => p.status === 'VERIFIED').length
        const pending = allData.filter((p: any) => p.status === 'PAYMENT_UPLOADED').length
        const rejected = allData.filter((p: any) => p.status === 'REJECTED').length
        const totalRevenue = allData.reduce((sum: number, p: any) => {
          return p.status === 'VERIFIED' ? sum + (p.paymentAmount || 0) : sum
        }, 0)
        
        const today = new Date().toISOString().split('T')[0]
        const todayRegs = allData.filter((p: any) => 
          new Date(p.createdAt).toISOString().split('T')[0] === today
        ).length
        
        setStats({
          totalParticipants: totalRegistrations, // Total registrations/teams
          verified,
          pending,
          rejected,
          totalRevenue: `Rp ${totalRevenue.toLocaleString()}`,
          todayRegistrations: todayRegs,
          weeklyGrowth: 0 // TODO: Calculate actual growth
        })
      } else {
        console.error('API returned success: false', result)
        throw new Error(result.error || 'Unknown API error')
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      setHasError(true)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('User-friendly error:', errorMessage)
      
      // Set empty data on error
      setAllParticipants([])
      setStats({
        totalParticipants: 0,
        verified: 0,
        pending: 0,
        rejected: 0,
        totalRevenue: "Rp 0",
        todayRegistrations: 0,
        weeklyGrowth: 0
      })
    } finally {
      setIsDataLoading(false)
    }
  }

  // Filter participants on frontend based on selected competition
  const filteredParticipants = selectedCompetition === "ALL" 
    ? allParticipants 
    : allParticipants.filter(p => p.competition.type === selectedCompetition)

  useEffect(() => {
    // Hanya fetch data jika user sudah authenticated dan adalah admin
    if (!isLoading && isAuthenticated && isAdmin) {
      fetchAllParticipants()
    }
  }, [isLoading, isAuthenticated, isAdmin])

  // Functions for managing participants
  const handleStatusChange = async (participantId: string, newStatus: string, adminNotes?: string) => {
    setIsLoading2(true)
    try {
      const response = await fetch(`/api/admin/participants/${participantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      })
      
      if (!response.ok) throw new Error('Failed to update status')
      
      const result = await response.json()
      if (result.success) {
        // Refresh participants data
        await fetchAllParticipants()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update participant status')
    } finally {
      setIsLoading2(false)
    }
  }

  const handlePaymentApproval = async (participantId: string, action: 'approve' | 'reject') => {
    setIsLoading2(true)
    try {
      const newStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED'
      const adminNotes = action === 'approve' ? 'Payment approved by admin' : 'Payment rejected by admin'
      
      const response = await fetch(`/api/admin/participants/${participantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      })
      
      if (!response.ok) throw new Error('Failed to update payment status')
      
      const result = await response.json()
      if (result.success) {
        setPaymentModal({isOpen: false, participant: null})
        // Refresh participants data
        await fetchAllParticipants()
      }
    } catch (error) {
      console.error('Failed to update payment status:', error)
      alert('Failed to update payment status')
    } finally {
      setIsLoading2(false)
    }
  }

  const downloadCSV = async () => {
    try {
      const response = await fetch(`/api/admin/participants/export?competition=${selectedCompetition}`)
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const filename = response.headers.get('Content-Disposition')
        ?.split('filename="')[1]
        ?.split('"')[0] || 
        `participants_${selectedCompetition}_${new Date().toISOString().split('T')[0]}.csv`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download CSV:', error)
      alert('Failed to download CSV file')
    }
  }

  const migrateFileUrls = async () => {
    if (!confirm('This will migrate all file URLs from /uploads/ to /api/files/. This should only be done once after deployment. Continue?')) {
      return
    }

    setIsMigrating(true)
    try {
      const response = await fetch('/api/admin/migrate-file-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      const result = await response.json()
      console.log('Migration response:', result)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.error || 'Migration failed'}\n${result.details || ''}`)
      }

      if (result.success) {
        alert(`✅ Migration successful!\n\n📊 Results:\n• Updated ${result.updatedFiles} file records\n• Updated ${result.updatedPayments} payment records\n• Total: ${result.totalUpdated} records\n\n🎉 Files now accessible via /api/files/`)
        
        // Optionally refresh page data
        fetchAllParticipants()
      } else {
        throw new Error(result.error || 'Migration failed')
      }
    } catch (error) {
      console.error('Migration failed:', error)
      
      let errorMessage = 'Migration failed!\n\n'
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage += '❌ Authentication Error: Please login as admin first'
        } else if (error.message.includes('403')) {
          errorMessage += '❌ Permission Error: Admin access required'
        } else if (error.message.includes('500')) {
          errorMessage += '❌ Server Error: Check server logs for details\n\nError: ' + error.message
        } else {
          errorMessage += '❌ Error: ' + error.message
        }
      } else {
        errorMessage += '❌ Unknown error occurred'
      }
      
      alert(errorMessage)
    } finally {
      setIsMigrating(false)
    }
  }

  const handleDeleteParticipant = async (participant: any) => {
    const confirmMessage = `⚠️ WARNING: This will permanently delete the registration for:\n\n` +
      `• Participant: ${participant.leaderName}\n` +
      `• Competition: ${participant.competition.name}\n` +
      `• Team: ${participant.teamName || 'Individual'}\n\n` +
      `This action will:\n` +
      `✗ Delete the registration record\n` +
      `✗ Delete all uploaded documents\n` +
      `✗ Remove payment records\n` +
      `✗ Allow participant to register again\n\n` +
      `Are you absolutely sure?`

    if (!confirm(confirmMessage)) {
      return
    }

    if (!confirm(`Final confirmation: Delete registration for ${participant.leaderName}?`)) {
      return
    }

    setIsLoading2(true)
    try {
      const response = await fetch(`/api/admin/participants/${participant.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.error || 'Delete failed'}\n${result.details || ''}`)
      }

      if (result.success) {
        alert(`✅ Registration deleted successfully!\n\nParticipant ${participant.leaderName} can now register again for competitions.`)
        
        // Refresh participant data
        fetchAllParticipants()
      } else {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      
      let errorMessage = 'Failed to delete registration!\n\n'
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage += '❌ Authentication Error: Please login as admin first'
        } else if (error.message.includes('403')) {
          errorMessage += '❌ Permission Error: Admin access required'
        } else if (error.message.includes('404')) {
          errorMessage += '❌ Not Found: Registration may have been already deleted'
        } else if (error.message.includes('500')) {
          errorMessage += '❌ Server Error: Check server logs for details\n\nError: ' + error.message
        } else {
          errorMessage += '❌ Error: ' + error.message
        }
      } else {
        errorMessage += '❌ Unknown error occurred'
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading2(false)
    }
  }

  const viewDocuments = async (participant: any) => {
    try {
      setIsLoading2(true)
      const response = await fetch(`/api/admin/participants/${participant.id}/documents`)
      
      if (!response.ok) throw new Error('Failed to fetch documents')
      
      const result = await response.json()
      if (result.success) {
        setDocumentsModal({
          isOpen: true, 
          participant, 
          documents: result.data
        })
      } else {
        throw new Error(result.error || 'Failed to load documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      alert(`Failed to load documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading2(false)
    }
  }

  // Calculate real competition statistics
  const competitionStats = React.useMemo(() => {
    if (!allParticipants.length) return []

    const competitions = ['KDBI', 'EDC', 'SPC', 'DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO']
    const competitionNames: Record<string, string> = {
      'KDBI': 'KDBI',
      'EDC': 'EDC', 
      'SPC': 'SPC',
      'DCC_INFOGRAFIS': 'DCC Infografis',
      'DCC_SHORT_VIDEO': 'DCC Short Video'
    }

    // Set target capacity per competition
    const competitionCapacity: Record<string, number> = {
      'KDBI': 60,
      'EDC': 60,
      'SPC': 40,
      'DCC_INFOGRAFIS': 30,
      'DCC_SHORT_VIDEO': 30
    }

    return competitions.map(compType => {
      const compRegistrations = allParticipants.filter(p => p.competition.type === compType)
      const verifiedRegistrations = compRegistrations.filter(p => p.status === 'VERIFIED')
      const revenue = verifiedRegistrations.reduce((sum, p) => sum + p.paymentAmount, 0)
      
      return {
        name: competitionNames[compType],
        participants: compRegistrations.length,
        revenue: `Rp ${revenue.toLocaleString()}`,
        capacity: competitionCapacity[compType],
        verified: verifiedRegistrations.length
      }
    }).filter(comp => comp.participants > 0) // Only show competitions with participants
  }, [allParticipants])

  // Sidebar Component
  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard/admin" className="flex items-center space-x-2">
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
            <AvatarImage src="" />
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
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950",
            isSidebarCollapsed && "justify-center"
          )}
        >
          <LogOut className={cn(
            "h-4 w-4",
            !isSidebarCollapsed && "mr-2"
          )} />
          {!isSidebarCollapsed && "Sign Out"}
        </Button>
      </div>
    </>
  )

  const getStatusBadge = (status: string) => {
    console.log('Status badge for:', status)
    switch (status) {
      case "VERIFIED":
        return <Badge variant="default" className="bg-green-600 text-white">✅ Verified</Badge>
      case "PAYMENT_UPLOADED":
        return <Badge variant="secondary" className="bg-yellow-600 text-white">⏳ Pending</Badge>
      case "PENDING_PAYMENT":
        return <Badge variant="outline" className="border-orange-600 text-orange-600">💳 Not Paid</Badge>
      case "REJECTED":
        return <Badge variant="destructive">❌ Rejected</Badge>
      case "COMPLETED":
        return <Badge variant="default" className="bg-blue-600 text-white">🎉 Completed</Badge>
      default:
        console.log('Unknown status:', status)
        return <Badge variant="secondary">❓ {status || 'Missing'}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="default" className="bg-green-600">Verified</Badge>
      case "PAYMENT_UPLOADED":
        return <Badge variant="secondary" className="bg-yellow-600 text-white">Needs Review</Badge>
      case "PENDING_PAYMENT":
        return <Badge variant="outline">Not Paid</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "COMPLETED":
        return <Badge variant="default" className="bg-blue-600">Completed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getCompetitionName = (code: string) => {
    switch (code) {
      case "KDBI": return "KDBI"
      case "EDC": return "EDC"
      case "SPC": return "SPC"
      case "DCC_INFOGRAFIS": return "DCC Infografis"
      case "DCC_SHORT_VIDEO": return "DCC Short Video"
      default: return code
    }
  }

  function handleRefresh(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    fetchAllParticipants();
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex md:flex-col bg-background border-r transition-all duration-300",
        isSidebarCollapsed ? "md:w-16" : "md:w-64"
      )}>
        <SidebarContent />
        
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
                  placeholder="Search participants, competitions..."
                  className="h-9 w-full rounded-md border bg-transparent pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="ml-auto flex items-center space-x-2">
              {/* Refresh Button */}
              <Button variant="ghost" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-5 w-5" />
              </Button>        
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
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Admin</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                    Administrator Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Welcome, {user?.name}! Manage all Caturnawa 2025 competitions.
                  </p>
                </div>
                <Link href="/">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Home className="h-4 w-4" />
                    Main Menu
                  </Button>
                </Link>
              </div>
            </div>

            {/* Competition Pairing CTAs */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* KDBI Pairing CTA */}
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>KDBI Manual Pairing</CardTitle>
                  <CardDescription>
                    Atur penempatan tim ke Breakout Room per round (OG/OO/CG/CO). Fitur ini hanya untuk admin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <Link href="/dashboard/admin/kdbi/pairing">
                    <Button>
                      Buka Halaman Pairing KDBI
                    </Button>
                  </Link>
                  <span className="text-sm text-muted-foreground">Stage & Round dapat dipilih di halaman pairing.</span>
                </CardContent>
              </Card>

              {/* EDC Pairing CTA */}
              <Card className="border-green-500/30">
                <CardHeader>
                  <CardTitle>EDC Manual Pairing</CardTitle>
                  <CardDescription>
                    Atur penempatan tim ke Breakout Room per round (OG/OO/CG/CO) untuk English Debate Competition.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <Link href="/dashboard/admin/edc/pairing">
                    <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                      Buka Halaman Pairing EDC
                    </Button>
                  </Link>
                  <span className="text-sm text-muted-foreground">Stage & Round dapat dipilih di halaman pairing.</span>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Registrasi</p>
                      <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                      <p className="text-xs text-muted-foreground">Tim/Individual</p>
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
                      <p className="text-sm text-muted-foreground">Verified</p>
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
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                                              <Badge variant="secondary" className="mt-1">Action Required</Badge>
                    </div>
                    <Clock3 className="h-8 w-8 text-yellow-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-lg font-bold">{stats.totalRevenue}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">Today: +12</span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Participant Management - Takes 2 columns */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Manage Registrations</CardTitle>
                        <CardDescription>
                          {filteredParticipants.length} teams/registrations ({filteredParticipants.reduce((sum: number, p: any) => sum + 1 + (p.teamMembers?.length || 0), 0)} total individuals)
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter Competition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Competitions</SelectItem>
                            <SelectItem value="KDBI">KDBI</SelectItem>
                            <SelectItem value="EDC">EDC</SelectItem>
                            <SelectItem value="SPC">SPC</SelectItem>
                            <SelectItem value="DCC_INFOGRAFIS">DCC Infografis</SelectItem>
                            <SelectItem value="DCC_SHORT_VIDEO">DCC Short Video</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={downloadCSV}>
                          <Download className="h-4 w-4 mr-1" />
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Participant</TableHead>
                          <TableHead>Competition</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isDataLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                              Loading participants...
                            </TableCell>
                          </TableRow>
                        ) : filteredParticipants.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No participants found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredParticipants.map((participant) => (
                            <TableRow key={participant.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{participant.leaderName}</div>
                                  <div className="text-xs text-muted-foreground">{participant.leaderEmail}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {participant.teamName && participant.teamName !== 'Individual' && `Team: ${participant.teamName}`}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getCompetitionName(participant.competition.type)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(participant.status)}
                                  <span className="text-xs text-gray-500">({participant.status})</span>
                                  {(participant.status === "PAYMENT_UPLOADED" || participant.status === "PENDING_PAYMENT") && (
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-xs text-green-600 border-green-600"
                                        onClick={() => handleStatusChange(participant.id, "VERIFIED")}
                                        disabled={isLoading2}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-xs text-red-600 border-red-600"
                                        onClick={() => handleStatusChange(participant.id, "REJECTED")}
                                        disabled={isLoading2}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getPaymentBadge(participant.status)}
                                  {participant.status === "PAYMENT_UPLOADED" && participant.paymentProofUrl && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => setPaymentModal({isOpen: true, participant})}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Review
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setDetailModal({isOpen: true, participant})}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setDetailModal({isOpen: true, participant})}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Full Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => viewDocuments(participant)} disabled={isLoading2}>
                                    <FileCheck className="mr-2 h-4 w-4" />
                                    View Documents
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteParticipant(participant)}
                                    disabled={isLoading2}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Registration
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Competition Statistics */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Competition Statistics</CardTitle>
                    <CardDescription>
                      Overview of participants and revenue per competition category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {competitionStats.length > 0 ? competitionStats.map((comp, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{comp.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-muted-foreground">
                                {comp.participants}/{comp.capacity} registrations
                              </span>
                              <br />
                              <span className="text-xs text-green-600">
                                {comp.verified} verified
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={(comp.participants / comp.capacity) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="font-medium text-green-600">{comp.revenue}</span>
                            <span>{Math.round((comp.participants / comp.capacity) * 100)}% capacity</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No registrations yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar Content */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Participant Manually
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Verify Payment
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Megaphone className="mr-2 h-4 w-4" />
                      Create Announcement
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email Blast
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={downloadCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={migrateFileUrls}
                      disabled={isMigrating}
                    >
                      {isMigrating ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                      )}
                      {isMigrating ? 'Migrating...' : 'Migrate File URLs'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Alerts & Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                      Attention Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Clock3 className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Verifications Pending</p>
                          <p className="text-xs text-muted-foreground">Need to be verified within 24 hours</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Payments Rejected</p>
                          <p className="text-xs text-muted-foreground">Need to follow up with participants</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Incomplete Documents</p>
                          <p className="text-xs text-muted-foreground">Waiting for document upload</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </main>

        {/* Payment Proof Review Modal */}
        <Dialog open={paymentModal.isOpen} onOpenChange={(open) => setPaymentModal({isOpen: open, participant: null})}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Payment Proof</DialogTitle>
              <DialogDescription>
                Review payment proof from {paymentModal.participant?.leaderName}
              </DialogDescription>
            </DialogHeader>
            
            {paymentModal.participant && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">Participant:</label>
                    <p>{paymentModal.participant.leaderName}</p>
                  </div>
                  <div>
                    <label className="font-medium">Competition:</label>
                    <p>{getCompetitionName(paymentModal.participant.competition.type)}</p>
                  </div>
                  <div>
                    <label className="font-medium">Amount:</label>
                    <p>Rp {paymentModal.participant.paymentAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="font-medium">Date:</label>
                    <p>{new Date(paymentModal.participant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {paymentModal.participant.paymentProofUrl && (
                  <div>
                    <label className="font-medium mb-2 block">Payment Proof:</label>
                    <div className="border rounded-lg p-4">
                      <img 
                        src={paymentModal.participant.paymentProofUrl} 
                        alt="Payment Proof" 
                        className="max-w-full h-auto max-h-80 mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTIuMjY4NiA3MCA4NiA3Ni4yNjg2IDg2IDg0Qzg2IDkxLjczMTQgOTIuMjY4NiA5OCAxMDAgOThDMTA3LjczMSA5OCAxMTQgOTEuNzMxNCAxMTQgODRDMTE0IDc2LjI2ODYgMTA3LjczMSA3MCAxMDAgNzBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik02MCA2MEMxMTAuNDY1IDYwIDE0MCA4MS42IDEzOSA4NC42QzEzNy4wNTcgOTkuMzE0MyAxMDcuMzE0IDEzMCA2MCA5MEw2MCA2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                        }}
                      />
                      <p className="text-center text-xs text-muted-foreground mt-2">
                        Click image if it doesn't load properly
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPaymentModal({isOpen: false, participant: null})}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => paymentModal.participant && handlePaymentApproval(paymentModal.participant.id, 'reject')}
                disabled={isLoading2}
              >
                {isLoading2 ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Reject Payment
              </Button>
              <Button 
                onClick={() => paymentModal.participant && handlePaymentApproval(paymentModal.participant.id, 'approve')}
                disabled={isLoading2}
              >
                {isLoading2 ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Approve Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Participant Detail Modal */}
        <Dialog open={detailModal.isOpen} onOpenChange={(open) => setDetailModal({isOpen: open, participant: null})}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Participant Details
              </DialogTitle>
              <DialogDescription>
                Complete information for {detailModal.participant?.leaderName}
              </DialogDescription>
            </DialogHeader>
            
            {detailModal.participant && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-sm">Full Name:</label>
                        <p className="text-sm">{detailModal.participant.leaderName}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Email:</label>
                        <p className="text-sm">{detailModal.participant.leaderEmail}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">WhatsApp:</label>
                        <p className="text-sm">{detailModal.participant.whatsappNumber}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Institution:</label>
                        <p className="text-sm">{detailModal.participant.institution}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Faculty:</label>
                        <p className="text-sm">{detailModal.participant.faculty || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Registration Date:</label>
                        <p className="text-sm">{new Date(detailModal.participant.createdAt).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Competition Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Competition Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-sm">Competition:</label>
                        <p className="text-sm">{detailModal.participant.competition.name}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Category:</label>
                        <p className="text-sm">{detailModal.participant.competition.category}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Team Name:</label>
                        <p className="text-sm">{detailModal.participant.teamName}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Status:</label>
                        <div className="mt-1">{getStatusBadge(detailModal.participant.status)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-sm">Payment Phase:</label>
                        <p className="text-sm">{detailModal.participant.paymentPhase}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Amount:</label>
                        <p className="text-sm">Rp {detailModal.participant.paymentAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Payment Code:</label>
                        <p className="text-sm">{detailModal.participant.paymentCode || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Agreement:</label>
                        <p className="text-sm">{detailModal.participant.agreementAccepted ? 'Accepted' : 'Not Accepted'}</p>
                      </div>
                    </div>
                    
                    {detailModal.participant.paymentProofUrl && (
                      <div className="mt-4">
                        <label className="font-medium text-sm block mb-2">Payment Proof:</label>
                        <div className="border rounded-lg p-2">
                          <img 
                            src={detailModal.participant.paymentProofUrl} 
                            alt="Payment Proof" 
                            className="max-w-full h-auto max-h-60 mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.svg'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Team Members */}
                {detailModal.participant.teamMembers && detailModal.participant.teamMembers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Team Members ({detailModal.participant.teamMembers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {detailModal.participant.teamMembers.map((member: any, index: number) => (
                          <div key={member.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {member.role === 'LEADER' ? 'Leader' : `Member ${member.position}`}
                              </Badge>
                              <h4 className="font-medium">{member.fullName}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Email:</span> {member.email}
                              </div>
                              <div>
                                <span className="font-medium">Phone:</span> {member.phone}
                              </div>
                              <div>
                                <span className="font-medium">Institution:</span> {member.institution}
                              </div>
                              <div>
                                <span className="font-medium">Student ID:</span> {member.studentId}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Work Submission */}
                {(detailModal.participant.workTitle || detailModal.participant.workDescription) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Work Submission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {detailModal.participant.workTitle && (
                          <div>
                            <label className="font-medium text-sm">Title:</label>
                            <p className="text-sm">{detailModal.participant.workTitle}</p>
                          </div>
                        )}
                        {detailModal.participant.workDescription && (
                          <div>
                            <label className="font-medium text-sm">Description:</label>
                            <p className="text-sm">{detailModal.participant.workDescription}</p>
                          </div>
                        )}
                        {detailModal.participant.workFileUrl && (
                          <div>
                            <label className="font-medium text-sm">File:</label>
                            <a 
                              href={detailModal.participant.workFileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm ml-2"
                            >
                              View File
                            </a>
                          </div>
                        )}
                        {detailModal.participant.workLinkUrl && (
                          <div>
                            <label className="font-medium text-sm">Link:</label>
                            <a 
                              href={detailModal.participant.workLinkUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm ml-2"
                            >
                              Open Link
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Admin Notes */}
                {detailModal.participant.adminNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Admin Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {detailModal.participant.adminNotes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDetailModal({isOpen: false, participant: null})}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setDetailModal({isOpen: false, participant: null})
                  if (detailModal.participant?.paymentProofUrl) {
                    setPaymentModal({isOpen: true, participant: detailModal.participant})
                  }
                }}
                disabled={!detailModal.participant?.paymentProofUrl}
              >
                Review Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Documents Modal */}
        <Dialog open={documentsModal.isOpen} onOpenChange={(open) => setDocumentsModal({isOpen: open, participant: null, documents: null})}>
          <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Uploaded Documents
              </DialogTitle>
              <DialogDescription>
                Documents uploaded by {documentsModal.documents?.registration?.leaderName} - {documentsModal.documents?.registration?.teamName}
              </DialogDescription>
            </DialogHeader>
            
            {documentsModal.documents && (
              <div className="space-y-6">
                {/* Team Files */}
                {documentsModal.documents.files.teamFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Team Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documentsModal.documents.files.teamFiles.map((file: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{file.fileType}</Badge>
                              {file.exists ? (
                                <Badge className="bg-green-100 text-green-800">Available</Badge>
                              ) : (
                                <Badge variant="destructive">Missing</Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium">{file.originalName || file.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              Size: {file.fileSize ? (file.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {file.exists && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = file.fileUrl
                                      link.download = file.originalName || file.fileName
                                      link.click()
                                    }}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Member Files */}
                {documentsModal.documents.teamMembers.map((member: any) => {
                  const memberFiles = documentsModal.documents.files.memberFiles[member.memberKey] || []
                  if (memberFiles.length === 0) return null
                  
                  return (
                    <Card key={member.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Documents - {member.fullName} 
                          <Badge variant="secondary" className="ml-2">
                            {member.role === 'LEADER' ? 'Leader' : `Member ${member.position}`}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {memberFiles.map((file: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{file.fileType}</Badge>
                                {file.exists ? (
                                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                                ) : (
                                  <Badge variant="destructive">Missing</Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{file.originalName || file.fileName}</p>
                              {file.fileSize && (
                                <p className="text-xs text-muted-foreground">
                                  Size: {(file.fileSize / 1024).toFixed(1)} KB
                                </p>
                              )}
                              <div className="flex gap-2 mt-2">
                                {file.exists && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(file.fileUrl, '_blank')}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const link = document.createElement('a')
                                        link.href = file.fileUrl
                                        link.download = file.originalName || file.fileName
                                        link.click()
                                      }}
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Work Submission Files */}
                {documentsModal.documents.files.workSubmission.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Work Submission Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documentsModal.documents.files.workSubmission.map((file: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">WORK SUBMISSION</Badge>
                              {file.exists ? (
                                <Badge className="bg-green-100 text-green-800">Available</Badge>
                              ) : (
                                <Badge variant="destructive">Missing</Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium">{file.originalName || file.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              Size: {file.fileSize ? (file.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {file.exists && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = file.fileUrl
                                      link.download = file.originalName || file.fileName
                                      link.click()
                                    }}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Documents */}
                {documentsModal.documents.files.teamFiles.length === 0 && 
                 documentsModal.documents.files.workSubmission.length === 0 &&
                 Object.values(documentsModal.documents.files.memberFiles).every((files: any) => files.length === 0) && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents have been uploaded yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDocumentsModal({isOpen: false, participant: null, documents: null})}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}