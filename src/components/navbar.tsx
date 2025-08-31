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
              <Link href="/"  passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#competitions" passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Competitions
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
            
            <NavigationMenuItem>
              <Link href="#about"  passHref>
                <NavigationMenuLink className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">
                  Rankings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Button */}
        <Button>
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </header>
  )
}
