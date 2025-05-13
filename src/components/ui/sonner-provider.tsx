'use client'

import type React from 'react'

import { Toaster, toast } from 'sonner'
import { useTheme } from '../@/context/ThemeContext'
import { cn } from '../@/lib/utils'

interface SonnerProviderProps {
  children: React.ReactNode
}

export function SonnerProvider({ children }: SonnerProviderProps) {
  const { theme } = useTheme()

  return (
    <>
      <Toaster
        position="top-right"
        theme={theme as 'light' | 'dark'}
        closeButton
        richColors
        duration={4000}
        expand
        visibleToasts={6}
        toastOptions={{
          classNames: {
            toast: cn(
              'group font-medium rounded-lg p-4 shadow-lg border backdrop-blur-sm',
              'data-[type=success]:border-green-500/30 data-[type=success]:bg-green-500/15 data-[type=success]:text-green-600 dark:data-[type=success]:text-green-400',
              'data-[type=error]:border-red-500/30 data-[type=error]:bg-red-500/15 data-[type=error]:text-red-600 dark:data-[type=error]:text-red-400',
              'data-[type=info]:border-blue-500/30 data-[type=info]:bg-blue-500/15 data-[type=info]:text-blue-600 dark:data-[type=info]:text-blue-400',
              'data-[type=warning]:border-amber-500/30 data-[type=warning]:bg-amber-500/15 data-[type=warning]:text-amber-600 dark:data-[type=warning]:text-amber-400',
              'transform-gpu animate-in fade-in-0 slide-in-from-right-full data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full'
            ),
            title: 'font-semibold text-base mb-1',
            description: 'text-sm opacity-90',
            actionButton: cn(
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'data-[type=success]:bg-green-600 data-[type=success]:text-white data-[type=success]:hover:bg-green-700',
              'data-[type=error]:bg-red-600 data-[type=error]:text-white data-[type=error]:hover:bg-red-700',
              'data-[type=info]:bg-blue-600 data-[type=info]:text-white data-[type=info]:hover:bg-blue-700',
              'data-[type=warning]:bg-amber-600 data-[type=warning]:text-white data-[type=warning]:hover:bg-amber-700'
            ),
            cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
            closeButton: 'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          },
        }}
      />
      {children}
    </>
  )
}

// Export toast for easier imports
export { toast }
