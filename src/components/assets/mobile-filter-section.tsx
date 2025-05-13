'use client'

import type { AssetScope, Project } from '@/lib/types'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { MobileFilterBar } from '../MobileFilterBar'
import { ProjectSelector } from './project-selector'
import { Icons } from '@/lib/constances'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation(['common', 'assets'])

  return (
    <MobileFilterBar
      activeFilters={activeFiltersCount}
      title={t('assets:assetfilter.title')}
      onReset={onReset}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('common:filter.search.label')}</Label>
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('assets:assetfilter.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('assets:assetfilter.scope.title')}</Label>
          <Select value={assetScope} onValueChange={(value) => setAssetScope(value as AssetScope)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('assets:assetfilter.scope.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('assets:assetfilter.scope.all')}</SelectItem>
              <SelectItem value="global">{t('assets:assetfilter.scope.global')}</SelectItem>
              <SelectItem value="project">{t('assets:assetfilter.scope.project')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('common:filter.project.title')}</Label>
          <ProjectSelector
            projects={projects}
            selectedProjectId={projectFilter}
            onSelect={setProjectFilter}
            placeholder={t('common:filter.project.placeholder')}
            disabled={assetScope === 'global'}
            includeAllOption={true}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('assets:assetfilter.type.title')}</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('assets:assetfilter.type.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('assets:assetfilter.type.all')}</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="font">Fonts</SelectItem>
              <SelectItem value="application">Documents</SelectItem>
              <SelectItem value="text">Text Files</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('common:filter.sort.label')}</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
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
    </MobileFilterBar>
  )
}
