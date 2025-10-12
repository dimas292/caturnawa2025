"use client"

import Link from "next/link"
import { Mail, Phone, Heart, Trophy, MessageCircle } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const navigation = {
  competitions: [
    { name: "KDBI", href: "/competitions/kdbi" },
    { name: "EDC", href: "/competitions/edc" },
    { name: "SPC", href: "/competitions/spc" },
    { name: "DCC", href: "/competitions/dcc" },
  ],
  information: [
    { name: "Guide", href: "/guide" },
    { name: "FAQ", href: "/faq" },
    { name: "Schedule", href: "/schedule" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
}

const socialLinks = [
  {
    name: "Email",
    href: "mailto:unasfest@gmail.com",
    icon: Mail,
    label: "unasfest@gmail.com",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/6285211211923",
    icon: Phone,
    label: "+62 852-1121-1923",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/unasfest",
    icon: MessageCircle,
    label: "@unasfest",
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-background">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Top Section - Logo and Description */}
        <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Caturnawa 2025</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistem registrasi dan tabulasi kompetisi untuk UNAS FEST 2025. 
              Platform untuk mengelola kompetisi debat, karya tulis ilmiah, dan konten digital.
            </p>
          </div>

          {/* Competitions */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Competitions</h4>
            <ul className="space-y-2">
              {navigation.competitions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Information</h4>
            <ul className="space-y-2">
              {navigation.information.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dotted my-8"></div>

        {/* Social Links */}
        <div className="mb-8">
          <h4 className="font-semibold mb-4 text-sm text-center">Contact Us</h4>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-dotted p-3 text-sm text-muted-foreground hover:text-foreground hover:-translate-y-1 transition-all"
                aria-label={social.name}
              >
                <social.icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{social.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-center mb-8">
          <ThemeToggle />
        </div>

        {/* Divider */}
        <div className="border-t border-dotted my-8"></div>

        {/* Bottom Section - Copyright */}
        <div className="flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-1">
            <span>©</span>
            <span>{new Date().getFullYear()}</span>
            <span>Caturnawa - UNAS FEST 2025.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 animate-pulse" />
            <span>for Indonesian students</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

