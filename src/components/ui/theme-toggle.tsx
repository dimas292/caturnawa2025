"use client"

import { Moon, Sun, ArrowUp } from "lucide-react"
import { useTheme } from "next-themes"

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  })
}

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center rounded-full border border-dotted p-1">
        <button
          onClick={() => setTheme("light")}
          className={`rounded-full p-2 transition-colors ${
            theme === "light" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          }`}
          aria-label="Switch to light theme"
        >
          <Sun className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <button 
          type="button" 
          onClick={handleScrollTop}
          className="mx-2 hover:bg-muted rounded-full p-2 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`rounded-full p-2 transition-colors ${
            theme === "dark" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          }`}
          aria-label="Switch to dark theme"
        >
          <Moon className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

