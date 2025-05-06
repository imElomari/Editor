"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "./ui/button";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { Icons } from "../lib/constances";

interface MobileFilterBarProps {
  children: React.ReactNode;
  activeFilters?: number;
  title?: string;
  onReset?: () => void;
}

export function MobileFilterBar({
  children,
  activeFilters = 0,
  title = "Filters",
  onReset,
}: MobileFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b py-2 px-4 flex items-center justify-between">
        <h2 className="font-medium text-sm">
          {activeFilters > 0
            ? `${activeFilters} filters applied`
            : "No filters"}
        </h2>
        <div className="flex items-center gap-2">
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Icons.reset className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsOpen(true)}
          >
            <Icons.filter className="h-4 w-4" />
            <span>{title}</span>
            {activeFilters > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>
      </div>

      <MobileBottomSheet
        title={title}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="space-y-4">
          {children}
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            {activeFilters > 0 && (
              <Button variant="outline" onClick={onReset}>
                <Icons.reset className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <Icons.close className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              <Icons.sliders className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </MobileBottomSheet>
    </>
  );
}
