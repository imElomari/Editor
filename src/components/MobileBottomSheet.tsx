'use client'

import type React from 'react'
import { useState } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { Icons } from '@/lib/constances'

interface MobileBottomSheetProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function MobileBottomSheet({
  title,
  children,
  isOpen,
  onClose,
  className,
}: MobileBottomSheetProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-background rounded-t-xl shadow-lg transform transition-all duration-300 ease-in-out',
          isFullScreen ? 'top-0' : 'max-h-[85vh]',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setIsFullScreen(!isFullScreen)}
          >
            <Icons.up
              className={cn('h-5 w-5 transition-transform', isFullScreen && 'rotate-180')}
            />
          </Button>
          <h3 className="font-semibold text-center flex-1">{title}</h3>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <Icons.close className="h-5 w-5" />
          </Button>
        </div>
        <div
          className="overflow-y-auto p-4"
          style={{ maxHeight: isFullScreen ? 'calc(100vh - 4rem)' : '70vh' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
