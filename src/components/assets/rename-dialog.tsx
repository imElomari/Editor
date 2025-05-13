'use client'

import { useState, useEffect } from 'react'
import { Asset } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModalWrapper } from '@/components/ui/modal-wrapper'
import { useTranslation } from 'react-i18next'

interface RenameDialogProps {
  asset: Asset | null
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onRename: (newName: string) => void
}

export function RenameDialog({ asset, isOpen, isLoading, onClose, onRename }: RenameDialogProps) {
  const [newName, setNewName] = useState('')
  const { t } = useTranslation(['common', 'assets'])

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
          <h2 className="text-xl font-semibold">{t('assets:card.rename.title')}</h2>
          <p className="text-muted-foreground">{t('assets:card.rename.placeholder')}</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="assetName" className="text-sm font-medium">
            {t('assets:card.rename.label')}
          </label>
          <Input
            id="assetName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('assets:card.rename.newName')}
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            onClick={() => onRename(newName)}
            disabled={isLoading || !newName || newName === asset?.name}
          >
            {isLoading ? t('assets:card.rename.renaming') : t('assets:card.rename.confirm')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
