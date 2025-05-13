'use client'

import type { Asset } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pen } from 'lucide-react'
import { getStorageUrl } from '@/lib/utils'
import { getAssetIcon, getAssetTypeLabel } from './asset-utils'
import { Icons } from '@/lib/constances'
import { useTranslation } from 'react-i18next'

interface AssetCardProps {
  asset: Asset
  onDelete: (asset: Asset) => void
  onRename: (asset: Asset) => void
  onMakeGlobal: (asset: Asset) => void
  onAssignToProject: (asset: Asset) => void
}

export function AssetCard({
  asset,
  onDelete,
  onRename,
  onMakeGlobal,
  onAssignToProject,
}: AssetCardProps) {
  const AssetIcon = getAssetIcon(asset.type)
  const typeLabel = getAssetTypeLabel(asset.type)
  const isGlobal = asset.project_id === null
  const { t } = useTranslation(['common', 'assets'])

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Asset Preview */}
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
            <AssetIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{typeLabel}</span>
          </div>
        )}

        {/* Asset Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-medium break-words line-clamp-2 text-sm flex-1" title={asset.name}>
              {asset.name}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <Icons.settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRename(asset)}>
                  <Pen className="h-4 w-4 mr-2" />
                  {t('assets:card.dropMenu.rename')}
                </DropdownMenuItem>
                {asset.project_id === null ? (
                  <DropdownMenuItem onClick={() => onAssignToProject(asset)}>
                    <Icons.project className="h-4 w-4 mr-2" />
                    {t('assets:card.dropMenu.assignToProject')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onMakeGlobal(asset)}>
                    <Icons.global className="h-4 w-4 mr-2" />
                    {t('assets:card.dropMenu.global')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(asset)}
                >
                  <Icons.delete className="h-4 w-4 mr-2" />
                  {t('assets:card.dropMenu.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {asset.metadata?.size ? `${(asset.metadata.size / 1024).toFixed(1)} KB` : typeLabel}
            </p>
            <Badge variant={isGlobal ? 'secondary' : 'outline'} className="text-xs">
              {isGlobal ? (
                <span className="flex items-center gap-1">
                  <Icons.global className="h-3 w-3" />
                  {t('assets:type.global')}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Icons.project className="h-3 w-3" />
                  {t('assets:type.project')}
                </span>
              )}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
