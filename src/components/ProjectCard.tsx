"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../lib/types";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import { Icons } from "../lib/constances";

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
  onEdit: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onDelete,
  onEdit,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useMobile();

  async function handleDelete() {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("projects")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Project moved to trash", {
        description: `"${project.name}" has been moved to trash.`,
        action: {
          label: "Undo",
          onClick: () => handleRestore(),
        },
        icon: true,
      });
      onDelete();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error deleting project", {
        description: "An unexpected error occurred. Please try again.",
        icon: true,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  async function handleRestore() {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ deleted_at: null })
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Project restored", {
        description: `"${project.name}" has been restored successfully.`,
        icon: true,
      });
      onDelete(); // Refresh the list
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error restoring project", {
        description: "Failed to restore the project. Please try again.",
        icon: true,
      });
    }
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold line-clamp-1">
              {project.name}
            </CardTitle>
            <CardDescription className="flex items-center text-sm text-muted-foreground">
              <Icons.calendar className="mr-1 h-3 w-3" />
              {format(new Date(project.created_at), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 w-8 p-0",
                  isMobile
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
              >
                <Icons.moreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Icons.delete className="mr-2 h-4 w-4" />
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description || "No description provided"}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            View Project
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the project "{project.name}" and all its
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
