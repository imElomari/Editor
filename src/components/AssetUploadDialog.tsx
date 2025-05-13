'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSupabaseUpload } from '../hooks/use-supabase-upload'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Dropzone, DropzoneContent, DropzoneEmptyState } from './dropzone'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn, getMimeTypeCategory } from '@/lib/utils'
import { Icons } from '@/lib/constances'
import { useTranslation } from 'react-i18next'

// Add this type if it doesn't exist in your types file
type AssetScope = 'admin-global' | 'user' | 'project'

interface AssetUploadDialogProps {
  projectId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AssetUploadDialog({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: AssetUploadDialogProps) {
  const { user } = useAuth()
  const [assetScope, setAssetScope] = useState<AssetScope>(projectId ? 'project' : 'user')
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || '')
  const [loading, setLoading] = useState(false)
  const [projectsLoading, setProjectsLoading] = useState(false)
  interface Project {
    id: string
    name: string
  }

  const [projects, setProjects] = useState<Project[]>([])
  const [open, setOpen] = useState(false)
  const { t } = useTranslation(['common', 'assets'])

  // Initialize dropzone props
  const dropzoneProps = useSupabaseUpload({
    bucketName: 'assets',
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 1,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2',
      'application/json',
      'text/css',
      'text/javascript',
      'application/javascript',
      'text/plain',
    ],
    upsert: true,
  })

  const { loading: uploadLoading, isSuccess, files } = dropzoneProps

  // Fetch projects for the dropdown
  useEffect(() => {
    if (isOpen && user) {
      fetchProjects()
    }

    // Initialize with the provided projectId if available
    if (projectId) {
      setSelectedProjectId(projectId)
      setAssetScope('project')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user, projectId])

  const fetchProjects = useCallback(async () => {
    try {
      setProjectsLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id)
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setProjectsLoading(false)
    }
  }, [user?.id]) // Add user?.id as dependency

  useEffect(() => {
    if (isOpen && user) {
      fetchProjects()
    }

    if (projectId) {
      setSelectedProjectId(projectId)
      setAssetScope('project')
    }
  }, [isOpen, user, projectId, fetchProjects])

  // getStoragePath function
  const getStoragePath = (fileName: string) => {
    const timestamp = new Date().getTime()
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')

    switch (assetScope) {
      case 'admin-global':
        return `global/${timestamp}-${sanitizedName}`
      case 'user':
        return `user/${timestamp}-${sanitizedName}`
      case 'project':
        return `user/${timestamp}-${sanitizedName}`
      default:
        return `user/${timestamp}-${sanitizedName}`
    }
  }

  const handleUpload = async () => {
    if (!files[0] || !user) {
      toast.error('Please select a file to upload', {
        description: 'You need to select a file before uploading.',
        icon: <Icons.warning className="h-5 w-5 text-destructive" />,
      })
      return
    }

    if (assetScope === 'project' && !selectedProjectId) {
      toast.error('Please select a project', {
        description: 'You need to select a project for project-specific assets.',
        icon: <Icons.warning className="h-5 w-5 text-destructive" />,
      })
      return
    }

    try {
      setLoading(true)
      const file = files[0]
      const storagePath = getStoragePath(file.name)

      // Check if file already exists in the database
      const query = supabase.from('assets').select().eq('name', file.name)

      // Add conditions based on asset scope
      switch (assetScope) {
        case 'admin-global':
          query.is('owner_id', null)
          break
        case 'user':
          query.eq('owner_id', user.id).is('project_id', null)
          break
        case 'project':
          query.eq('owner_id', user.id).eq('project_id', selectedProjectId)
          break
      }

      const { data: existingAsset } = await query.single()

      if (existingAsset) {
        toast.error('File already exists', {
          description: `A file with the name "${file.name}" already exists.`,
          icon: <Icons.warning className="h-5 w-5 text-destructive" />,
        })
        return
      }

      // Upload file to storage bucket first
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from('assets').getPublicUrl(storagePath)

      // Create asset record with the correct public URL
      const { error: dbError } = await supabase.from('assets').insert({
        name: file.name,
        type: getMimeTypeCategory(file.type),
        url: publicUrl, // Use the actual public URL
        project_id: assetScope === 'project' ? selectedProjectId : null,
        owner_id: assetScope === 'admin-global' ? null : user.id,
        metadata: {
          size: file.size,
          mimeType: file.type,
          bucket: 'assets',
          storagePath: storagePath,
          originalName: file.name,
          lastModified: file.lastModified,
          uploadedAt: new Date().toISOString(),
        },
      })

      if (dbError) {
        // Cleanup on database error
        await supabase.storage.from('assets').remove([storagePath])
        throw new Error(`Database error: ${dbError.message}`)
      }

      toast.success('Asset uploaded successfully', {
        description: `${file.name} has been uploaded as a ${getScopeLabel(assetScope)} asset.`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Failed to upload asset',
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get a user-friendly label for the asset scope
  const getScopeLabel = (scope: AssetScope): string => {
    switch (scope) {
      case 'admin-global':
        return 'admin'
      case 'user':
        return t('assets:assetfilter.scope.global')
      case 'project':
        return t('assets:assetfilter.scope.project')
      default:
        return scope
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.upload className="h-5 w-5 text-primary" />
            {t('assets:card.uploadDialog.title')}
          </DialogTitle>
          <DialogDescription>{t('assets:card.uploadDialog.placeholder')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Asset Type Selection */}
          <div className="space-y-2">
            <Label>{t('assets:card.uploadDialog.type')}</Label>
            <Tabs
              value={assetScope}
              onValueChange={(value) => setAssetScope(value as AssetScope)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                {/* Uncomment if admin functionality is needed
                {user?.isAdmin && (
                  <TabsTrigger value="admin-global" className="flex items-center gap-2">
                    <Icons.globalclassName="h-4 w-4" />
                    <span>Global Assets</span>
                  </TabsTrigger>
                )} */}
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <Icons.user className="h-4 w-4" />
                  <span>{t('assets:card.uploadDialog.MyAssetsTab.title')}</span>
                </TabsTrigger>
                <TabsTrigger value="project" className="flex items-center gap-2">
                  <Icons.project className="h-4 w-4" />
                  <span>{t('assets:card.uploadDialog.projectTab.title')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('assets:card.uploadDialog.MyAssetsTab.description')}
                </p>
              </TabsContent>

              <TabsContent value="admin-global" className="pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Global assets are available to all users across the platform.
                </p>
              </TabsContent>

              <TabsContent value="project" className="space-y-2 pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('assets:card.uploadDialog.projectTab.description')}
                </p>

                <div className="space-y-1">
                  <Label htmlFor="project-select" className="font-medium">
                    {t('assets:card.uploadDialog.projectTab.selectProject')}
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={projectsLoading}
                      >
                        {selectedProjectId
                          ? projects.find((project) => project.id === selectedProjectId)?.name ||
                            t('assets:card.uploadDialog.projectTab.selectProject')
                          : t('assets:card.uploadDialog.projectTab.selectProject')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder={t('assets:card.uploadDialog.projectTab.search')}
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>
                            {projectsLoading ? (
                              <div className="flex items-center justify-center py-2">
                                <Icons.loading className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading projects...</span>
                              </div>
                            ) : (
                              t('assets:card.uploadDialog.projectTab.noProjectFound')
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {projects.map((project) => (
                              <CommandItem
                                key={project.id}
                                value={project.id}
                                onSelect={(value) => {
                                  setSelectedProjectId(value)
                                  setOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedProjectId === project.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {project.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {assetScope === 'project' && !selectedProjectId && (
                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                      <Icons.warning className="h-3 w-3" />
                      {t('assets:card.uploadDialog.projectTab.select')}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Dropzone {...dropzoneProps} className="min-h-[200px] flex items-center justify-center">
            <DropzoneContent />
            <DropzoneEmptyState />
          </Dropzone>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || uploadLoading}
          >
            {t('common:buttons.cancel')}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              files.length === 0 ||
              loading ||
              uploadLoading ||
              isSuccess ||
              (assetScope === 'project' && !selectedProjectId)
            }
            className="min-w-[100px] relative"
          >
            {loading || uploadLoading ? (
              <>
                <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
                {t('assets:card.uploadDialog.projectTab.uploading')}
                <span className="absolute bottom-0 left-0 h-[2px] bg-primary/50 animate-progress"></span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('assets:card.uploadDialog.projectTab.confirm')}
              </>
            ) : (
              <>
                <Icons.upload className="mr-2 h-4 w-4" />
                {t('assets:card.uploadDialog.projectTab.uploaded', {
                  assetScope: getScopeLabel(assetScope),
                })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
