'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { AssetUploadDialog } from '../AssetUploadDialog'
import { getAssetIcon } from '../assets/asset-utils'
import { getStorageUrl } from '@/lib/utils'
import { Icons } from '@/lib/constances'

interface RecentAssetsProps {
  className?: string
  limit?: number
}

export function RecentAssets({ className, limit = 5 }: RecentAssetsProps) {
  const { user } = useAuth()
  interface Asset {
    id: string
    name: string
    type: string
    created_at: string
    url: string
    metadata?: {
      storagePath?: string
    }
  }

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const fetchRecentAssets = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error fetching recent assets:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, limit])

  useEffect(() => {
    if (user) {
      fetchRecentAssets()
    }
  }, [user, fetchRecentAssets])

  return (
    <>
      <Card className={cn('shadow-sm', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Assets</CardTitle>
            <CardDescription>Your recently uploaded assets</CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsUploadDialogOpen(true)}>
            <Icons.plus className="h-4 w-4 mr-2" />
            const AssetIcon = getAssetIcon((asset as Asset).type);
          </Button>
        </CardHeader>
        <CardContent className="pb-2">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Icons.loading className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : assets.length > 0 ? (
            <div className="space-y-4">
              {assets.map((asset) => {
                const AssetIcon = getAssetIcon(asset.type)
                const isImage = asset.type.startsWith('image/')

                return (
                  <div key={asset.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                      {isImage ? (
                        <img
                          src={getStorageUrl(asset.metadata?.storagePath || '')}
                          alt={asset.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png'
                          }}
                        />
                      ) : (
                        <AssetIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={asset.url} target="_blank" rel="noopener noreferrer">
                        <Icons.arrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icons.asset className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No assets yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Icons.plus className="h-4 w-4 mr-2" />
                Upload Your First Asset
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <a href="/assets">
              View All Assets
              <Icons.arrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>

      <AssetUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={() => {
          setIsUploadDialogOpen(false)
          fetchRecentAssets()
        }}
      />
    </>
  )
}
