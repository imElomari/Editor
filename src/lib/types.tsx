export type Project = {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  export interface Label {
    id: string;
    project_id: string;
    owner_id: string;
    name: string;
    description?: string;
    label_json: unknown;
    preview_url?: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
    deleted_at?: string;
  };
  export type AssetType = 'vector' | 'background' | 'icon' | 'image' | 'font';
  
  export interface Asset {
    id: string;
    owner_id: string;
    project_id: string;
    name: string;
    type: AssetType;
    url: string;
    is_used?: boolean;
    metadata: {
      size: number;
      mimeType: string;
      path?: string;
      originalName?: string;
      bucket?: string;
      storagePath?: string;
      [key: string]: unknown;
    };
    created_at: string;
  }

export type AssetScope = "all" | "global" | "project"

export interface DashboardData {
  stats: {
    totalProjects: number
    totalLabels: number
    recentActivity: number
    publishedLabels: number
    totalAssets: number
  }
  recentItems: {
    projects: Project[]
    labels: (Label & { projects?: { name: string } })[]
    assets: Asset[]
  }
}