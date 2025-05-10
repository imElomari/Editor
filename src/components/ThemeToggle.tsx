"use client"

import { Button } from "./ui/button"
import { useTheme } from "../context/ThemeContext"
import { Icons } from "../lib/constances"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8 rounded-full hover:bg-accent/80 transition-all duration-300 top-bar-icon"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Icons.moon className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Icons.sun className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
      )}
      <span className="sr-only">{theme === "light" ? "Dark" : "Light"} mode</span>
    </Button>
  )
}
