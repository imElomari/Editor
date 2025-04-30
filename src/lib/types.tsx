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
  export interface Asset {
    id: string;
    owner_id: string;
    project_id: string;
    name: string;
    type: string;
    url: string;
    metadata: {
      size: number;
      mimeType: string;
      [key: string]: unknown;
    };
    created_at: string;
  }