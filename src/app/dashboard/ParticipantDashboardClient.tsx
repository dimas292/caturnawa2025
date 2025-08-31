"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingPage } from "@/components/ui/loading"
import {
  NavigationMenuLink,
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
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  LogOut,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Menu,
  LayoutDashboard,
  Upload,
  History,
  Bell, 
  ChevronLeft,
  ChevronRight,
  DollarSign,
  UploadCloudIcon
} from "lucide-react"
import { signOut } from "next-auth/react"
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

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "Registration History",
    href: "/dashboard/history",
    icon: History,
    badge: null
  },
  {
    title: "Upload Work",
    href: "/upload",
    icon: Upload,
    badge: "Important"
  },
  {
    title: "Payment",
    href: "/dashboard/payment",
    icon: DollarSign,
    badge: null
  },
]

const sidebarSecondaryItems = [
  {
    title: "Guide",
    href: "/guide",
    icon: BookOpen
  },
  {
    title: "FAQ",
    href: "/faq",
    icon: HelpCircle
  },
  {
    title: "Contact Committee",
    href: "/contact",
    icon: MessageSquare
  },
]

interface ParticipantDashboardClientProps {
    user: any
  }

export default function ParticipantDashboard({ user }: ParticipantDashboardClientProps) {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        console.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await fetchDashboardData()
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading || isRefreshing) {
    return <LoadingPage />
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  const totalCompetitions = dashboardData.statistics.totalCompetitions;
  const pendingRegistrations = dashboardData.statistics.pendingRegistrations;
  const verifiedRegistrations = dashboardData.statistics.verifiedRegistrations;


  const competitions = dashboardData.competitions || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "PENDING_PAYMENT":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "PAYMENT_UPLOADED":
        return <UploadCloudIcon className="h-5 w-5 text-yellow-500" />
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
        case "NOT_REGISTERED":
        return "Not Registered"
        case "VERIFIED":
        return "Verified"

      case "PAYMENT_UPLOADED":
        return "Payment Verification Pending"
      case "PENDING_PAYMENT":
        return "Payment Pending"
      case "PENDING_VERIFICATION":
        return "Verification Pending"
      case "REJECTED":
        return "Rejected"
      default:
        return "Not Registered"
    }
  }

  // Sidebar Component
  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2">
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
            <AvatarImage src={user?.image} alt="user" />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.role}</span>
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
              Help
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
          {!isSidebarCollapsed && "Sign Out"}
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
                  <Button variant={'outline'} className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.image } alt="user" />
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
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span onClick={() => signOut({ callbackUrl: "/" } )}>Sign Out</span>
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
                Participant Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {user?.name}! Manage your competition registrations here.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link href="/register">
                        <Button className="w-full h-20 text-left justify-start">
                          <div>
                            <div className="font-medium">Register for Competition</div>
                            <div className="text-sm opacity-80">Choose competition category</div>
                          </div>
                        </Button>
                      </Link>
                      
                      <Link href="/dashboard/profile">
                        <Button variant="outline" className="w-full h-20 text-left justify-start">
                          <div>
                            <div className="font-medium">Update Profile</div>
                            <div className="text-sm opacity-80">Manage personal data</div>
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
                      Registration Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {dashboardData.recentRegistrations && dashboardData.recentRegistrations.length > 0 ? (
                          <>
                            {getStatusIcon(dashboardData.recentRegistrations[0].status)}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {getStatusText(dashboardData.recentRegistrations[0].status)}    
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                No registrations yet
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    
                      {(!dashboardData.recentRegistrations || dashboardData.recentRegistrations.length === 0) && (
                        <Link href="/register">
                          <Button size="sm">Register Now</Button>
                        </Link>
                      )}

                    </div>
                  </CardContent>
                </Card>

                {/* Available Competitions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Competitions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {competitions.map((comp: any, index: number) => (
                        <div key={comp.id || index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {comp.name}
                            </h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {comp.price ? `Rp ${comp.price.toLocaleString()}` : 'Free'} • Deadline: {comp.deadline ? new Date(comp.deadline).toLocaleDateString('id-ID') : 'TBD'}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {comp.registered ? (
                              <span className="text-green-600 text-sm font-medium">
                                Registered
                              </span>
                            ) : (
                              <Link href="/register">
                                <Button size="sm" variant="outline">
                                  Register
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
                      Important Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Early Bird</span>
                        <span className="font-medium">1-7 Sep</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Phase 1</span>
                        <span className="font-medium">8-19 Sep</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Phase 2</span>
                        <span className="font-medium">20-28 Sep</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Announcement */}
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-600 dark:text-orange-400">
                      <Bell className="mr-2 h-5 w-5" />
                      Announcement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Early Bird registration ends on September 7, 2025. Get 20% discount for all competition categories!
                    </p>
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