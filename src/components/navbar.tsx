"use client"

import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Navbar() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          CATURNAWA
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/"  passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/competitions" passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Competitions
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/leaderboard" passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Leaderboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/results" passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Results
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#timeline"  passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Timeline
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#about"  passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                 Institution
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Section - Theme Toggle & CTA */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Register Button */}
          <Button>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
