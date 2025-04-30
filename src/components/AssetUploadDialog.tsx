import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
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

  const getMimeTypeCategory = (mimeType: string): asset_type => {
    if (mimeType.startsWith('image/')) {
      if (mimeType === 'image/svg+xml') return 'vector';
      if (mimeType.includes('background')) return 'background';
      if (mimeType.includes('icon')) return 'icon';
      return 'image';
    }
    if (mimeType.startsWith('font/')) return 'font';
    return 'image'; // default fallback
  };
  
  const handleUpload = async () => {
    if (!file || !user) return;
  
    try {
      setLoading(true);
  
      // Create a safe filename
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const bucket = projectId ? 'project-assets' : 'global-assets';
      const filePath = projectId 
        ? `${projectId}/${safeFileName}`
        : `${user.id}/${safeFileName}`;
  
      // 1. Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
  
      if (uploadError) throw uploadError;
  
      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
  
      // Get image dimensions if it's an image
      let dimensions = null;
      if (file.type.startsWith('image/')) {
        dimensions = await new Promise<{ width: number; height: number } | null>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              width: img.width,
              height: img.height
            });
          };
          img.onerror = () => resolve(null);
          img.src = URL.createObjectURL(file);
        });
      }
  
      // 3. Create asset record with proper type handling
      const { error: dbError } = await supabase
        .from('assets')
        .insert([{
          name: safeFileName,
          type: getMimeTypeCategory(file.type), // Convert MIME type to enum
          url: publicUrl,
          project_id: projectId || null,
          owner_id: user.id,
          metadata: {
            size: file.size,
            mimeType: file.type,
            dimensions,
            lastModified: file.lastModified
          }
        }]);
  
      if (dbError) throw dbError;
  
      toast.success('Asset uploaded successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error uploading asset');
    } finally {
      setLoading(false);
    }
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