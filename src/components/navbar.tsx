"use client"

import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Moon, Sun, Menu, X, Home, Trophy, BarChart3, Award, Calendar, Mail } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"

export default function Navbar() {
  const { setTheme, theme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/competitions", label: "Competitions", icon: Trophy },
    { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
    { href: "/results", label: "Results", icon: Award },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  const [activeTab, setActiveTab] = useState(navItems[0].label)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
          CATURNAWA
        </Link>

        {/* Desktop Navigation - Tubelight Style */}
        <div className="hidden md:flex items-center gap-2 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.label

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveTab(item.label)}
                className="relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors text-foreground/80 hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} strokeWidth={2.5} className="hidden lg:inline" />
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-lamp"
                    className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                      <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Section - Theme Toggle & CTA */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="transition-transform hover:scale-110"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 transition-all" />
              ) : (
                <Moon className="h-5 w-5 transition-all" />
              )}
            </Button>
          )}

          {/* Desktop Register/Dashboard Button */}
          <div className="hidden md:block">
            {session ? (
              <Link href={
                session.user.role === 'admin' ? '/dashboard/admin' :
                session.user.role === 'judge' ? '/dashboard/judge' :
                '/dashboard'
              }>
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button>Register</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4">
                  {session ? (
                    <Link
                      href={
                        session.user.role === 'admin' ? '/dashboard/admin' :
                        session.user.role === 'judge' ? '/dashboard/judge' :
                        '/dashboard'
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <Button className="w-full">Dashboard</Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full mb-2">Sign In</Button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Register</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
