"use client"

import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Home, FolderKanban, Tags, Trash2, Shapes } from "lucide-react";
import { useMobile } from "../../hooks/use-mobile"

const FooterNavbar = () => {
  const currentYear = new Date().getFullYear()
  const location = useLocation()
  const isMobile = useMobile()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  if (isMobile) {
    return (
      <div className="flex items-center justify-around py-2">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
            isActive("/") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/projects"
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
            isActive("/projects") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <FolderKanban className="h-5 w-5" />
          <span className="text-xs mt-1">Projects</span>
        </Link>
        <Link
          to="/labels"
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
            isActive("/labels") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Tags className="h-5 w-5" />
          <span className="text-xs mt-1">Labels</span>
        </Link>
        <Link
          to="/assets"
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
            isActive("/assets") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Shapes className="h-5 w-5" />
          <span className="text-xs mt-1">Assets</span>
        </Link>
        <Link
          to="/trash"
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
            isActive("/trash") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-xs mt-1">Trash</span>
        </Link>
      </div>
    )
  }

  return (
    <footer className="py-4">
      <div className="container mx-auto text-center text-muted-foreground text-xs">
        <p>
          <strong>Label Editor</strong> By Atlasimex SL. © {currentYear} All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default FooterNavbar
