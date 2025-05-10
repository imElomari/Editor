'use client'

import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Icons } from '../lib/constances'

export default function EditorPage() {
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => setZoom(Math.min(200, zoom + 10))
  const handleZoomOut = () => setZoom(Math.max(50, zoom - 10))

  const handleSave = () => {
    toast.success('Label saved successfully', {
      description: 'Your changes have been saved.',
      position: 'top-right',
      icon: true,
    })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-background p-2 px-4">
        {/* Desktop Toolbar */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Icons.arrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Label Editor</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icons.undo className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Icons.redo className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Redo</span>
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Icons.save className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Icons.download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Mobile Toolbar */}
        <div className="sm:hidden flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Icons.arrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold">Label Editor</h1>
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon">
              <Icons.undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Icons.redo className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icons.moreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSave}>
                  <Icons.save className="h-4 w-4 mr-2" />
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icons.download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-muted/30 overflow-hidden relative p-2 sm:p-4">
        {/* Canvas Container with auto-scaling */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-white rounded-md shadow-xl border border-border/50 relative transform-gpu touch-none"
            style={{
              width: `${800 * (zoom / 100)}px`,
              height: `${600 * (zoom / 100)}px`,
              transition: 'width 0.2s, height 0.2s',
              maxWidth: 'min(calc(100vw - 1rem), 800px)',
              maxHeight: 'min(calc(100vh - 8rem), 600px)',
              minWidth: '280px',
              minHeight: '210px',
            }}
          >
            {/* Canvas Elements */}
            <div
              className="absolute cursor-move left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4"
              style={{
                fontSize: `${Math.max(16, 24 * (zoom / 100))}px`,
              }}
            >
              design your label here !
            </div>
          </div>
        </div>

        {/* Unified Zoom Controls */}
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm 
                  rounded-lg border shadow-md z-10"
        >
          <div className="flex items-center gap-2 p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <Icons.minus className="h-4 w-4" />
            </Button>
            <span className="text-xs min-w-[3rem] text-center tabular-nums">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <Icons.plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
