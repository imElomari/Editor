import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Project, Label, Asset } from '../lib/types'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Icons } from '../lib/constances'

import LabelCard from '../components/LabelCard'
import { LabelDialog } from '../components/LabelDialog'
import { AssetUploadDialog } from '../components/AssetUploadDialog'
import { getStorageUrl } from '../lib/utils'
import { useTranslation } from 'react-i18next'

function getAssetIcon(type: string) {
  if (type.startsWith('image/')) return Icons.image
  if (type.startsWith('font/')) return Icons.font
  if (type === 'application/json') return Icons.json
  if (type === 'text/css' || type === 'application/javascript') return Icons.css
  if (type === 'text/plain') return Icons.text
  return Icons.file // Ensure this returns a valid React component
}

function getAssetTypeLabel(type: string) {
  switch (type) {
    case 'image/jpeg':
    case 'image/png':
    case 'image/gif':
    case 'image/svg':
      return 'Image'
    case 'font/ttf':
    case 'font/otf':
    case 'font/woff':
    case 'font/woff2':
      return 'Font'
    case 'application/json':
      return 'JSON'
    case 'text/css':
      return 'CSS'
    case 'application/javascript':
      return 'JavaScript'
    default:
      return 'File'
  }
}

export default function ProjectDetails() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [labels, setLabels] = useState<Label[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false)
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('assets')
  const { t } = useTranslation(['common', 'projects'])

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  async function fetchProjectData() {
    try {
      setLoading(true)
      const [projectData, labelsData, assetsData] = await Promise.all([
        // Fetch project details
        supabase.from('projects').select('*').eq('id', projectId).single(),

        // Fetch project labels
        supabase.from('labels').select('*').eq('project_id', projectId).is('deleted_at', null),

        supabase
          .from('assets')
          .select(
            `
            *,
            metadata
          `
          )
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
      ])

      if (projectData.error) throw projectData.error
      if (labelsData.error) throw labelsData.error
      if (assetsData.error) throw assetsData.error

      setProject(projectData.data)
      setLabels(labelsData.data || [])
      setAssets(assetsData.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icons.loading className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">{t('projects:page.noProjectFound')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
              <Icons.arrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground mt-1">
                {project.description || t('projects:card.noDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="labels" className="flex items-center gap-2">
              <Icons.labels className="h-4 w-4" />
              {t('projects:projectDetails.tab1.title')} ({labels.length})
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Icons.asset className="h-4 w-4" />
              {t('projects:projectDetails.tab2.title')} ({assets.length})
            </TabsTrigger>
          </TabsList>

          {/* Labels Tab */}
          <TabsContent value="labels" className="mt-6">
            {labels.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {labels.map((label) => (
                  <LabelCard
                    key={label.id}
                    label={label}
                    onDelete={fetchProjectData}
                    onEdit={() => setIsLabelDialogOpen(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  {t('projects:projectDetails.tab1.noLabels')}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsLabelDialogOpen(true)}
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  {t('projects:projectDetails.tab1.action')}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-6">
            <div className="flex justify-end mb-6">
              <Button onClick={() => setIsAssetDialogOpen(true)}>
                <Icons.upload className="h-4 w-4 mr-2" />
                {t('projects:projectDetails.tab2.action')}
              </Button>
            </div>

            {assets.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {assets.map((asset) => {
                  const AssetIcon = getAssetIcon(asset.type)
                  const typeLabel = getAssetTypeLabel(asset.type)

                  return (
                    <div
                      key={asset.id}
                      className="group border rounded-lg p-4 hover:shadow-md transition-all bg-card"
                    >
                      {asset.type.startsWith('image/') ? (
                        <div className="relative w-full h-32 mb-2 bg-muted/50 rounded-md overflow-hidden">
                          <img
                            src={getStorageUrl(asset.metadata.storagePath ?? '')}
                            alt={asset.name}
                            className="absolute inset-0 w-full h-full object-contain rounded-md"
                            onError={(e) => {
                              console.error('Image failed to load:', asset.url)
                              e.currentTarget.src = '/placeholder-image.png'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-muted rounded-md mb-2 flex flex-col items-center justify-center gap-2">
                          {AssetIcon && <AssetIcon className="h-8 w-8 text-muted-foreground" />}
                          <span className="text-xs text-muted-foreground">{typeLabel}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <p className="font-medium truncate" title={asset.name}>
                          {asset.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {asset.metadata?.size
                              ? `${(asset.metadata.size / 1024).toFixed(1)} KB`
                              : typeLabel}
                          </p>
                          {/* <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(getStorageUrl('project-assets', asset.metadata.storagePath ?? ''), '_blank')}
                              title="Open in new tab"
                            >
                              <AssetIcon className="h-4 w-4" />
                            </Button>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">{t('projects:projectDetails.tab2.noAsset')}</p>
              </div>
            )}
            <AssetUploadDialog
              projectId={projectId}
              isOpen={isAssetDialogOpen}
              onClose={() => setIsAssetDialogOpen(false)}
              onSuccess={() => {
                fetchProjectData()
                setActiveTab('assets')
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <LabelDialog
        isOpen={isLabelDialogOpen}
        onClose={() => setIsLabelDialogOpen(false)}
        onSuccess={fetchProjectData}
      />
    </div>
  )
}
export async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600) // URL expires in 1 hour

  if (error) {
    console.error('Error creating signed URL:', error)
    return ''
  }

  return data.signedUrl
}
