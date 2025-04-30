""

import type React from "react"
import { useState, useEffect } from "react"
import FooterNavbar from "../pages/parts/FooterNavbar"
import { SidePanel } from "../pages/parts/side-panel"
import { Button } from "../components/ui/button"
import { Menu, Tag } from "lucide-react"
import { useMobile } from "../hooks/use-mobile"

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useMobile()

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true")
    }
  }, [])

  // Save sidebar collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 overflow-hidden">
        <SidePanel
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        <div className="flex flex-col flex-1 overflow-auto mx-2">
          {isMobile && (
            <div className="flex items-center h-16 px-4 border-b">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2">
                <Menu className="h-8 w-8" />
              </Button>
              <Tag className="h-6 w-6 me-2" />
              <h1 className="font-bold">Label Editor</h1>
            </div>
          )}

          <main className="flex-grow">{children}</main>

          <FooterNavbar />
        </div>
      </div>
    </div>
  )
}

export default Layout

