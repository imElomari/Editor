"use client";

import type { AssetScope, Project } from "../../lib/types";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ProjectSelector } from "./project-selector";
import { Button } from "../ui/button";
import { Icons } from "../../lib/constances";
import { useTranslation } from "react-i18next";

interface DesktopFilterBarProps {
  assetScope: AssetScope;
  setAssetScope: (scope: AssetScope) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  projectFilter: string;
  setProjectFilter: (projectId: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  projects: Project[];
  onReset: () => void;
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
  // Add reset function
  const handleReset = () => {
    setAssetScope("all");
    setSearchQuery("");
    setProjectFilter("all");
    setTypeFilter("all");
    setSortBy("newest");
  };

  // Calculate if any filters are active
  const hasActiveFilters =
    assetScope !== "all" ||
    searchQuery !== "" ||
    projectFilter !== "all" ||
    typeFilter !== "all" ||
    sortBy !== "newest";
     
  const { t } = useTranslation(['common', 'assets']);
  

  return (
    <div className="hidden md:flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Tabs
          value={assetScope}
          onValueChange={(value) => setAssetScope(value as AssetScope)}
          className="w-full"
        >
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="all" className="flex-1">
            {t('assets:assetfilter.scope.all')}
            </TabsTrigger>
            <TabsTrigger value="global" className="flex-1">
            {t('assets:assetfilter.scope.global')}
            </TabsTrigger>
            <TabsTrigger value="project" className="flex-1">
            {t('assets:assetfilter.scope.project')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="ml-4 text-muted-foreground hover:text-foreground"
          >
            <Icons.reset className="h-4 w-4 mr-2" />
            {t('common:filter.reset')}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('assets:assetfilter.search.placeholder')}
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
            placeholder={t('common:filter.project.placeholder')}
            triggerClassName="w-[200px]"
            includeAllOption={true}
          />
        )}

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Icons.filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t('assets:assetfilter.type.title')}/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('assets:assetfilter.type.placeholder')}</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="font">Fonts</SelectItem>
            <SelectItem value="application">Documents</SelectItem>
            <SelectItem value="text">Text Files</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <Icons.updown className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t('common:filter.sort.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('common:filter.sort.options.newest')}</SelectItem>
            <SelectItem value="oldest">{t('common:filter.sort.options.oldest')}</SelectItem>
            <SelectItem value="name">{t('common:filter.sort.options.name')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
