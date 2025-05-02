import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

interface AssetUploadDialogProps {
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssetUploadDialog({ projectId, isOpen, onClose, onSuccess }: AssetUploadDialogProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  

  const handleUpload = async () => {  
    if (!file) return;
    
    setLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
  
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // 1. Upload to storage bucket
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(filePath, file, {
          upsert: false,
          cacheControl: '3600'
        });
  
      if (uploadError) throw uploadError;
      if (!storageData) throw new Error('Upload failed - no data returned');
  
      // 2. Get the complete storage URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-assets')
        .getPublicUrl(filePath);
  
      // 3. Insert record into assets table
      const { data: assetData, error: dbError } = await supabase
        .from('assets')
        .insert([
          {
            name: file.name,
            type: getAssetType(file.type),
            url: publicUrl, // Use Supabase's generated public URL
            owner_id: user.id,
            project_id: projectId || null,
            metadata: {
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              storagePath: filePath,
              bucket: 'project-assets'
            }
          }
        ])
        .select()
        .single();
  
      if (dbError) throw dbError;
      
      console.log('Asset created:', assetData);
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to map MIME types to your asset_type enum
  const getAssetType = (mimeType: string): 'image' | 'background' | 'font' | 'vector' | 'icon' => {
    if (mimeType.startsWith('image/')) {
      if (mimeType === 'image/svg+xml') return 'vector';
      return 'image';
    }
    if (mimeType.startsWith('font/')) return 'font';
    return 'image'; // default fallback
  };

  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Asset</DialogTitle>
          <DialogDescription>
            Upload an asset to {projectId ? "this project" : "your global assets"}
          </DialogDescription>
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
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
          >
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
  );
}