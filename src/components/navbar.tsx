"use client"

import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"

export default function Navbar() {
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
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#competitions" legacyBehavior passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Competitions
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#timeline" legacyBehavior passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Timeline
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#about" legacyBehavior passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                 Institusi
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link href="#about" legacyBehavior passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Rank
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Button */}
        <Button>
          <Link href="/register">Daftar</Link>
        </Button>
      </div>
    </header>
  )
}
