"use client";

import { Button } from "./ui/button";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "../lib/constances";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Icons.moon className="h-5 w-5" />
      ) : (
        <Icons.sun className="h-5 w-5" />
      )}
    </Button>
  );
}
