"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { ArrowLeft, Minus, Plus, Save, Download, Undo, Redo } from "lucide-react"

export default function EditorPage() {
  const [zoom, setZoom] = useState(100)

  // Simple zoom controls
  const handleZoomIn = () => setZoom(Math.min(200, zoom + 10))
  const handleZoomOut = () => setZoom(Math.max(50, zoom - 10))

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-background p-2 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Label Editor</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="ghost" size="sm">
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-muted/30 overflow-hidden relative flex items-center justify-center">
        {/* Canvas */}
        <div
          className="bg-white rounded-md shadow-xl border border-border/50 relative"
          style={{
            width: `${800 * (zoom / 100)}px`,
            height: `${600 * (zoom / 100)}px`,
            transition: "width 0.2s, height 0.2s",
          }}
        >
          {/* Example elements */}
          <div
            className="absolute cursor-move"
            style={{
              left: "100px",
              top: "100px",
              fontSize: "24px",
            }}
          >
            Sample Text
          </div>
          <div
            className="absolute cursor-move"
            style={{
              left: "300px",
              top: "150px",
              width: "100px",
              height: "80px",
              backgroundColor: "#4f46e5",
            }}
          />
          <div
            className="absolute rounded-full cursor-move"
            style={{
              left: "150px",
              top: "200px",
              width: "80px",
              height: "80px",
              backgroundColor: "#ef4444",
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 bg-background rounded-lg border shadow-md p-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xs w-10 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
