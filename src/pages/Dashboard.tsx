"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardHeader } from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { toast } from "sonner"
import { ProjectDialog } from "../components/ProjectDialog"
import { LabelDialog } from "../components/LabelDialog"
import { cn } from "../lib/utils"
import { AssetUploadDialog } from "../components/AssetUploadDialog"
import { Icons } from "../lib/constances"
import { useTranslation } from "react-i18next"
import type { Project, Label, Asset } from "../lib/types"
import { RecentItemsSkeleton } from "../components/dashboard/RecentItems"

// Lazy load components
const StatsCards = lazy(() => import("../components/dashboard/StatsCards"))
const RecentItems = lazy(() => import("../components/dashboard/RecentItems"))

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false) // Fixed: was incorrectly destructured
  const [projects, setProjects] = useState<Project[]>([])
  const [labels, setLabels] = useState<(Label & { projects?: { name: string } })[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalLabels: 0,
    recentActivity: 0,
    publishedLabels: 0,
    totalAssets: 0,
  })

  const { t, i18n } = useTranslation(["common", "dashboard", "projects", "labels", "assets"])
  const isRTL = i18n.language === "ar"

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

      // Add to fetchData function
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (assetsError) throw assetsError
      setAssets(assetsData || [])

      //  fetch assets count
      const { count: assetsCount } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)

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
        totalAssets: assetsCount || 0,
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

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t("dashboard:greeting.morning")
    if (hour < 18) return t("dashboard:greeting.afternoon")
    return t("dashboard:greeting.evening")
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

  // Loading placeholders
  const StatsLoadingPlaceholder = () => (
    <div className="grid gap-4 mb-8 grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background to-background/50 animate-pulse" />
          <CardHeader className="pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )



  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
            <Icons.loading className="h-12 w-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-lg font-medium">{t("dashboard:loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header with greeting */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-2 sm:gap-4",
          isRTL && "rtl",
        )}
      >
        <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full hidden sm:block"></div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {getGreeting()}, <span className="text-primary">{getFirstName()}</span>
            </h1>
          </div>
          <p className={cn("text-muted-foreground", isRTL ? "sm:me-3" : "sm:ms-3")}>
            {t("dashboard:greeting.summary")}
          </p>
        </div>
      </div>

      {/* Stats Cards with Suspense */}
      <Suspense fallback={<StatsLoadingPlaceholder />}>
        <StatsCards stats={stats} isRTL={isRTL} handleCreateLabel={handleCreateLabel} />
      </Suspense>

      {/* Recent Items with Suspense */}
      <Suspense fallback={<RecentItemsSkeleton />}>
        {loading ? (
          <RecentItemsSkeleton />
        ) : (
          <RecentItems
            projects={projects}
            labels={labels}
            assets={assets}
            isRTL={isRTL}
            handleCreateLabel={handleCreateLabel}
            handleCreateProject={handleCreateProject}
            navigate={navigate}
          />
        )}
      </Suspense>

      {/* Quick Actions */}
      <div className="mt-8 sm:mt-10">
        <div className={cn("flex items-center gap-3 mb-6", isRTL && "rtl")}>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{t("dashboard:quickActions.title")}</h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <div className={cn("grid gap-4", "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6")}>
          {/* Create Project Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-primary/20 hover:border-primary/40 relative overflow-hidden"
            onClick={handleCreateProject}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icons.newProject className="h-6 w-6 text-primary" />
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-1 w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center",
                      isRTL ? "-left-1" : "-right-1",
                    )}
                  >
                    <Icons.plus className="h-3 w-3 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {t("dashboard:quickActions.projects.create")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard:quickActions.projects.description")}
                  </p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Card>

          {/* Create Label Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-blue-500/20 hover:border-blue-500/40 relative overflow-hidden"
            onClick={handleCreateLabel}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icons.labels className="h-6 w-6 text-blue-500" />
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-1 w-4 h-4 bg-blue-500/10 rounded-full flex items-center justify-center",
                      isRTL ? "-left-1" : "-right-1",
                    )}
                  >
                    <Icons.plus className="h-3 w-3 text-blue-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-blue-500 transition-colors">
                    {t("dashboard:quickActions.labels.create")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{t("dashboard:quickActions.labels.description")}</p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Card>

          {/* Upload Asset Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-green-500/20 hover:border-green-500/40 relative overflow-hidden"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icons.upload className="h-6 w-6 text-green-500" />
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-1 w-4 h-4 bg-green-500/10 rounded-full flex items-center justify-center",
                      isRTL ? "-left-1" : "-right-1",
                    )}
                  >
                    <Icons.plus className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-green-500 transition-colors">
                    {t("dashboard:quickActions.assets.create")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{t("dashboard:quickActions.assets.description")}</p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Card>

          {/* View Assets Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-teal-500/20 hover:border-teal-500/40 relative overflow-hidden"
            onClick={() => navigate("/assets")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icons.library className="h-6 w-6 text-teal-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-teal-500 transition-colors">
                    {t("dashboard:quickActions.assets.viewAll")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard:quickActions.assets.viewAllDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Card>

          {/* View Labels Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-violet-500/20 hover:border-violet-500/40 relative overflow-hidden"
            onClick={() => navigate("/labels")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icons.labels className="h-6 w-6 text-violet-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-violet-500 transition-colors">
                    {t("dashboard:quickActions.labels.viewAll")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard:quickActions.labels.viewAllDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Card>

          {/* View Projects Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-amber-500/20 hover:border-amber-500/40 relative overflow-hidden"
            onClick={() => navigate("/projects")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icons.project className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-amber-500 transition-colors">
                    {t("dashboard:quickActions.projects.viewAll")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard:quickActions.projects.viewAllDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
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

      <AssetUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={() => {
          setIsUploadDialogOpen(false)
          fetchData()
        }}
      />
    </div>
  )
}
