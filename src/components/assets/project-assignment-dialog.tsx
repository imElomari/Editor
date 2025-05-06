"use client"

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
  if (!asset) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Select Project</h2>
          <p className="text-muted-foreground">Choose a project to assign "{asset?.name}" to</p>
        </div>
        <div className="space-y-2">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={setSelectedProjectId}
            placeholder="Select a project"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onAssign} disabled={isLoading || !selectedProjectId}>
            {isLoading ? "Assigning..." : "Assign to Project"}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
