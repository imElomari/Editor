"use client";

import { useTranslation } from "react-i18next";
import { Icons } from "../../lib/constances";
import { Button } from "../ui/button";

interface EmptyStateProps {
  hasFilters: boolean;
  onUploadClick: () => void;
}

export function EmptyState({ hasFilters, onUploadClick }: EmptyStateProps) {
  const { t } = useTranslation(['common', 'assets']);

  return (
    <div className="text-center py-12 bg-muted/30 rounded-lg">
      <p className="text-muted-foreground">
        {hasFilters ? t('assets:empty.noProjects') : t('assets:empty.noResults')}
      </p>
      <Button variant="outline" className="mt-4" onClick={onUploadClick}>
        <Icons.plus className="h-4 w-4 mr-2" />
        {t('assets:page.createFirst')}

      </Button>
    </div>
  );
}
