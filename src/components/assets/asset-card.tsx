"use client"

import type { Asset } from "../../lib/types"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { FolderKanban, Globe, Pen, Settings2, Trash2 } from "lucide-react"
import { getStorageUrl } from "../../lib/utils"
import { getAssetIcon, getAssetTypeLabel } from "./asset-utils"

interface AssetCardProps {
  asset: Asset
  onDelete: (asset: Asset) => void
  onRename: (asset: Asset) => void
  onMakeGlobal: (asset: Asset) => void
  onAssignToProject: (asset: Asset) => void
}

export function AssetCard({ asset, onDelete, onRename, onMakeGlobal, onAssignToProject }: AssetCardProps) {
  const AssetIcon = getAssetIcon(asset.type)
  const typeLabel = getAssetTypeLabel(asset.type)
  const isGlobal = asset.project_id === null

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Asset Preview */}
        {asset.type.startsWith("image/") ? (
          <div className="relative w-full h-32 mb-2 bg-muted/50 rounded-md overflow-hidden">
            <img
              src={getStorageUrl(asset.metadata.storagePath ?? "")}
              alt={asset.name}
              className="absolute inset-0 w-full h-full object-contain rounded-md"
              onError={(e) => {
                console.error("Image failed to load:", asset.url)
                e.currentTarget.src = "/placeholder-image.png"
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="secondary" size="sm" className="h-8" onClick={() => window.open(asset.url, "_blank")}>
                View Full Size
              </Button>
            </div>
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
            <p className="font-medium truncate" title={asset.name}>
              {asset.name}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRename(asset)}>
                  <Pen className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                {asset.project_id === null ? (
                  <DropdownMenuItem onClick={() => onAssignToProject(asset)}>
                    <FolderKanban className="h-4 w-4 mr-2" />
                    Assign to Project
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onMakeGlobal(asset)}>
                    <Globe className="h-4 w-4 mr-2" />
                    Make Global
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(asset)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {asset.metadata?.size ? `${(asset.metadata.size / 1024).toFixed(1)} KB` : typeLabel}
            </p>
            <Badge variant={isGlobal ? "secondary" : "outline"} className="text-xs">
              {isGlobal ? (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Global
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <FolderKanban className="h-3 w-3" />
                  Project
                </span>
              )}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
