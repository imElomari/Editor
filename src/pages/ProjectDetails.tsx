import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Project, Label, Asset } from "../lib/types";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Tags, 
  Image as ImageIcon, 
  Upload
} from "lucide-react";
import { toast } from "sonner";
import LabelCard from "../components/LabelCard";
import { LabelDialog } from "../components/LabelDialog";
import { AssetUploadDialog } from "../components/AssetUploadDialog";
import { getAssetUrl } from "../lib/utils";


export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("assets")



  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  async function fetchProjectData() {
    try {
      setLoading(true);
      const [projectData, labelsData, assetsData] = await Promise.all([
        // Fetch project details
        supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single(),
        
        // Fetch project labels
        supabase
          .from("labels")
          .select("*")
          .eq("project_id", projectId)
          .is("deleted_at", null),
        
        // Fetch project assets
        supabase
          .from("assets")
          .select("*")
          .eq("project_id", projectId)
      ]);

      if (projectData.error) throw projectData.error;
      if (labelsData.error) throw labelsData.error;
      if (assetsData.error) throw assetsData.error;

      setProject(projectData.data);
      setLabels(labelsData.data || []);
      setAssets(assetsData.data || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error fetching project data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }
  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground mt-1">
                {project.description || "No description provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="labels" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Labels ({labels.length})
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Assets ({assets.length})
            </TabsTrigger>
          </TabsList>

          {/* Labels Tab */}
          <TabsContent value="labels" className="mt-6">

            {labels.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {labels.map((label) => (
                  <LabelCard
                    key={label.id}
                    label={label}
                    onDelete={fetchProjectData}
                    onEdit={() => setIsLabelDialogOpen(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No labels yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsLabelDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first label
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-6">
          <div className="flex justify-end mb-6">
            <Button onClick={() => setIsAssetDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Asset
            </Button>
            </div>

            {assets.length > 0 ? (
  <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
    {assets.map((asset) => (
      <div 
        key={asset.id} 
        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        {asset.type === 'image' ? (
          <div className="relative w-full h-32 mb-2">
            <img 
                src={getAssetUrl(asset)}
                alt={asset.name}
                className="absolute inset-0 w-full h-full object-contain rounded-md"
                onError={(e) => {
                  console.error('Image failed to load:', asset.url);
                  e.currentTarget.src = '/placeholder-image.png';
                }}
              />
          </div>
        ) : (
          <div className="w-full h-32 bg-muted rounded-md mb-2 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="space-y-1">
          <p className="font-medium truncate">{asset.name}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{asset.type}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => window.open(asset.url, '_blank')}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No assets yet</p>
        </div>
      )}
            <AssetUploadDialog
            projectId={projectId}
            isOpen={isAssetDialogOpen}
            onClose={() => setIsAssetDialogOpen(false)}
            onSuccess={() => {
              fetchProjectData()
              setActiveTab("assets") 
            }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <LabelDialog
        isOpen={isLabelDialogOpen}
        onClose={() => setIsLabelDialogOpen(false)}
        onSuccess={fetchProjectData}
      />
    </div>
  );
}