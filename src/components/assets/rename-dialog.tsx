"use client"

import { useState, useEffect } from "react"
import { Asset } from "../../lib/types"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ModalWrapper } from "../ui/modal-wrapper"



interface RenameDialogProps {
  asset: Asset | null
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onRename: (newName: string) => void
}

export function RenameDialog({ asset, isOpen, isLoading, onClose, onRename }: RenameDialogProps) {
  const [newName, setNewName] = useState("")

  // Update newName when asset changes
  useEffect(() => {
    if (asset) {
      setNewName(asset.name)
    }
  }, [asset])

  if (!asset) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Rename Asset</h2>
          <p className="text-muted-foreground">Enter a new name for the asset</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="assetName" className="text-sm font-medium">New Name</label>
          <Input
            id="assetName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={() => onRename(newName)} disabled={isLoading || !newName || newName === asset?.name}>
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
