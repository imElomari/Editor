"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Slider } from "../components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { ScrollArea } from "../components/ui/scroll-area"
import { Separator } from "../components/ui/separator"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { cn } from "../lib/utils"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Circle,
  Download,
  Grid3X3,
  ImageIcon,
  Italic,
  Layers,
  LayoutGrid,
  Minus,
  MoreHorizontal,
  Plus,
  Redo,
  Save,
  Share2,
  Square,
  Text,
  Trash2,
  Triangle,
  Underline,
  Undo,
  X,
  Type,
  FileImage,
  Shapes,
  Hand,
  MousePointer,
  Crop,
  Move,
} from "lucide-react"

// Sample elements for the canvas
const sampleElements = [
  {
    id: 1,
    type: "text",
    content: "Sample Text",
    x: 100,
    y: 100,
    width: 200,
    height: 50,
    fontSize: 24,
    color: "#000000",
  },
  { id: 2, type: "rectangle", x: 400, y: 150, width: 200, height: 100, color: "#4f46e5" },
  { id: 3, type: "circle", x: 200, y: 300, radius: 50, color: "#ef4444" },
]

// Sample templates
const sampleTemplates = [
  { id: 1, name: "Business Card", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: 2, name: "Social Media Post", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: 3, name: "Presentation", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: 4, name: "Flyer", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: 5, name: "Label", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: 6, name: "Poster", thumbnail: "/placeholder.svg?height=120&width=200" },
]

// Sample shapes
const shapes = [
  { id: 1, name: "Rectangle", icon: <Square className="h-5 w-5" /> },
  { id: 2, name: "Circle", icon: <Circle className="h-5 w-5" /> },
  { id: 3, name: "Triangle", icon: <Triangle className="h-5 w-5" /> },
]

// Sample images
const images = [
  { id: 1, url: "/placeholder.svg?height=80&width=80", name: "Image 1" },
  { id: 2, url: "/placeholder.svg?height=80&width=80", name: "Image 2" },
  { id: 3, url: "/placeholder.svg?height=80&width=80", name: "Image 3" },
  { id: 4, url: "/placeholder.svg?height=80&width=80", name: "Image 4" },
  { id: 5, url: "/placeholder.svg?height=80&width=80", name: "Image 5" },
  { id: 6, url: "/placeholder.svg?height=80&width=80", name: "Image 6" },
]

// Sample text styles
const textStyles = [
  { id: 1, name: "Heading", style: "text-2xl font-bold" },
  { id: 2, name: "Subheading", style: "text-xl font-semibold" },
  { id: 3, name: "Body", style: "text-base" },
  { id: 4, name: "Caption", style: "text-sm text-muted-foreground" },
]

// Sample color palette
const colorPalette = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
]

export default function EditorPage() {
  const [zoom, setZoom] = useState(100)
  const [selectedElement, setSelectedElement] = useState<number | null>(null)
  const [activeTool, setActiveTool] = useState<string>("select")
  const [sidebarTab, setSidebarTab] = useState<string>("elements")
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [elements, setElements] = useState(sampleElements)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })

  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  // Handle element selection
  const handleElementSelect = (id: number) => {
    setSelectedElement(id === selectedElement ? null : id)
  }

  // Handle tool selection
  const handleToolSelect = (tool: string) => {
    setActiveTool(tool)
  }

  // Handle canvas drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "hand") {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - canvasPosition.x,
        y: e.clientY - canvasPosition.y,
      })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && activeTool === "hand") {
      setCanvasPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Center the canvas on resize
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasPosition({
          x: (window.innerWidth - rect.width) / 2,
          y: (window.innerHeight - rect.height) / 2,
        })
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial positioning

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [zoom])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between p-2 px-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Untitled Design</h1>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Auto-saved 2 minutes ago</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Undo className="h-4 w-4" />
            <span className="hidden sm:inline">Undo</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Redo className="h-4 w-4" />
            <span className="hidden sm:inline">Redo</span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-background/95 backdrop-blur-sm flex flex-col">
          <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
              <TabsTrigger value="elements" className="rounded-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1">
                        <Shapes className="h-5 w-5" />
                        <span className="text-xs">Elements</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Elements</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="text" className="rounded-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1">
                        <Type className="h-5 w-5" />
                        <span className="text-xs">Text</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Text</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="images" className="rounded-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1">
                        <FileImage className="h-5 w-5" />
                        <span className="text-xs">Images</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Images</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="templates" className="rounded-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1">
                        <LayoutGrid className="h-5 w-5" />
                        <span className="text-xs">Templates</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Templates</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="flex-1 p-4">
            {sidebarTab === "elements" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Shapes</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {shapes.map((shape) => (
                      <Button
                        key={shape.id}
                        variant="outline"
                        className="h-16 flex flex-col items-center justify-center gap-1 hover:bg-muted/50 hover:border-primary/50 transition-all"
                        onClick={() => handleToolSelect(shape.name.toLowerCase())}
                      >
                        {shape.icon}
                        <span className="text-xs">{shape.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Colors</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {colorPalette.map((color, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="w-8 h-8 rounded-full border border-border/50 shadow-sm hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{color}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sidebarTab === "text" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Add Text</h3>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 mb-3"
                    onClick={() => handleToolSelect("text")}
                  >
                    <Text className="h-4 w-4" />
                    <span>Add Text Box</span>
                  </Button>

                  <h3 className="text-sm font-medium mb-3">Text Styles</h3>
                  <div className="space-y-2">
                    {textStyles.map((style) => (
                      <Button key={style.id} variant="outline" className="w-full justify-start h-auto py-3 px-4">
                        <span className={style.style}>{style.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sidebarTab === "images" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Upload</h3>
                  <Button variant="outline" className="w-full justify-start gap-2 mb-4">
                    <ImageIcon className="h-4 w-4" />
                    <span>Upload Image</span>
                  </Button>

                  <h3 className="text-sm font-medium mb-3">Stock Images</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((image) => (
                      <div key={image.id} className="group relative cursor-pointer">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.name}
                          className="w-full h-auto rounded-md border border-border/50 object-cover aspect-square hover:border-primary/50 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <Button size="sm" variant="secondary" className="text-xs">
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sidebarTab === "templates" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Templates</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {sampleTemplates.map((template) => (
                      <div key={template.id} className="group relative cursor-pointer">
                        <img
                          src={template.thumbnail || "/placeholder.svg"}
                          alt={template.name}
                          className="w-full h-auto rounded-md border border-border/50 object-cover hover:border-primary/50 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <Button size="sm" variant="secondary" className="text-xs">
                            Use Template
                          </Button>
                        </div>
                        <p className="text-xs mt-1">{template.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Canvas Area */}
        <div
          className="flex-1 bg-muted/30 overflow-hidden relative"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-background/95 backdrop-blur-sm rounded-lg border shadow-md flex items-center p-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === "select" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-md"
                    onClick={() => handleToolSelect("select")}
                  >
                    <MousePointer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Select (V)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === "hand" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-md"
                    onClick={() => handleToolSelect("hand")}
                  >
                    <Hand className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hand Tool (H)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === "text" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-md"
                    onClick={() => handleToolSelect("text")}
                  >
                    <Text className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Text (T)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === "rectangle" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-md"
                    onClick={() => handleToolSelect("rectangle")}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rectangle (R)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === "circle" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-md"
                    onClick={() => handleToolSelect("circle")}
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Circle (C)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-md" onClick={() => {}}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Image (I)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <div className="flex items-center gap-1 px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs w-10 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showGrid ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-md"
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Grid</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Canvas */}
          <div
            className="absolute transform origin-center transition-transform"
            style={{
              left: `${canvasPosition.x}px`,
              top: `${canvasPosition.y}px`,
              transform: `scale(${zoom / 100})`,
              cursor: activeTool === "hand" ? (isDragging ? "grabbing" : "grab") : "default",
            }}
          >
            <div
              ref={canvasRef}
              className={cn(
                "bg-white rounded-md shadow-xl border border-border/50 relative",
                showGrid && "bg-grid-pattern",
              )}
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
              }}
            >
              {/* Render canvas elements here */}
              {elements.map((element) => {
                if (element.type === "text") {
                  return (
                    <div
                      key={element.id}
                      className={cn(
                        "absolute cursor-move",
                        selectedElement === element.id && "ring-2 ring-primary ring-offset-2",
                      )}
                      style={{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        width: `${element.width}px`,
                        height: `${element.height}px`,
                        color: element.color,
                        fontSize: `${element.fontSize}px`,
                      }}
                      onClick={() => handleElementSelect(element.id)}
                    >
                      {element.content}
                    </div>
                  )
                }
                if (element.type === "rectangle") {
                  return (
                    <div
                      key={element.id}
                      className={cn(
                        "absolute cursor-move",
                        selectedElement === element.id && "ring-2 ring-primary ring-offset-2",
                      )}
                      style={{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        width: `${element.width}px`,
                        height: `${element.height}px`,
                        backgroundColor: element.color,
                      }}
                      onClick={() => handleElementSelect(element.id)}
                    />
                  )
                }
                if (element.type === "circle") {
                  return (
                    <div
                      key={element.id}
                      className={cn(
                        "absolute rounded-full cursor-move",
                        selectedElement === element.id && "ring-2 ring-primary ring-offset-2",
                      )}
                      style={{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        width: `${element.radius * 2}px`,
                        height: `${element.radius * 2}px`,
                        backgroundColor: element.color,
                      }}
                      onClick={() => handleElementSelect(element.id)}
                    />
                  )
                }
                return null
              })}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg border shadow-md p-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider value={[zoom]} min={50} max={200} step={10} className="w-24" onValueChange={handleZoomChange} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Layers Panel Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-full shadow-md h-10 w-10"
            onClick={() => setShowRightPanel(!showRightPanel)}
          >
            <Layers className="h-5 w-5" />
          </Button>
        </div>

        {/* Right Properties Panel */}
        {showRightPanel && (
          <div className="w-64 border-l bg-background/95 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Properties</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setShowRightPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              {selectedElement ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Position & Size</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="pos-x" className="text-xs">
                          X
                        </Label>
                        <Input id="pos-x" value="100" className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pos-y" className="text-xs">
                          Y
                        </Label>
                        <Input id="pos-y" value="100" className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="width" className="text-xs">
                          Width
                        </Label>
                        <Input id="width" value="200" className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="height" className="text-xs">
                          Height
                        </Label>
                        <Input id="height" value="100" className="h-8" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Appearance</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="fill-color" className="text-xs">
                          Fill Color
                        </Label>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: "#4f46e5" }} />
                          <Input id="fill-color" value="#4f46e5" className="h-8 flex-1" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="opacity" className="text-xs">
                          Opacity
                        </Label>
                        <div className="flex items-center gap-2">
                          <Slider value={[100]} min={0} max={100} step={1} className="flex-1" />
                          <span className="text-xs w-8 text-right">100%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="border" className="text-xs">
                            Border
                          </Label>
                          <Switch id="border" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text specific properties */}
                  {elements.find((e) => e.id === selectedElement)?.type === "text" && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Text</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                            <Underline className="h-4 w-4" />
                          </Button>
                          <Separator orientation="vertical" className="h-6 mx-1" />
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                            <AlignRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="font-size" className="text-xs">
                            Font Size
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input id="font-size" value="24" className="h-8" />
                            <span className="text-xs">px</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="text-color" className="text-xs">
                            Text Color
                          </Label>
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: "#000000" }} />
                            <Input id="text-color" value="#000000" className="h-8 flex-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-3">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Element</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Crop className="h-4 w-4" />
                        <span>Crop</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Move className="h-4 w-4" />
                        <span>Bring to Front</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Canvas</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="canvas-width" className="text-xs">
                            Width
                          </Label>
                          <Input
                            id="canvas-width"
                            value={canvasSize.width}
                            onChange={(e) => setCanvasSize({ ...canvasSize, width: Number(e.target.value) })}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="canvas-height" className="text-xs">
                            Height
                          </Label>
                          <Input
                            id="canvas-height"
                            value={canvasSize.height}
                            onChange={(e) => setCanvasSize({ ...canvasSize, height: Number(e.target.value) })}
                            className="h-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-grid" className="text-xs">
                            Show Grid
                          </Label>
                          <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="bg-color" className="text-xs">
                          Background Color
                        </Label>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: "#ffffff" }} />
                          <Input id="bg-color" value="#ffffff" className="h-8 flex-1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Layers</h4>
                    <div className="space-y-1 border rounded-md divide-y">
                      {elements.map((element, index) => (
                        <div
                          key={element.id}
                          className={cn(
                            "flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50",
                            selectedElement === element.id && "bg-muted",
                          )}
                          onClick={() => handleElementSelect(element.id)}
                        >
                          <div className="flex items-center gap-2">
                            {element.type === "text" ? (
                              <Text className="h-4 w-4" />
                            ) : element.type === "rectangle" ? (
                              <Square className="h-4 w-4" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                            <span className="text-sm">
                              {element.type} {elements.length - index}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
