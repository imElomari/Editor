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
  
    // Update the handleUpload function

  const handleUpload = async () => {
    if (!file || !projectId || !user) {
      console.error("Missing required fields: file, projectId, or user");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.storage
          .from('project-assets')
          .upload(`${projectId}/${file.name}`, file);

      if (error) {
        console.error("Storage upload error:", error);
        return;
      }

      const { data } = supabase.storage
          .from('project-assets')
          .getPublicUrl(`${projectId}/${file.name}`);

      const publicUrl = data?.publicUrl;

      const { error: dbError } = await supabase
          .from('assets')
          .insert({
            name: file.name,
            type: file.type,
            url: publicUrl,
            project_id: projectId,
            owner_id: user.id, // Ensure this matches auth.uid()
          });

      if (dbError) {
        console.error("Database insertion error:", dbError);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Unexpected error:", err);
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