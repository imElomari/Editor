import { File, FileCode, FileJson, FileText, ImageIcon, TypeIcon as TypeOutline } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export function getAssetIcon(type: string): LucideIcon {
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("font/")) return TypeOutline
  if (type === "application/json") return FileJson
  if (type === "text/css" || type === "application/javascript") return FileCode
  if (type === "text/plain") return FileText
  return File
}

export function getAssetTypeLabel(type: string): string {
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
