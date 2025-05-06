import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Asset } from "./types"
import { ImageIcon, TypeOutline, FileJson, FileCode, FileText } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAssetUrl(asset: Asset): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "")

  // If the URL is already absolute, return it
  if (asset.url.startsWith("http")) {
    return asset.url
  }

  // If we have a storage path in metadata, use that
  if (asset.metadata?.storagePath) {
    return `${supabaseUrl}/storage/v1/object/public/assets/${asset.metadata.storagePath}`
  }

  // Clean up the URL by removing any duplicate slashes
  const cleanUrl = asset.url.replace(/^\/+/, "").replace(/\/+/g, "/")

  // Construct the full URL
  return `${supabaseUrl}/${cleanUrl}`
}

export function getStorageUrl(path: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "")
  return `${supabaseUrl}/storage/v1/object/public/assets/${path}`
}

export function getAssetIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("font/")) return TypeOutline
  if (type === "application/json") return FileJson
  if (type === "text/css" || type === "application/javascript") return FileCode
  if (type === "text/plain") return FileText
  return File
}

export function getAssetTypeLabel(type: string) {
  switch (type) {
    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/svg+xml":
      return "Image"
    case "font/ttf":
    case "font/otf":
    case "font/woff":
    case "font/woff2":
      return "Font"
    case "application/json":
      return "JSON"
    case "text/css":
      return "CSS"
    case "application/javascript":
    case "text/javascript":
      return "JavaScript"
    case "text/plain":
      return "Text"
    default:
      return "File"
  }
}

