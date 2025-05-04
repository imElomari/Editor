"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { useSupabaseUpload } from "../hooks/use-supabase-upload"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import { useAuth } from "../context/AuthContext"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./dropzone"
import { supabase } from "../lib/supabase"
import { AlertCircle, CheckCircle, Loader2, Upload, XCircle } from "lucide-react"

interface AssetUploadDialogProps {
  projectId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AssetUploadDialog({ projectId, isOpen, onClose, onSuccess }: AssetUploadDialogProps) {
  const { user } = useAuth()

  const dropzoneProps = useSupabaseUpload({
    bucketName: "project-assets",
    path: projectId ? `${projectId}` : `global/${user?.id}`,
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 1,
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "font/ttf",
      "font/otf",
      "font/woff",
      "font/woff2",
      "application/json",
      "text/css",
      "text/javascript",
      "application/javascript",
      "text/plain",
    ],
    upsert: true,
  })

  const { loading, isSuccess, files } = dropzoneProps

  const handleUpload = async () => {
    if (!files[0] || !user) {
      toast.error("Please select a file to upload", {
        description: "You need to select a file before uploading.",
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
      })
      return
    }

    try {
      const file = files[0]
      const timestamp = new Date().getTime()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const storagePath = projectId
        ? `${projectId}/${timestamp}-${sanitizedFileName}`
        : `global/${user.id}/${timestamp}-${sanitizedFileName}`

      // Check if file already exists in the database
      const { data: existingAsset } = await supabase
        .from("assets")
        .select()
        .eq("name", sanitizedFileName)
        .eq("owner_id", user.id)
        .eq("project_id", projectId || null)
        .single()

      if (existingAsset) {
        toast.error("File already exists", {
          description: `A file with the name "${sanitizedFileName}" already exists.`,
          icon: <AlertCircle className="h-5 w-5 text-destructive" />,
        })
        return
      }
      
      // Upload file to storage bucket first
      const { error: uploadError } = await supabase.storage.from("project-assets").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("project-assets").getPublicUrl(storagePath)

      // Create asset record with the correct public URL
      const { error: dbError } = await supabase.from("assets").insert({
        name: sanitizedFileName,
        type: getMimeTypeCategory(file.type),
        url: publicUrl, // Use the actual public URL
        project_id: projectId || null,
        owner_id: user.id,
        metadata: {
          size: file.size,
          mimeType: file.type,
          bucket: "project-assets",
          storagePath: storagePath,
          originalName: file.name,
          lastModified: file.lastModified,
          uploadedAt: new Date().toISOString(),
        },
      })

      if (dbError) {
        // Cleanup on database error
        await supabase.storage.from("project-assets").remove([storagePath])

        throw new Error(`Database error: ${dbError.message}`)
      }

      toast.success("Asset uploaded successfully", {
        description: `${sanitizedFileName} has been uploaded.`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Failed to upload asset",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Asset
          </DialogTitle>
          <DialogDescription>
            Upload an asset to {projectId ? "this project" : "your global assets"} collection
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Dropzone {...dropzoneProps} className="min-h-[200px] flex items-center justify-center">
            <DropzoneContent />
            <DropzoneEmptyState />
          </Dropzone>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || loading || isSuccess}
            className="min-w-[100px] relative"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
                <span className="absolute bottom-0 left-0 h-[2px] bg-primary/50 animate-progress"></span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getMimeTypeCategory(mimeType: string) {
  // Map MIME types to their corresponding asset_type enum values
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return "image/jpeg"
    case "image/png":
      return "image/png"
    case "image/gif":
      return "image/gif"
    case "image/svg+xml":
      return "image/svg+xml"
    case "font/ttf":
      return "font/ttf"
    case "font/otf":
      return "font/otf"
    case "font/woff":
      return "font/woff"
    case "font/woff2":
      return "font/woff2"
    case "application/json":
      return "application/json"
    case "text/css":
      return "text/css"
    case "text/javascript":
    case "application/javascript":
      return "application/javascript"
    case "text/plain":
      return "text/plain"
    default:
      return "other"
  }
}
export const FILE_EXTENSIONS = {
  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
  // Fonts
  "font/ttf": [".ttf"],
  "font/otf": [".otf"],
  "font/woff": [".woff"],
  "font/woff2": [".woff2"],
  // Documents
  "application/json": [".json"],
  "text/css": [".css"],
  "text/javascript": [".js"],
  "application/javascript": [".js"],
  "text/plain": [".txt", ".md"],
} as const

export function getMimeTypeFromExtension(filename: string): string | undefined {
  const ext = `.${filename.split(".").pop()?.toLowerCase()}`
  for (const [mimeType, extensions] of Object.entries(FILE_EXTENSIONS)) {
    if ((extensions as readonly string[]).includes(ext)) {
      return mimeType
    }
  }
  return undefined
}
