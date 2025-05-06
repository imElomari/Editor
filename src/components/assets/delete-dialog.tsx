"use client"

import { Asset } from "../../lib/types"
import { Button } from "../ui/button"
import { ModalWrapper } from "../ui/modal-wrapper"



interface DeleteDialogProps {
  asset: Asset | null
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onDelete: () => void
}

export function DeleteDialog({ asset, isOpen, isLoading, onClose, onDelete }: DeleteDialogProps) {
  if (!asset) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Delete Asset</h2>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{asset?.name}"?
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Asset"}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
