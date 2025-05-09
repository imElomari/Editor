"use client"

import { useTranslation } from "react-i18next"
import { Asset, Project } from "../../lib/types"
import { Button } from "../ui/button"
import { ModalWrapper } from "../ui/modal-wrapper"
import { ProjectSelector } from "./project-selector"



interface ProjectAssignmentDialogProps {
  asset: Asset | null
  projects: Project[]
  selectedProjectId: string
  setSelectedProjectId: (projectId: string) => void
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onAssign: () => void
}

export function ProjectAssignmentDialog({
  asset,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  isOpen,
  isLoading,
  onClose,
  onAssign,
}: ProjectAssignmentDialogProps) {
  const { t } = useTranslation(['common', 'assets']);

  if (!asset) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{t('assets:card.assignProject.title')}
          </h2>
          <p className="text-muted-foreground">{t('assets:card.assignProject.placeholdre',asset?.name )}</p>
        </div>
        <div className="space-y-2">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={setSelectedProjectId}
            placeholder={t('assets:card.assignProject.title')}
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {t('common:buttons.cancel')}
          </Button>
          <Button onClick={onAssign} disabled={isLoading || !selectedProjectId}>
            {isLoading ? t('assets:card.assignProject.assigning') : t('assets:card.assignProject.confirm')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
