"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { CheckCircle2, PenTool } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import type { Project, Label, Asset } from "../lib/types";
import { ProjectDialog } from "../components/ProjectDialog";
import { LabelDialog } from "../components/LabelDialog";
import { useMobile } from "../hooks/use-mobile";
import { cn, getAssetTypeLabel, getStorageUrl } from "../lib/utils";
import { AssetUploadDialog } from "../components/AssetUploadDialog";
import { Icons } from "../lib/constances";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [labels, setLabels] = useState<
    (Label & { projects?: { name: string } })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalLabels: 0,
    recentActivity: 0,
    publishedLabels: 0,
    totalAssets: 0,
  });
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const isMobile = useMobile();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const { t } = useTranslation(['common', 'dashboard', 'projects', 'labels', 'assets']);

  // Fetch user's data
  const fetchData = async () => {
    try {
      if (!user) return;
      setLoading(true);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch labels
      const { data: labelsData, error: labelsError } = await supabase
        .from("labels")
        .select("*, projects(name)")
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (labelsError) throw labelsError;
      setLabels(labelsData || []);

      // Add to fetchData function
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (assetsError) throw assetsError;
      setAssets(assetsData || []);

      //  fetch assets count
      const { count: assetsCount } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id);

      // Get total counts
      const { count: projectsCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .is("deleted_at", null);

      const { count: labelsCount } = await supabase
        .from("labels")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .is("deleted_at", null);

      // Get published labels count
      const { count: publishedCount } = await supabase
        .from("labels")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("status", "published")
        .is("deleted_at", null);

      // Get recent activity count (items updated in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentLabelsCount } = await supabase
        .from("labels")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .gte("updated_at", sevenDaysAgo.toISOString());

      setStats({
        totalProjects: projectsCount || 0,
        totalLabels: labelsCount || 0,
        recentActivity: recentLabelsCount || 0,
        publishedLabels: publishedCount || 0,
        totalAssets: assetsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateProject = () => {
    setIsProjectDialogOpen(true);
  };

  const handleCreateLabel = () => {
    setIsLabelDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchData();
    toast.success("Created successfully!");
  };

  const openProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const openLabel = (labelId: string) => {
    navigate(`/editor/${labelId}`);
  };

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard:greeting.morning')
    if (hour < 18) return t('dashboard:greeting.afternoon')
    return t('dashboard:greeting.evening')
  }

  // Get first name from email or metadata
  const getFirstName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(" ")[0];
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "there";
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t('dashboard:time.now');
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}t('dashboard:time.monthsAgo')`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}t('dashboard:time.hoursAgo')`;
    if (diffInSeconds < 172800) return t('dashboard:time.yesterday');
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: Label["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{t('common:filter.status.published')}</span>
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20 flex items-center gap-1">
            <Icons.archive className="h-3 w-3" />
            <span>{t('common:filter.status.archived')}</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
            <PenTool className="h-3 w-3" />
            <span>{t('common:filter.status.draft')}</span>
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
            <Icons.loading className="h-12 w-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header with greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-2 sm:gap-4">
        <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full hidden sm:block"></div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {getGreeting()},{" "}
              <span className="text-primary">{getFirstName()}</span>
            </h1>
          </div>
          <p className="text-muted-foreground ml-0 sm:ml-3">
          {t('dashboard:greeting.summary')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className={cn(
          "grid gap-4 mb-8",
          isMobile ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        <Card className={cn("overflow-hidden relative group")}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
              {t('dashboard:cards.labels.title')}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Icons.labels className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">
              {stats.totalLabels}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500 border-green-500/20"
              >
                {stats.publishedLabels} {t('common:filter.status.published')}
              </Badge>
              {stats.publishedLabels > 0 && (
                <Icons.trend className="h-4 w-4 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('dashboard:cards.projects.title')}</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Icons.project className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">
              {stats.totalProjects}
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Icons.mark className="h-4 w-4" />
              <span>{t('dashboard:cards.projects.subTitle')}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-500/5 opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('dashboard:cards.assets.title')}</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Icons.asset className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">
              {stats.totalAssets}
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Icons.file className="h-4 w-4" />
              <span>{t('dashboard:cards.assets.subTitle')}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5 opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
              {t('dashboard:cards.recent.title')}
              </CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Icons.calendar className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">
              {stats.recentActivity}
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Icons.clock className="h-4 w-4" />
              <span>{t('dashboard:cards.recent.subTitle')}</span>
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
              <CardTitle className="text-sm font-medium">
              {t('dashboard:cards.quickCreate.title')}
              </CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Icons.sparkle className="h-4 w-4 text-purple-500" />
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
                <Icons.plus className="h-4 w-4 relative z-10" />
              </div>
              <span className="font-medium">{t('dashboard:cards.quickCreate.action')}</span>
            </Button>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Icons.zap className="h-4 w-4" />
              <span>{t('dashboard:cards.quickCreate.comment')}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <Tabs defaultValue="projects" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="projects"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Icons.project className="h-4 w-4" />
              <span>{t('common:sidePanel.navigation.projects')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="labels"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Icons.labels className="h-4 w-4" />
              <span>{t('common:sidePanel.navigation.labels')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Icons.asset className="h-4 w-4" />
              <span>{t('common:sidePanel.navigation.assets')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="projects" className="m-0 space-y-4">
          <Card className="overflow-hidden border-t-4 border-t-blue-500/50">
            <CardHeader
              className={cn(
                "flex flex-row items-center justify-between pb-3",
                isMobile && "px-4 py-3"
              )}
            >
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Icons.project className="h-5 w-5 text-blue-500" />
                  {t('dashboard:recent.projects.title')}
                </CardTitle>
                <CardDescription>
                {t('dashboard:recent.projects.description')}
                </CardDescription>
              </div>
              {!isMobile && (
                <Button
                  onClick={handleCreateProject}
                  variant="outline"
                  size="sm"
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  {t('dashboard:recent.projects.action')}
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
                  <h3 className="text-base sm:text-lg font-medium mb-1">
                  {t('dashboard:recent.projects.noProjects')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto px-4">
                  {t('dashboard:recent.projects.createDescription')}
                  </p>
                  <Button onClick={handleCreateProject} className="shadow-sm">
                    <Icons.plus className="h-4 w-4 mr-2" />
                    {t('dashboard:recent.projects.createFirst')}
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
                            <Icons.project className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {project.name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span className="flex items-center">
                                <Icons.clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                {formatRelativeTime(project.updated_at)}
                              </span>
                              {project.description && (
                                <span className="inline-flex items-center">
                                  <span className="mx-1 hidden sm:inline">
                                    •
                                  </span>
                                  <span className="truncate">
                                    {project.description.substring(0, 30)}
                                    {project.description.length > 30
                                      ? "..."
                                      : ""}
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
                            <Icons.chevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                      {index < projects.length - 1 && (
                        <Separator className="my-1 opacity-50" />
                      )}
                    </div>
                  ))}

                  {/* View All Link */}
                  {projects.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full justify-between mt-4 text-muted-foreground hover:text-foreground group"
                      onClick={() => navigate("/projects")}
                    >
                      <span>{t('dashboard:recent.projects.viewAll')}</span>
                      <Icons.arrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="m-0 space-y-4">
          <Card className="overflow-hidden border-t-4 border-t-primary/50">
            <CardHeader
              className={cn(
                "flex flex-row items-center justify-between pb-3",
                isMobile && "px-4 py-3"
              )}
            >
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Icons.labels className="h-5 w-5 text-primary" />
                  {t('dashboard:recent.labels.title')}
                </CardTitle>
                <CardDescription>{t('dashboard:recent.labels.description')}</CardDescription>
              </div>
              {!isMobile && (
                <Button onClick={handleCreateLabel} variant="outline" size="sm">
                  <Icons.plus className="h-4 w-4 mr-2" />
                  {t('dashboard:recent.labels.action')}
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
                  <h3 className="text-base sm:text-lg font-medium mb-1">
                  {t('dashboard:recent.labels.noLabels')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto px-4">
                  {t('dashboard:recent.labels.createDescription')}
                  </p>
                  <Button onClick={handleCreateLabel} className="shadow-sm">
                    <Icons.plus className="h-4 w-4 mr-2" />
                    {t('dashboard:recent.labels.createFirst')}
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
                              <Icons.labels className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium flex items-center gap-2 flex-wrap">
                              <span className="truncate">{label.name}</span>
                              {getStatusIcon(label.status)}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span className="flex items-center">
                                <Icons.clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                {formatRelativeTime(label.updated_at)}
                              </span>
                              {label.projects && (
                                <span className="inline-flex items-center">
                                  <span className="mx-1 hidden sm:inline">
                                    •
                                  </span>
                                  <Icons.project className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {label.projects.name}
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
                            <Icons.chevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                      {index < labels.length - 1 && (
                        <Separator className="my-1 opacity-50" />
                      )}
                    </div>
                  ))}

                  {/* View All Link */}
                  {labels.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full justify-between mt-4 text-muted-foreground hover:text-foreground group"
                      onClick={() => navigate("/labels")}
                    >
                      <span>{t('dashboard:recent.labels.viewAll')}</span>
                      <Icons.arrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                isMobile && "px-4 py-3"
              )}
            >
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Icons.asset className="h-5 w-5 text-green-500" />
                  {t('dashboard:recent.assets.title')}
                </CardTitle>
                <CardDescription>{t('dashboard:recent.assets.description')}</CardDescription>
              </div>
              {!isMobile && (
                <Button
                  onClick={() => setIsUploadDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  {t('dashboard:recent.assets.action')}
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
                  <h3 className="text-base sm:text-lg font-medium mb-1">
                  {t('dashboard:recent.assets.noAssets')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto px-4">
                  {t('dashboard:recent.assets.uploadDescription')}
                  </p>
                  <Button
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="shadow-sm"
                  >
                    <Icons.plus className="h-4 w-4 mr-2" />
                    {t('dashboard:recent.assets.uploadFirst')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {assets.map((asset, index) => (
                    <div key={asset.id}>
                      <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-all duration-200 hover:shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {asset.type.startsWith("image/") ? (
                              <img
                                src={getStorageUrl(
                                  asset.metadata?.storagePath || ""
                                )}
                                alt={asset.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-image.png";
                                }}
                              />
                            ) : (
                              <Icons.file className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {asset.name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="flex items-center">
                                <Icons.clock className="h-3 w-3 mr-1" />
                                {formatRelativeTime(asset.created_at)}
                              </span>
                              <span className="flex items-center">
                                <span className="mx-1">•</span>
                                {getAssetTypeLabel(asset.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < assets.length - 1 && (
                        <Separator className="my-1 opacity-50" />
                      )}
                    </div>
                  ))}

                  {assets.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full justify-between mt-4 text-muted-foreground hover:text-foreground group"
                      onClick={() => navigate("/assets")}
                    >
                      <span>{t('dashboard:recent.assets.viewAll')}</span>
                      <Icons.arrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-8 sm:mt-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
          {t('dashboard:quickActions.title')}
          </h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <div
          className={cn(
            "grid gap-4",
            "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          )}
        >
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
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icons.plus className="h-3 w-3 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                  {t('dashboard:quickActions.projects.create')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard:quickActions.projects.description')}
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
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Icons.plus className="h-3 w-3 text-blue-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-blue-500 transition-colors">
                  {t('dashboard:quickActions.labels.create')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard:quickActions.labels.description')}
                  </p>
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
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Icons.plus className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-green-500 transition-colors">
                  {t('dashboard:quickActions.assets.create')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard:quickActions.assets.description')}
                  </p>
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
                  {t('dashboard:quickActions.assets.viewAll')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard:quickActions.assets.viewAllDescription')}
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
                  {t('dashboard:quickActions.labels.viewAll')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard:quickActions.labels.viewAllDescription')}
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
                  {t('dashboard:quickActions.projects.viewAll')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard:quickActions.projects.viewAllDescription')}
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
          setIsUploadDialogOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
