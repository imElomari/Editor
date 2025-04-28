import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { Link, useLocation } from "react-router-dom"
import { Button } from "../../components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Moon,
  Tag,
  Sun,
  X,
  Layers,
  User,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useMobile } from "../../hooks/use-mobile"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"

type SidePanelProps = {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function SidePanel({ isOpen, onClose, isCollapsed = false, onToggleCollapse = () => { } }: SidePanelProps) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const isMobile = useMobile()

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "U"
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-background border-r shadow-lg transform transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 md:static md:z-0",
        isCollapsed && !isMobile ? "md:w-16" : "md:w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className={cn("flex items-center", isCollapsed && !isMobile ? "justify-center w-full" : "space-x-2")}>
          <Tag className="h-6 w-6" />
          {(!isCollapsed || isMobile) && <span className="font-bold">Label Editor</span>}
        </div>
        {isMobile ? (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={isCollapsed ? "hidden" : ""}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Collapse toggle button for desktop collapsed state */}
      {isCollapsed && !isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Profile Section */}
      <div className={cn("p-4 border-b", isCollapsed && !isMobile ? "flex justify-center" : "")}>
        {isCollapsed && !isMobile ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/profile">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{getInitials(user?.email || "")}</AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{user?.user_metadata?.name || user?.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Link to="/profile" className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{getInitials(user?.email || "")}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user?.user_metadata?.name || user?.email}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("p-4 space-y-2", isCollapsed && !isMobile ? "items-center" : "")}>
        {isCollapsed && !isMobile ? (
          <TooltipProvider>
            <div className="flex flex-col items-center space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/"
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors",
                      isActive("/") && "bg-accent text-accent-foreground",
                    )}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Home className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/models"
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors",
                      isActive("/models") && "bg-accent text-accent-foreground",
                    )}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Layers className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">My Labels</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : (
          <>
            <Link
              to="/"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent transition-colors",
                isActive("/") && "bg-accent text-accent-foreground font-medium",
              )}
              onClick={isMobile ? onClose : undefined}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/labels"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent transition-colors",
                isActive("") && "bg-accent text-accent-foreground font-medium",
              )}
              onClick={isMobile ? onClose : undefined}
            >
              <Layers className="h-5 w-5" />
              <span>My Labels</span>
            </Link>
          </>
        )}
      </nav>

      {/* Settings */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 border-t",
          isCollapsed && !isMobile ? "flex flex-col items-center space-y-4" : "",
        )}
      >
        {isCollapsed && !isMobile ? (
          <TooltipProvider>
            <div className="flex flex-col items-center space-y-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                  >
                    {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Toggle theme</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      signOut()
                      if (isMobile) onClose()
                    }}
                    aria-label="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Link to={`/profile`} className="flex items-center space-x-3">
                  <User />
                  <span>Profile</span>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </div>
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => {
                signOut()
                if (isMobile) onClose()
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

