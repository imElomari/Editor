'use client'

import type React from 'react'
import { cn } from '../../lib/utils'

interface ModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function ModalWrapper({ isOpen, onClose, children, className }: ModalWrapperProps) {
  if (!isOpen) return null

  // Close when clicking outside the modal content
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
