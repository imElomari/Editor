"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Shapes, FolderKanban, Tag } from "lucide-react";
import { AssetUploadDialog } from "../AssetUploadDialog";
import { cn } from "../../lib/utils";

interface QuickActionProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const actions = [
    {
      title: "Upload Asset",
      description: "Add a new image or file to your assets",
      icon: Shapes,
      onClick: () => setIsUploadDialogOpen(true),
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Create Project",
      description: "Start a new project",
      icon: FolderKanban,
      onClick: () => (window.location.href = "/projects"),
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Create Label",
      description: "Design a new label",
      icon: Tag,
      onClick: () => (window.location.href = "/labels"),
      color: "bg-green-500/10 text-green-500",
    },
  ];

  return (
    <>
      <Card className={cn("border shadow-sm", className)}>
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto flex flex-col items-center justify-center py-6 gap-3 hover:bg-muted/50 transition-colors"
              onClick={action.onClick}
            >
              <div className={cn("p-2 rounded-full", action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <AssetUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={() => setIsUploadDialogOpen(false)}
      />
    </>
  );
}
