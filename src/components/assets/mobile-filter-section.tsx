"use client"

import type { AssetScope, Project } from "../../lib/types"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Search } from "lucide-react"
import { MobileFilterBar } from "../MobileFilterBar"
import { ProjectSelector } from "./project-selector"

interface MobileFilterSectionProps {
  activeFiltersCount: number
  assetScope: AssetScope
  setAssetScope: (scope: AssetScope) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  projectFilter: string
  setProjectFilter: (projectId: string) => void
  typeFilter: string
  setTypeFilter: (type: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  projects: Project[]
  onReset: () => void

}

export function MobileFilterSection({
  activeFiltersCount,
  assetScope,
  setAssetScope,
  searchQuery,
  setSearchQuery,
  projectFilter,
  setProjectFilter,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  projects,
  onReset,
}: MobileFilterSectionProps) {
  return (
    <MobileFilterBar activeFilters={activeFiltersCount} title="Filter Assets" onReset={onReset}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Asset Scope</Label>
          <Select value={assetScope} onValueChange={(value) => setAssetScope(value as AssetScope)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="global">Global Assets</SelectItem>
              <SelectItem value="project">Project Assets</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Project</Label>
          <ProjectSelector
            projects={projects}
            selectedProjectId={projectFilter}
            onSelect={setProjectFilter}
            placeholder="Filter by project"
            disabled={assetScope === "global"}
            includeAllOption={true}
          />
        </div>

        <div className="space-y-2">
          <Label>Asset Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="font">Fonts</SelectItem>
              <SelectItem value="application">Documents</SelectItem>
              <SelectItem value="text">Text Files</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </MobileFilterBar>
  )
}
