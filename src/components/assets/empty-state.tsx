"use client";

import { Icons } from "../../lib/constances";
import { Button } from "../ui/button";

interface EmptyStateProps {
  hasFilters: boolean;
  onUploadClick: () => void;
}

export function EmptyState({ hasFilters, onUploadClick }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-lg">
      <p className="text-muted-foreground">
        {hasFilters ? "No assets found matching your filters" : "No assets yet"}
      </p>
      <Button variant="outline" className="mt-4" onClick={onUploadClick}>
        <Icons.plus className="h-4 w-4 mr-2" />
        Upload Your First Asset
      </Button>
    </div>
  );
}
