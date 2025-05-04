"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import {
  Clock,
  Plus,
  Loader2,
  ArrowRight,
  Tag,
  FolderKanban,
  LayoutDashboard,
  Sparkles,
  Calendar,
  BarChart3,
  ChevronRight,
  TrendingUp,
  Zap,
  Bookmark,
  CheckCircle2,
  Archive,
  PenTool,
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import type { Project, Label } from "../lib/types"
import { ProjectDialog } from "../components/ProjectDialog"
import { LabelDialog } from "../components/LabelDialog"
import { useMobile } from "../hooks/use-mobile"
import { cn } from "../lib/utils"

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [labels, setLabels] = useState<(Label & { projects?: { name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalLabels: 0,
    recentActivity: 0,
    publishedLabels: 0,
  })
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false)
  const isMobile = useMobile()

  // Fetch user's data
  const fetchData = async () => {
    try {
      if (!user) return
      setLoading(true)

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(5)

      if (projectsError) throw projectsError
      setProjects(projectsData || [])

      // Fetch labels
      const { data: labelsData, error: labelsError } = await supabase
        .from("labels")
        .select("*, projects(name)")
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(5)

      if (labelsError) throw labelsError
      setLabels(labelsData || [])

      // Get total counts
      const { count: projectsCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .is("deleted_at", null)

      const { count: labelsCount } = await supabase
        .from("labels")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .is("deleted_at", null)

      // Get published labels count
      const { count: publishedCount } = await supabase
        .from("labels")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("status", "published")
        .is("deleted_at", null)

      // Get recent activity count (items updated in the last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { count: recentLabelsCount } = await supabase
        .from("labels")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .gte("updated_at", sevenDaysAgo.toISOString())

      setStats({
        totalProjects: projectsCount || 0,
        totalLabels: labelsCount || 0,
        recentActivity: recentLabelsCount || 0,
        publishedLabels: publishedCount || 0,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleCreateProject = () => {
    setIsProjectDialogOpen(true)
  }

  const handleCreateLabel = () => {
    setIsLabelDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    fetchData()
    toast.success("Created successfully!")
  }

  const openProject = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const openLabel = (labelId: string) => {
    navigate(`/editor/${labelId}`)
  }

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Get first name from email or metadata
  const getFirstName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(" ")[0]
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "there"
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 172800) return "Yesterday"
    return date.toLocaleDateString()
  }

  const getStatusIcon = (status: Label["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Published</span>
          </Badge>
        )
      case "archived":
        return (
          <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20 flex items-center gap-1">
            <Archive className="h-3 w-3" />
            <span>Archived</span>
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
            <PenTool className="h-3 w-3" />
            <span>Draft</span>
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
            <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header with greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-2 sm:gap-4">
        <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full hidden sm:block"></div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {getGreeting()}, <span className="text-primary">{getFirstName()}</span>
            </h1>
          </div>
          <p className="text-muted-foreground ml-0 sm:ml-3">Here's what's happening with your labels today</p>
        </div>


      </div>

      {/* Stats Cards - Enhanced with better gradients and animations */}
      <div className={cn("grid gap-4 mb-8", isMobile ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
        <Card className={cn("overflow-hidden relative group")}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Labels</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Tag className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">{stats.totalLabels}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                {stats.publishedLabels} published
              </Badge>
              {stats.publishedLabels > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <FolderKanban className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">{stats.totalProjects}</div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>Organize your work</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5 opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">{stats.recentActivity}</div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>In the last 7 days</span>
            </p>
          </CardContent>
        </Card>

        <Card
          className="overflow-hidden relative group cursor-pointer hover:shadow-md transition-all duration-300"
          onClick={handleCreateLabel}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5 opacity-80 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Quick Create</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <Button
              variant="ghost"
              className="pl-0 group-hover:text-purple-500 transition-colors flex items-center gap-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
                <Plus className="h-4 w-4 relative z-10" />
              </div>
              <span className="font-medium">New Label</span>
            </Button>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>Start creating now</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items - Enhanced with better styling */}
      <Tabs defaultValue="labels" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="labels"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Tag className="h-4 w-4" />
              <span>Labels</span>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FolderKanban className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
          </TabsList>

        </div>

        <TabsContent value="labels" className="m-0 space-y-4">
          <Card className="overflow-hidden border-t-4 border-t-primary/50">
            <CardHeader className={cn("flex flex-row items-center justify-between pb-3", isMobile && "px-4 py-3")}>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Recent Labels
                </CardTitle>
                <CardDescription>Your recently updated labels</CardDescription>
              </div>
              {!isMobile && (
                <Button onClick={handleCreateLabel} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Label
                </Button>
              )}
            </CardHeader>
            <CardContent className={isMobile ? "px-4 py-2" : undefined}>
              {labels.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg bg-muted/20">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                    <Tag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary/70 relative z-10" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-1">No labels created yet</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto px-4">
                    Create your first label to get started with your design process.
                  </p>
                  <Button onClick={handleCreateLabel} className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Label
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {labels.map((label, index) => (
                    <div key={label.id}>
                      <div
                        className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm"
                        onClick={() => openLabel(label.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 border border-border/50 shadow-sm">
                            {label.preview_url ? (
                              <img
                                src={label.preview_url || "/placeholder.svg"}
                                alt={label.name}
                                className="h-full w-full object-cover rounded-md"
                              />
                            ) : (
                              <Tag className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium flex items-center gap-2 flex-wrap">
                              <span className="truncate">{label.name}</span>
                              {getStatusIcon(label.status)}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                {formatRelativeTime(label.updated_at)}
                              </span>
                              {label.projects && (
                                <span className="inline-flex items-center">
                                  <span className="mx-1 hidden sm:inline">•</span>
                                  <FolderKanban className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{label.projects.name}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <PenTool className="h-4 w-4" />
                          </Button>
                          <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                      {index < labels.length - 1 && <Separator className="my-1 opacity-50" />}
                    </div>
                  ))}

                  {/* View All Link */}
                  {labels.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full justify-between mt-4 text-muted-foreground hover:text-foreground group"
                      onClick={() => navigate("/labels")}
                    >
                      <span>View all labels</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="m-0 space-y-4">
          <Card className="overflow-hidden border-t-4 border-t-blue-500/50">
            <CardHeader className={cn("flex flex-row items-center justify-between pb-3", isMobile && "px-4 py-3")}>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-blue-500" />
                  Recent Projects
                </CardTitle>
                <CardDescription>Your recently updated projects</CardDescription>
              </div>
              {!isMobile && (
                <Button onClick={handleCreateProject} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              )}
            </CardHeader>
            <CardContent className={isMobile ? "px-4 py-2" : undefined}>
              {projects.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg bg-muted/20">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
                    <FolderKanban className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-blue-500/70 relative z-10" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-1">No projects created yet</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto px-4">
                    Projects help you organize your labels into collections.
                  </p>
                  <Button onClick={handleCreateProject} className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project, index) => (
                    <div key={project.id}>
                      <div
                        className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm"
                        onClick={() => openProject(project.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center flex-shrink-0 border border-border/50 shadow-sm">
                            <FolderKanban className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{project.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                {formatRelativeTime(project.updated_at)}
                              </span>
                              {project.description && (
                                <span className="inline-flex items-center">
                                  <span className="mx-1 hidden sm:inline">•</span>
                                  <span className="truncate">
                                    {project.description.substring(0, 30)}
                                    {project.description.length > 30 ? "..." : ""}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <PenTool className="h-4 w-4" />
                          </Button>
                          <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                      {index < projects.length - 1 && <Separator className="my-1 opacity-50" />}
                    </div>
                  ))}

                  {/* View All Link */}
                  {projects.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full justify-between mt-4 text-muted-foreground hover:text-foreground group"
                      onClick={() => navigate("/projects")}
                    >
                      <span>View all projects</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions - Enhanced with better styling */}
      <div className="mt-8 sm:mt-10">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="h-px bg-border flex-1"></div>
        </div>
        <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "md:grid-cols-4")}>
          <Card
            className="group cursor-pointer hover:bg-muted/30 transition-all duration-300 hover:shadow-md border-primary/20 hover:border-primary/40"
            onClick={handleCreateLabel}
          >
            <CardContent
              className={cn(
                "flex flex-col items-center text-center relative overflow-hidden",
                isMobile ? "p-4" : "p-6",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                <Tag className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                <div className="absolute inset-0 rounded-full border border-primary/20 group-hover:border-primary/40 transition-colors"></div>
              </div>
              <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">New Label</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Create a new label design</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:bg-muted/30 transition-all duration-300 hover:shadow-md border-blue-500/20 hover:border-blue-500/40"
            onClick={handleCreateProject}
          >
            <CardContent
              className={cn(
                "flex flex-col items-center text-center relative overflow-hidden",
                isMobile ? "p-4" : "p-6",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                <FolderKanban className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                <div className="absolute inset-0 rounded-full border border-blue-500/20 group-hover:border-blue-500/40 transition-colors"></div>
              </div>
              <h3 className="font-medium text-lg mb-2 group-hover:text-blue-500 transition-colors">New Project</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Create a project collection</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:bg-muted/30 transition-all duration-300 hover:shadow-md border-amber-500/20 hover:border-amber-500/40"
            onClick={() => navigate("/labels")}
          >
            <CardContent
              className={cn(
                "flex flex-col items-center text-center relative overflow-hidden",
                isMobile ? "p-4" : "p-6",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7 text-amber-500" />
                <div className="absolute inset-0 rounded-full border border-amber-500/20 group-hover:border-amber-500/40 transition-colors"></div>
              </div>
              <h3 className="font-medium text-lg mb-2 group-hover:text-amber-500 transition-colors">All Labels</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">View all your labels</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:bg-muted/30 transition-all duration-300 hover:shadow-md border-purple-500/20 hover:border-purple-500/40"
            onClick={() => navigate("/projects")}
          >
            <CardContent
              className={cn(
                "flex flex-col items-center text-center relative overflow-hidden",
                isMobile ? "p-4" : "p-6",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" />
                <div className="absolute inset-0 rounded-full border border-purple-500/20 group-hover:border-purple-500/40 transition-colors"></div>
              </div>
              <h3 className="font-medium text-lg mb-2 group-hover:text-purple-500 transition-colors">All Projects</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage your projects</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      <LabelDialog
        isOpen={isLabelDialogOpen}
        onClose={() => setIsLabelDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
