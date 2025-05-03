"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Filter, SlidersHorizontal, X } from "lucide-react"
import { MobileBottomSheet } from "./MobileBottomSheet"

interface MobileFilterBarProps {
  children: React.ReactNode
  activeFilters?: number
  title?: string
}

export function MobileFilterBar({ children, activeFilters = 0, title = "Filters" }: MobileFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="md:hidden sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b py-2 px-4 flex items-center justify-between">
        <h2 className="font-medium text-sm">{activeFilters > 0 ? `${activeFilters} filters applied` : "No filters"}</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setIsOpen(true)}>
          <Filter className="h-4 w-4" />
          <span>{title}</span>
          {activeFilters > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      <MobileBottomSheet title={title} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="space-y-4">
          {children}
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </MobileBottomSheet>
    </>
  )
}
