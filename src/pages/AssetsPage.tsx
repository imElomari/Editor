"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "../components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import type { Asset, AssetScope, Project } from "../lib/types"
import { AssetUploadDialog } from "../components/AssetUploadDialog"
import { useMobile } from "../hooks/use-mobile"

// Import custom components
import { AssetCard } from "../components/assets/asset-card"
import { DesktopFilterBar } from "../components/assets/desktop-filter-bar"
import { MobileFilterSection } from "../components/assets/mobile-filter-section"
import { EmptyState } from "../components/assets/empty-state"

// Import services
import {
  fetchAssets,
  fetchProjects,
  deleteAsset,
  renameAsset,
  makeAssetGlobal,
  assignAssetToProject,
} from "../services/asset-service"
import { DeleteDialog } from "../components/assets/delete-dialog"
import { ProjectAssignmentDialog } from "../components/assets/project-assignment-dialog"
import { RenameDialog } from "../components/assets/rename-dialog"

export default function AssetsPage() {
  const { user } = useAuth()
  const isMobile = useMobile()

  // State for assets and projects
  const [assets, setAssets] = useState<Asset[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [typeFilter, setTypeFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [assetScope, setAssetScope] = useState<AssetScope>("all")

  // Dialog state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)

  // Selected items state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // Operation state
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch data on mount and when filters change
  useEffect(() => {
    if (user) {
      loadAssets()
      loadProjects()
    }
  }, [user, assetScope, projectFilter, typeFilter])

  // Load assets from service
  async function loadAssets() {
    try {
      setLoading(true)
      if (!user) return

      const data = await fetchAssets(user.id, assetScope, projectFilter, typeFilter)
      setAssets(data)

    } catch (error) {
      console.error("Error loading assets:", error)
      toast.error("Failed to load assets")
    } finally {
      setLoading(false)
    }
  }

  // Load projects from service
  async function loadProjects() {
    try {
      if (!user) return

      const data = await fetchProjects(user.id)
      setProjects(data)
    } catch (error) {
      console.error("Error loading projects:", error)
      toast.error("Failed to load projects")
    }
  }

  // Delete asset handler
  const handleDeleteAsset = async () => {
    if (!selectedAsset) return

    try {
      setIsProcessing(true)

      // Check if asset is used
      if (selectedAsset.is_used) {
        toast.error("Cannot delete asset", {
          description: "This asset is currently in use by one or more labels",
        })
        setIsDeleteDialogOpen(false)
        return
      }

      await deleteAsset(selectedAsset)

      toast.success("Asset deleted", {
        description: `"${selectedAsset.name}" has been deleted.`,
      })

      // Refresh assets list
      loadAssets()
    } catch (error) {
      console.error("Error deleting asset:", error)
      toast.error("Failed to delete asset", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsProcessing(false)
      setIsDeleteDialogOpen(false)
      setSelectedAsset(null)
    }
  }

  // Rename asset handler
  const handleRename = async (newName: string) => {
    if (!selectedAsset || !newName) return

    try {
      setIsProcessing(true)

      await renameAsset(selectedAsset.id, newName)

      // Refresh the assets list
      await loadAssets()

      toast.success("Asset renamed successfully", {
        description: `Asset has been renamed to "${newName}"`,
      })

      // Close dialog and reset state
      setIsRenameDialogOpen(false)
      setSelectedAsset(null)
    } catch (error) {
      console.error("Error renaming asset:", error)
      toast.error("Failed to rename asset", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Make asset global handler
  const handleMakeGlobal = async (asset: Asset) => {
    try {
      setIsProcessing(true)

      await makeAssetGlobal(asset.id)

      toast.success("Asset made global", {
        description: "This asset is now available across all projects.",
      })

      // Refresh assets list
      loadAssets()
    } catch (error) {
      console.error("Error making asset global:", error)
      toast.error("Failed to make asset global")
    } finally {
      setIsProcessing(false)
    }
  }

  // Make asset project-specific handler
  const handleMakeProjectAsset = async () => {
    if (!selectedAsset || !selectedProjectId) return

    try {
      setIsProcessing(true)

      await assignAssetToProject(selectedAsset.id, selectedProjectId)

      toast.success("Asset updated", {
        description: "This asset is now assigned to the selected project.",
      })

      // Refresh assets list
      loadAssets()
    } catch (error) {
      console.error("Error updating asset:", error)
      toast.error("Failed to update asset")
    } finally {
      setIsProcessing(false)
      setIsProjectDialogOpen(false)
      setSelectedAsset(null)
      setSelectedProjectId("")
    }
  }

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        return asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name)
        }
        return 0
      })
  }, [assets, searchQuery, sortBy])

  // Calculate active filters count for mobile view
  const activeFiltersCount = [
    assetScope !== "all" ? 1 : 0,
    typeFilter !== "all" ? 1 : 0,
    projectFilter !== "all" ? 1 : 0,
    searchQuery ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  // Dialog handlers
  const handleOpenDeleteDialog = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsDeleteDialogOpen(true)
  }

  const handleOpenRenameDialog = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsRenameDialogOpen(true)
  }

  const handleOpenProjectDialog = (asset: Asset) => {
    setSelectedAsset(asset)
    setSelectedProjectId("")
    setIsProjectDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Assets</h1>
            <p className="text-muted-foreground mt-1">Manage your global and project assets</p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)} size={isMobile ? "sm" : "lg"}>
            <Plus className="h-5 w-5" />
            {!isMobile && "Upload Asset"}
          </Button>
        </div>

        {/* Mobile Filters */}
        <MobileFilterSection
          activeFiltersCount={activeFiltersCount}
          assetScope={assetScope}
          setAssetScope={setAssetScope}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          projects={projects}
        />

        {/* Desktop Filters */}
        <DesktopFilterBar
          assetScope={assetScope}
          setAssetScope={setAssetScope}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          projects={projects}
        />

        {/* Assets Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {filteredAssets.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onDelete={handleOpenDeleteDialog}
                    onRename={handleOpenRenameDialog}
                    onMakeGlobal={handleMakeGlobal}
                    onAssignToProject={handleOpenProjectDialog}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                hasFilters={
                  searchQuery !== "" || typeFilter !== "all" || projectFilter !== "all" || assetScope !== "all"
                }
                onUploadClick={() => setIsUploadDialogOpen(true)}
              />
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <AssetUploadDialog
        projectId={selectedProjectId}
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={() => loadAssets()}
      />

      <DeleteDialog
        asset={selectedAsset}
        isOpen={isDeleteDialogOpen}
        isLoading={isProcessing}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedAsset(null)
        }}
        onDelete={handleDeleteAsset}
      />

      <RenameDialog
        asset={selectedAsset}
        isOpen={isRenameDialogOpen}
        isLoading={isProcessing}
        onClose={() => {
          setIsRenameDialogOpen(false)
          setSelectedAsset(null)
        }}
        onRename={handleRename}
      />

      <ProjectAssignmentDialog
        asset={selectedAsset}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        isOpen={isProjectDialogOpen}
        isLoading={isProcessing}
        onClose={() => {
          setIsProjectDialogOpen(false)
          setSelectedAsset(null)
          setSelectedProjectId("")
        }}
        onAssign={handleMakeProjectAsset}
      />
    </div>
  )
}
