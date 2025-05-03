"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Loader2, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { toast } from "sonner"

interface AssetUploadDialogProps {
  projectId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function getMimeTypeCategory(mimeType: string): 'image' | 'vector' | 'font' | 'background' | 'icon' {
  if (mimeType.startsWith('image/svg')) return 'vector'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.match(/\.(ttf|otf|woff|woff2)$/)) return 'font'
  // Add more type mappings as needed
  return 'image' // default fallback
}

export function AssetUploadDialog({ projectId, isOpen, onClose, onSuccess }: AssetUploadDialogProps) {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !projectId || !user) {
      toast.error("Missing required information")
      return
    }
  
    setLoading(true)
    try {
      // Check if file name already exists in this project
      const { data: existingAsset } = await supabase
        .from("assets")
        .select("name")
        .eq("project_id", projectId)
        .eq("name", file.name)
        .single()
  
      // If name exists, add a suffix
      let uniqueName = file.name
      if (existingAsset) {
        const fileExtension = file.name.split('.').pop() || ''
        const baseName = file.name.replace(`.${fileExtension}`, '')
        const timestamp = Date.now()
        uniqueName = `${baseName}_${timestamp}.${fileExtension}`
      }
  
      const filePath = `${projectId}/${uniqueName}`
  
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("project-assets")
        .upload(filePath, file)
  
      if (uploadError) throw uploadError
  
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("project-assets")
        .getPublicUrl(filePath)
  
      // Create asset record
      const { error: dbError } = await supabase
        .from("assets")
        .insert({
          name: uniqueName,
          type: getMimeTypeCategory(file.type),
          url: publicUrl,
          project_id: projectId,
          owner_id: user.id,
          metadata: {
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
            storagePath: filePath
          }
        })
  
      if (dbError) throw dbError
  
      toast.success("Asset uploaded successfully", {
        description: existingAsset 
          ? "A file with this name already existed. Created with unique name."
          : undefined
      })
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload asset", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Asset</DialogTitle>
          <DialogDescription>Upload an asset to {projectId ? "this project" : "your global assets"}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept="image/*,.ttf,.otf,.woff,.woff2"
              disabled={loading}
            />
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Asset
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
