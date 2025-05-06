import { supabase } from "../lib/supabase"
import type { Asset, AssetScope } from "../lib/types"

export async function fetchAssets(userId: string, assetScope: AssetScope, projectFilter: string, typeFilter: string) {
  try {
    let query = supabase
      .from("assets")
      .select(`
        *,
        projects(name)
      `)
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    // Apply scope filter
    if (assetScope === "global") {
      query = query.is("project_id", null)
    } else if (assetScope === "project") {
      query = query.not("project_id", "is", null)
    }

    // Apply project filter if selected
    if (projectFilter !== "all") {
      query = query.eq("project_id", projectFilter)
    }

    // Apply type filter if selected
    if (typeFilter !== "all") {
      // Fix: Match the type filter with the actual asset types in the database
      switch (typeFilter) {
        case "image":
          query = query.or("type.ilike.image/%")
          break
        case "font":
          query = query.or("type.ilike.font/%")
          break
        case "application":
          query = query.or("type.ilike.application/%")
          break
        case "text":
          query = query.or("type.ilike.text/%")
          break
        default:
          // If it's a specific type, use exact matching
          query = query.eq("type", typeFilter)
      }
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching assets:", error)
    throw error
  }
}

export async function fetchProjects(userId: string) {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .is("deleted_at", null)
      .order("name", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching projects:", error)
    throw error
  }
}

export async function deleteAsset(asset: Asset) {
  try {
    // Delete from storage first if storagePath exists
    if (asset.metadata?.storagePath) {
      const { error: storageError } = await supabase.storage.from("assets").remove([asset.metadata.storagePath])

      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`)
      }
    }

    // Delete from database
    const { error: dbError } = await supabase.from("assets").delete().eq("id", asset.id)

    if (dbError) throw dbError
  } catch (error) {
    console.error("Error deleting asset:", error)
    throw error
  }
}

export async function renameAsset(assetId: string, newName: string) {
  try {
    const { error } = await supabase
      .from("assets")
      .update({
        name: newName,
      })
      .eq("id", assetId)

    if (error) throw error
  } catch (error) {
    console.error("Error renaming asset:", error)
    throw error
  }
}

export async function makeAssetGlobal(assetId: string) {
  try {
    const { error } = await supabase
      .from("assets")
      .update({
        project_id: null,
      })
      .eq("id", assetId)

    if (error) throw error
  } catch (error) {
    console.error("Error making asset global:", error)
    throw error
  }
}

export async function assignAssetToProject(assetId: string, projectId: string) {
  try {
    const { error } = await supabase
      .from("assets")
      .update({
        project_id: projectId,
      })
      .eq("id", assetId)

    if (error) throw error
  } catch (error) {
    console.error("Error assigning asset to project:", error)
    throw error
  }
}
