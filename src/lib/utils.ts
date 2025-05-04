import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Asset } from "./types"

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
    return `${supabaseUrl}/storage/v1/object/public/${asset.metadata.bucket || "project-assets"}/${asset.metadata.storagePath}`
  }

  // Clean up the URL by removing any duplicate slashes
  const cleanUrl = asset.url.replace(/^\/+/, "").replace(/\/+/g, "/")

  // Construct the full URL
  return `${supabaseUrl}/${cleanUrl}`
}

export function getStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "")
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
