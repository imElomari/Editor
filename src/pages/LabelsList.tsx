'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import type { Label, Project } from '../lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import LabelCard from '../components/LabelCard'
import { LabelDialog } from '../components/LabelDialog'
import { MobileFilterBar } from '../components/MobileFilterBar'
import { useMobile } from '../hooks/use-mobile'
import { Icons } from '../lib/constances'
import { useTranslation } from 'react-i18next'

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<Label | undefined>()
  const { user } = useAuth()
  const { t } = useTranslation(['common', 'labels'])
  const isMobile = useMobile()
  const handleResetFilters = () => {
    setSearchQuery('')
    setProjectFilter('all')
    setStatusFilter('all')
    setSortBy('newest')
  }

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id)
        .is('deleted_at', null)

      if (error) throw error
      setProjects(data || [])
    } catch {
      toast.error(t('labels:toast.error.fetchingProjects'))
    }
  }, [user?.id, t])

  const fetchLabels = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('labels')
        .select('*, projects(name)')
        .eq('owner_id', user?.id)
        .is('deleted_at', null)

      if (error) throw error
      setLabels(data || [])
    } catch (error) {
      toast.error(t('labels:toast.error.fetchingLabels'))
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, t])

  useEffect(() => {
    if (user) {
      fetchLabels()
      fetchProjects()
    }
  }, [user, fetchLabels, fetchProjects])

  const handleEdit = (label: Label) => {
    setSelectedLabel(label)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedLabel(undefined)
  }

  const filteredLabels = labels
    .filter((label) => {
      const matchesSearch =
        label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        label.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || label.status === statusFilter
      const matchesProject = projectFilter === 'all' || label.project_id === projectFilter

      return matchesSearch && matchesStatus && matchesProject
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

  // Calculate active filters count for mobile view
  const activeFiltersCount = [
    statusFilter !== 'all' ? 1 : 0,
    projectFilter !== 'all' ? 1 : 0,
    searchQuery ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('labels:page.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('labels:page.description')}</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size={isMobile ? 'sm' : 'lg'}>
            <Icons.plus className="h-5 w-5" />
            {!isMobile && t('labels:page.newLabel')}
          </Button>
        </div>

        {/* Mobile Filters */}
        <MobileFilterBar
          activeFilters={activeFiltersCount}
          title={t('labels:labelfilter.title')}
          onReset={handleResetFilters}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('labels:labelfilter.title')}</label>
              <div className="relative">
                <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('labels:labelfilter.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common:filter.project.title')}</label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('common:filter.project.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common:filter.project.all')}</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common:filter.status.placeholder')}</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('common:filter.status.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common:filter.status.all')}</SelectItem>
                  <SelectItem value="draft">{t('common:filter.status.draft')}</SelectItem>
                  <SelectItem value="published">{t('common:filter.status.published')}</SelectItem>
                  <SelectItem value="archived">{t('common:filter.status.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common:filter.sort.label')}</label>
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

        {/* Desktop Filters */}
        <div className="hidden md:flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('labels:labelfilter.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <Icons.filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('common:filter.project.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filter.project.all')}</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Icons.filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('common:filter.status.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filter.status.all')}</SelectItem>
              <SelectItem value="draft">{t('common:filter.status.draft')}</SelectItem>
              <SelectItem value="published">{t('common:filter.status.published')}</SelectItem>
              <SelectItem value="archived">{t('common:filter.status.archived')}</SelectItem>
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

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Icons.loading className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {filteredLabels.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredLabels.map((label) => (
                  <LabelCard
                    key={label.id}
                    label={label}
                    onDelete={fetchLabels}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' || projectFilter !== 'all'
                    ? t('labels:empty.noResults')
                    : t('labels:empty.noLabels')}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Icons.plus className="h-4 w-4 mr-2" />
                  {t('labels:page.createFirst')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <LabelDialog
        label={selectedLabel}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={fetchLabels}
      />
    </div>
  )
}
