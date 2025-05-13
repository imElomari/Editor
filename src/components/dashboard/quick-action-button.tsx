'use client'

import { useState } from 'react'
import { Button, ButtonProps } from '../ui/button'
import { AssetUploadDialog } from '../AssetUploadDialog'
import { cn } from '@/lib/utils'
import { Icons } from '@/lib/constances'
import { useTranslation } from 'react-i18next'

interface QuickActionButtonProps extends ButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
  className?: string
}

export function QuickAssetButton({
  variant = 'default',
  size = 'default',
  showLabel = true,
  className,
  ...props
}: QuickActionButtonProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const { t } = useTranslation(['common', 'dashboard', 'projects', 'labels', 'assets'])

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsUploadDialogOpen(true)}
        className={cn('gap-2', className)}
        {...props}
      >
        <Icons.asset className="h-4 w-4" />
        {showLabel && t('assets:card.uploadDialog.title')}
      </Button>

      <AssetUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={() => setIsUploadDialogOpen(false)}
      />
    </>
  )
}
