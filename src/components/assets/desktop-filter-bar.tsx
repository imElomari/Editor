"use client"

import type { AssetScope, Project } from "../../lib/types"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { ArrowUpDown, Filter, Globe, FolderKanban, Search } from "lucide-react"
import { ProjectSelector } from "./project-selector"

interface DesktopFilterBarProps {
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
}

export function DesktopFilterBar({
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
}: DesktopFilterBarProps) {
  return (
    <div className="hidden md:flex flex-col gap-4">
      <Tabs value={assetScope} onValueChange={(value) => setAssetScope(value as AssetScope)} className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="all" className="flex-1">
            All Assets
          </TabsTrigger>
          <TabsTrigger value="global" className="flex-1 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Global Assets</span>
          </TabsTrigger>
          <TabsTrigger value="project" className="flex-1 flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            <span>Project Assets</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {assetScope !== "global" && (
          <ProjectSelector
            projects={projects}
            selectedProjectId={projectFilter}
            onSelect={setProjectFilter}
            placeholder="Filter by project"
            triggerClassName="w-[200px]"
            includeAllOption={true}
          />
        )}

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
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

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
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
  )
}
