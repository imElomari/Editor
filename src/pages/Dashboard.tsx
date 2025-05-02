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
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import type { Project, Label } from "../lib/types"
import { ProjectDialog } from "../components/ProjectDialog"
import { LabelDialog } from "../components/LabelDialog"

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
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Published</Badge>
      case "archived":
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Archived</Badge>
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Draft</Badge>
    }
  }


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
    {/* Header with greeting and warning */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
      <div className="space-y-4 w-full sm:w-auto">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {getGreeting()}, <span className="text-primary">{getFirstName()}</span>
        </h1>
      </div>
    </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Labels</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <Tag className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalLabels}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.publishedLabels} published</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <FolderKanban className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Organize your work</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-full">
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground mt-1">In the last 7 days</p>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20 cursor-pointer hover:bg-purple-500/20 transition-colors group"
          onClick={handleCreateLabel}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Quick Create</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-start">
            <Button variant="ghost" className="pl-0 group-hover:text-purple-500 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Label
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <Tabs defaultValue="labels" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="labels" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Labels</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="labels" className="m-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recent Labels</CardTitle>
                <CardDescription>Your recently updated labels</CardDescription>
              </div>
              <Button onClick={handleCreateLabel}>
                <Plus className="h-4 w-4 mr-2" />
                New Label
              </Button>
            </CardHeader>
            <CardContent>
              {labels.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No labels created yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Create your first label to get started with your design process.
                  </p>
                  <Button onClick={handleCreateLabel}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Label
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => openLabel(label.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center">
                          {label.preview_url ? (
                            <img
                              src={label.preview_url || "/placeholder.svg"}
                              alt={label.name}
                              className="h-full w-full object-cover rounded-md"
                            />
                          ) : (
                            <Tag className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {label.name}
                            {getStatusIcon(label.status)}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(label.updated_at)}
                            {label.projects && (
                              <span className="inline-flex items-center">
                                <span className="mx-1">•</span>
                                <FolderKanban className="h-3 w-3 mr-1" />
                                {label.projects.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="m-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your recently updated projects</CardDescription>
              </div>
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No projects created yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Projects help you organize your labels into collections.
                  </p>
                  <Button onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => openProject(project.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-blue-500/10 flex items-center justify-center">
                          <FolderKanban className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(project.updated_at)}
                            {project.description && (
                              <span className="inline-flex items-center">
                                <span className="mx-1">•</span>
                                {project.description.substring(0, 30)}
                                {project.description.length > 30 ? "..." : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleCreateLabel}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">New Label</h3>
              <p className="text-sm text-muted-foreground">Create a new label design</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleCreateProject}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <FolderKanban className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-medium mb-1">New Project</h3>
              <p className="text-sm text-muted-foreground">Create a project collection</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/labels")}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                <LayoutDashboard className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-medium mb-1">All Labels</h3>
              <p className="text-sm text-muted-foreground">View all your labels</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/projects")}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-medium mb-1">All Projects</h3>
              <p className="text-sm text-muted-foreground">Manage your projects</p>
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
