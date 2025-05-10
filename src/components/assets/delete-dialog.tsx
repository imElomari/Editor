'use client'

import { useTranslation } from 'react-i18next'
import { Asset } from '../../lib/types'
import { Button } from '../ui/button'
import { ModalWrapper } from '../ui/modal-wrapper'

interface DeleteDialogProps {
  asset: Asset | null
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onDelete: () => void
}

export function DeleteDialog({ asset, isOpen, isLoading, onClose, onDelete }: DeleteDialogProps) {
  const { t } = useTranslation(['common', 'assets'])

  if (!asset) return null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{t('assets:card.deleteDialog.title')}</h2>
          <p className="text-muted-foreground">
            {t('assets:card.deleteDialog.description', { assetName: asset?.name })}
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common:buttons.cancel')}
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
            {isLoading ? t('common:buttons.deleting') : t('assets:card.deleteDialog.confirm')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
