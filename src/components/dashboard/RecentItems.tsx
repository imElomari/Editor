"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { cn } from "../../lib/utils"
import { Icons } from "../../lib/constances"
import { useTranslation } from "react-i18next"
import { useMobile } from "../../hooks/use-mobile"
import { CheckCircle2, PenTool } from "lucide-react"
import { getAssetTypeLabel, getStorageUrl } from "../../lib/utils"
import type { Project, Label, Asset } from "../../lib/types"
import type { NavigateFunction } from "react-router-dom"

import { useState, useEffect } from "react"

export function RecentItemsSkeleton() {
  return (
    <Card className="overflow-hidden border-t-4 border-t-primary/50">
      {/* Header Skeleton */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted/60 rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted/40 rounded animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-muted/50 rounded-md animate-pulse" />
        </div>
      </CardHeader>

      {/* Content Skeleton */}
      <CardContent>
        <div className="space-y-4">
          {/* Tabs Skeleton */}
          <div className="flex gap-2 p-1 bg-muted/50 w-fit rounded-lg">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-muted/40 rounded animate-pulse" />
            ))}
          </div>

          {/* Items Skeleton */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="h-10 w-10 rounded-md bg-muted/40 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-muted/40 rounded animate-pulse" />
                </div>
                <div className="h-8 w-8 rounded-full bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
interface RecentItemsProps {
  projects: Project[]
  labels: (Label & { projects?: { name: string } })[]
  assets: Asset[]
  isRTL: boolean
  handleCreateLabel: () => void
  handleCreateProject: () => void
  navigate: NavigateFunction
}

export default function RecentItems({
  projects,
  labels,
  assets,
  isRTL,
  handleCreateLabel,
  handleCreateProject,
  navigate,
}: RecentItemsProps) {
  const isMobile = useMobile()
  const { t, i18n } = useTranslation(["common", "dashboard", "projects", "labels", "assets"])
  const [isLoading, setIsLoading] = useState(true)

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return t("dashboard:time.now")
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t("dashboard:time.minutesAgo")}`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t("dashboard:time.hoursAgo")}`
    if (diffInSeconds < 172800) return t("dashboard:time.yesterday")
    return date.toLocaleDateString(i18n.language)
  }

  const getStatusIcon = (status: Label["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{t("common:filter.status.published")}</span>
          </Badge>
        )
      case "archived":
        return (
          <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20 flex items-center gap-1">
            <Icons.archive className="h-3 w-3" />
            <span>{t("common:filter.status.archived")}</span>
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
            <PenTool className="h-3 w-3" />
            <span>{t("common:filter.status.draft")}</span>
          </Badge>
        )
    }
  }

  const openProject = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const openLabel = (labelId: string) => {
    navigate(`/editor/${labelId}`)
  }

  // Simulate loading state on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100) // Adjust timing as needed

    return () => clearTimeout(timer)
  }, [])

  // Show skeleton while loading or if data is not yet available
  if (isLoading || !projects || !labels || !assets) {
    return <RecentItemsSkeleton />
  }
  
  return (
    <Tabs defaultValue="projects" className="space-y-6">
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
      <TabsList className={cn("bg-muted/50 p-1 rounded-xl", isRTL && "flex flex-row-reverse")}>
          <TabsTrigger
            value="projects"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Icons.project className="h-4 w-4" />
            <span>{t("common:sidePanel.navigation.projects")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="labels"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Icons.labels className="h-4 w-4" />
            <span>{t("common:sidePanel.navigation.labels")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Icons.asset className="h-4 w-4" />
            <span>{t("common:sidePanel.navigation.assets")}</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="labels" className="m-0 space-y-4">
        <Card className="overflow-hidden border-t-4 border-t-primary/50">
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between pb-3",
              isMobile && "px-4 py-3",
              isRTL && "flex-row-reverse",
            )}
          >
            <div>
              <CardTitle className={cn("text-xl flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Icons.labels className="h-5 w-5 text-primary" />
                {t("dashboard:recent.labels.title")}
              </CardTitle>
              <CardDescription>{t("dashboard:recent.labels.description")}</CardDescription>
            </div>
            {!isMobile && (
              <Button onClick={handleCreateLabel} variant="outline" size="sm">
                <Icons.plus className={cn("h-4 w-4", isRTL ? "ms-2" : "me-2")} />
                {t("dashboard:recent.labels.action")}
              </Button>
            )}
          </CardHeader>
          <CardContent className={isMobile ? "px-4 py-2" : undefined}>
            {labels.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                  <Icons.labels className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary/70 relative z-10" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-1">{t("dashboard:recent.labels.noLabels")}</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto px-4">
                  {t("dashboard:recent.labels.createDescription")}
                </p>
                <Button onClick={handleCreateLabel} className="shadow-sm">
                  <Icons.plus className={cn("h-4 w-4", isRTL ? "ms-2" : "me-2")} />
                  {t("dashboard:recent.labels.createFirst")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {labels.map((label, index) => (
                  <div key={label.id}>
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm",
                        isRTL && "flex-row-reverse",
                      )}
                      onClick={() => openLabel(label.id)}
                    >
                      <div className={cn("flex items-center gap-3 min-w-0", isRTL && "flex-row-reverse")}>
                        <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 border border-border/50 shadow-sm">
                          {label.preview_url ? (
                            <img
                              src={label.preview_url || "/placeholder.svg"}
                              alt={label.name}
                              className="h-full w-full object-cover rounded-md"
                            />
                          ) : (
                            <Icons.labels className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div
                            className={cn("font-medium flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}
                          >
                            <span className="truncate">{label.name}</span>
                            {getStatusIcon(label.status)}
                          </div>
                          <div
                            className={cn(
                              "text-sm text-muted-foreground flex items-center gap-2 flex-wrap",
                              isRTL && "flex-row-reverse",
                            )}
                          >
                            <span className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                              <Icons.clock className={cn("h-3 w-3 flex-shrink-0", isRTL ? "ms-1" : "me-1")} />
                              {formatRelativeTime(label.updated_at)}
                            </span>
                            {label.projects && (
                              <span className={cn("inline-flex items-center", isRTL && "flex-row-reverse")}>
                                <span className="mx-1 hidden sm:inline">•</span>
                                <Icons.project className={cn("h-3 w-3 flex-shrink-0", isRTL ? "ms-1" : "me-1")} />
                                <span className="truncate">{label.projects.name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <PenTool className="h-4 w-4" />
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                          <Icons.chevronRight
                            className={cn("h-4 w-4 text-muted-foreground flex-shrink-0", isRTL && "rotate-180")}
                          />
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
                    className={cn(
                      "w-full justify-between mt-4 text-muted-foreground hover:text-foreground group",
                      isRTL && "flex-row-reverse",
                    )}
                    onClick={() => navigate("/labels")}
                  >
                    <span>{t("dashboard:recent.labels.viewAll")}</span>
                    <Icons.arrowRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isRTL ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1",
                      )}
                    />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="projects" className="m-0 space-y-4">
        <Card className="overflow-hidden border-t-4 border-t-blue-500/50">
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between pb-3",
              isMobile && "px-4 py-3",
              isRTL && "flex-row-reverse",
            )}
          >
            <div>
              <CardTitle className={cn("text-xl flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Icons.project className="h-5 w-5 text-blue-500" />
                {t("dashboard:recent.projects.title")}
              </CardTitle>
              <CardDescription>{t("dashboard:recent.projects.description")}</CardDescription>
            </div>
            {!isMobile && (
              <Button onClick={handleCreateProject} variant="outline" size="sm">
                <Icons.plus className={cn("h-4 w-4", isRTL ? "ms-2" : "me-2")} />
                {t("dashboard:recent.projects.action")}
              </Button>
            )}
          </CardHeader>
          <CardContent className={isMobile ? "px-4 py-2" : undefined}>
            {projects.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
                  <Icons.project className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-blue-500/70 relative z-10" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-1">{t("dashboard:recent.projects.noProjects")}</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto px-4">
                  {t("dashboard:recent.projects.createDescription")}
                </p>
                <Button onClick={handleCreateProject} className="shadow-sm">
                  <Icons.plus className={cn("h-4 w-4", isRTL ? "ms-2" : "me-2")} />
                  {t("dashboard:recent.projects.createFirst")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project, index) => (
                  <div key={project.id}>
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm",
                        isRTL && "flex-row-reverse",
                      )}
                      onClick={() => openProject(project.id)}
                    >
                      <div className={cn("flex items-center gap-3 min-w-0", isRTL && "flex-row-reverse")}>
                        <div className="h-10 w-10 rounded-md bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center flex-shrink-0 border border-border/50 shadow-sm">
                          <Icons.project className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{project.name}</div>
                          <div
                            className={cn(
                              "text-sm text-muted-foreground flex items-center gap-2 flex-wrap",
                              isRTL && "flex-row-reverse",
                            )}
                          >
                            <span className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                              <Icons.clock className={cn("h-3 w-3 flex-shrink-0", isRTL ? "ms-1" : "me-1")} />
                              {formatRelativeTime(project.updated_at)}
                            </span>
                            {project.description && (
                              <span className={cn("inline-flex items-center", isRTL && "flex-row-reverse")}>
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
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <PenTool className="h-4 w-4" />
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                          <Icons.chevronRight
                            className={cn("h-4 w-4 text-muted-foreground flex-shrink-0", isRTL && "rotate-180")}
                          />
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
                    className={cn(
                      "w-full justify-between mt-4 text-muted-foreground hover:text-foreground group",
                      isRTL && "flex-row-reverse",
                    )}
                    onClick={() => navigate("/projects")}
                  >
                    <span>{t("dashboard:recent.projects.viewAll")}</span>
                    <Icons.arrowRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isRTL ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1",
                      )}
                    />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assets" className="m-0 space-y-4">
        <Card className="overflow-hidden border-t-4 border-t-green-500/50">
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between pb-3",
              isMobile && "px-4 py-3",
              isRTL && "flex-row-reverse",
            )}
          >
            <div>
              <CardTitle className={cn("text-xl flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Icons.asset className="h-5 w-5 text-green-500" />
                {t("dashboard:recent.assets.title")}
              </CardTitle>
              <CardDescription>{t("dashboard:recent.assets.description")}</CardDescription>
            </div>
            {!isMobile && (
              <Button onClick={() => navigate("/assets/upload")} variant="outline" size="sm">
                <Icons.plus className={cn("h-4 w-4", isRTL ? "ms-2" : "me-2")} />
                {t("dashboard:recent.assets.action")}
              </Button>
            )}
          </CardHeader>
          <CardContent className={isMobile ? "px-4 py-2" : undefined}>
            {assets.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 bg-green-500/10 rounded-full animate-pulse"></div>
                  <Icons.asset className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-green-500/70 relative z-10" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-1">{t("dashboard:recent.assets.noAssets")}</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto px-4">
                  {t("dashboard:recent.assets.uploadDescription")}
                </p>
                <Button onClick={() => navigate("/assets/upload")} className="shadow-sm">
                  <Icons.plus className={cn("h-4 w-4", isRTL ? "ms-2" : "me-2")} />
                  {t("dashboard:recent.assets.uploadFirst")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {assets.map((asset, index) => (
                  <div key={asset.id}>
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-all duration-200 hover:shadow-sm",
                        isRTL && "flex-row-reverse",
                      )}
                    >
                      <div className={cn("flex items-center gap-3 min-w-0", isRTL && "flex-row-reverse")}>
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {asset.type?.startsWith("image/") ? (
                            <img
                              src={getStorageUrl(asset.metadata?.storagePath || "")}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-image.png"
                              }}
                            />
                          ) : (
                            <Icons.file className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{asset.name}</div>
                          <div
                            className={cn(
                              "text-sm text-muted-foreground flex items-center gap-2",
                              isRTL && "flex-row-reverse",
                            )}
                          >
                            <span className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                              <Icons.clock className={cn("h-3 w-3", isRTL ? "ms-1" : "me-1")} />
                              {formatRelativeTime(asset.created_at)}
                            </span>
                            <span className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                              <span className="mx-1">•</span>
                              {getAssetTypeLabel(asset.type || "")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < assets.length - 1 && <Separator className="my-1 opacity-50" />}
                  </div>
                ))}

                {assets.length > 0 && (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between mt-4 text-muted-foreground hover:text-foreground group",
                      isRTL && "flex-row-reverse",
                    )}
                    onClick={() => navigate("/assets")}
                  >
                    <span>{t("dashboard:recent.assets.viewAll")}</span>
                    <Icons.arrowRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isRTL ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1",
                      )}
                    />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
