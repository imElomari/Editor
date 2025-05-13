'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import FooterNavbar from '@/pages/parts/FooterNavbar'
import { SidePanel } from '@/pages/parts/side-panel'
import { useMobile } from '@/hooks/use-mobile'
import { MobileUserMenu } from '@/components/MobileUserMenu'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useMobile()
  const { user, signOut } = useAuth()

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true')
    }
  }, [])

  // Save sidebar collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && (
            <SidePanel
              isOpen={true}
              onClose={() => {}}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
            />
          )}

          <div className="flex flex-col flex-1 overflow-auto">
            {/* Enhanced Mobile Top Bar */}
            {isMobile && (
              <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg">Label Editor</h1>
                </div>

                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  {user && <MobileUserMenu user={user} onSignOut={signOut} />}
                  <LanguageSwitcher />
                </div>
              </div>
            )}

            {/* Desktop top bar with language switcher */}
            {!isMobile && (
              <div className="sticky top-0 z-10 flex items-center justify-end h-14 px-4 border-b bg-background/95 backdrop-blur-sm shadow-sm top-bar-gradient">
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <div className="top-bar-divider"></div>
                  <LanguageSwitcher />
                </div>
              </div>
            )}

            <main className="flex-grow px-2 sm:px-4 pb-16 pt-2">{children}</main>

            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-t">
                <FooterNavbar />
              </div>
            )}

            {!isMobile && <FooterNavbar />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
