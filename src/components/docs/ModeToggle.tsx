import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ThemePreference = "theme-light" | "dark" | "system"

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "theme-light"
  }

  const stored = window.localStorage.getItem("theme")

  if (stored === "dark" || stored === "theme-light" || stored === "system") {
    return stored
  }

  return "theme-light"
}

function applyTheme(theme: ThemePreference) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  document.documentElement.classList.toggle("dark", isDark)
}

export function ModeToggle() {
  const [theme, setTheme] = React.useState<ThemePreference>("theme-light")

  React.useEffect(() => {
    const storedTheme = getStoredTheme()
    setTheme(storedTheme)
    applyTheme(storedTheme)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleSystemChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system")
      }
    }

    mediaQuery.addEventListener("change", handleSystemChange)

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange)
    }
  }, [])

  const updateTheme = (nextTheme: ThemePreference) => {
    window.localStorage.setItem("theme", nextTheme)
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative" variant="ghost" size="icon">
          <Sun className="h-[1.05rem] w-[1.05rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.05rem] w-[1.05rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => updateTheme("theme-light")}>
          {theme === "theme-light" ? "✓ " : ""}Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateTheme("dark")}>
          {theme === "dark" ? "✓ " : ""}Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateTheme("system")}>
          {theme === "system" ? "✓ " : ""}System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
