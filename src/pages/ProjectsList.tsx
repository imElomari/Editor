'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Icons } from '../lib/constances'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import type { Project } from '../lib/types'
import ProjectCard from '../components/ProjectCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { ProjectDialog } from '../components/ProjectDialog'
import { MobileFilterBar } from '../components/MobileFilterBar'
import { useMobile } from '../hooks/use-mobile'
import { useTranslation } from 'react-i18next'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | undefined>()
  const { user } = useAuth()
  const isMobile = useMobile()
  const { t } = useTranslation(['projects', 'common'])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
  }

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      toast.error(t('projects:card.toast.error.fetch'))
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, t])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedProject(undefined)
  }

  const sortedAndFilteredProjects = projects
    .filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
  const activeFiltersCount = [searchQuery ? 1 : 0, sortBy !== 'newest' ? 1 : 0].reduce(
    (a, b) => a + b,
    0
  )

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('projects:page.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('projects:page.description')}</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size={isMobile ? 'sm' : 'lg'}>
            <Icons.plus className="h-5 w-5" />
            {!isMobile && t('projects:page.newProject')}
          </Button>
        </div>

        {/* Mobile Filters */}
        <MobileFilterBar
          activeFilters={activeFiltersCount}
          title={t('projects:projectfilter.title')}
          onReset={handleResetFilters}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common:filter.search.label')}</label>
              <div className="relative">
                <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('projects:projectfilter.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              placeholder={t('projects:projectfilter.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
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
            {sortedAndFilteredProjects.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {sortedAndFilteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={fetchProjects}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  {searchQuery ? t('projects:empty.noResults') : t('projects:empty.noProjects')}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Icons.plus className="h-4 w-4 mr-2" />
                  {t('projects:page.createFirst')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ProjectDialog
        project={selectedProject}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={fetchProjects}
      />
    </div>
  )
}
