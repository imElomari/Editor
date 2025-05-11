'use client'

import { cn } from '../lib/utils'

import { useState } from 'react'
import type { Label } from '../lib/types'
import { supabase } from '../lib/supabase'
import { Edit3 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { useNavigate } from 'react-router-dom'
import { useMobile } from '../hooks/use-mobile'
import { Icons } from '../lib/constances'
import { useTranslation } from 'react-i18next'

interface LabelCardProps {
  label: Label
  onDelete: () => void
  onEdit: (label: Label) => void
}

export default function LabelCard({ label, onDelete, onEdit }: LabelCardProps) {
  const navigate = useNavigate()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isMobile = useMobile()
  const { t } = useTranslation(['common', 'labels'])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'archived':
        return 'destructive'
      default:
        return 'default'
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('labels')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', label.id)

      if (error) throw error

      toast.success('Label moved to trash', {
        description: `"${label.name}" has been moved to trash.`,
        action: {
          label: 'Undo',
          onClick: () => handleRestore(),
        },
        icon: true,
      })
      onDelete()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error deleting label', {
        description: 'An unexpected error occurred. Please try again.',
        icon: true,
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  async function handleRestore() {
    try {
      const { error } = await supabase
        .from('labels')
        .update({ deleted_at: null })
        .eq('id', label.id)

      if (error) throw error

      toast.success('Label restored', {
        description: `"${label.name}" has been restored successfully.`,
        icon: true,
      })
      onDelete() // Refresh the list
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error restoring label', {
        description: 'Failed to restore the label. Please try again.',
        icon: true,
      })
    }
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold line-clamp-1">{label.name}</CardTitle>
            <Badge variant={getStatusColor(label.status)}>
              {t(`common:filter.status.${label.status}`)}{' '}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'h-8 w-8 p-0',
                  isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                )}
              >
                <Icons.moreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  requestAnimationFrame(() => onEdit(label))
                }}
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                {t('labels:card.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  requestAnimationFrame(() => setIsDeleteDialogOpen(true))
                }}
              >
                <Icons.delete className="mr-2 h-4 w-4" />
                {t('labels:card.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {label.description || t('labels:card.noDescription')}
          </p>
          <Button className="w-full" onClick={() => navigate(`/editor/${label.id}`)}>
            <Edit3 className="h-4 w-4 mr-2" />
            {t('labels:card.actions.openEditor')}
          </Button>
        </CardContent>

        <CardFooter>
          <div className="flex items-center text-sm text-muted-foreground">
            <Icons.label className="mr-1 h-3 w-3" />
            {t('labels:card.createdAt')} {format(new Date(label.created_at), 'MMM d, yyyy')}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('labels:card.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('labels:card.deleteDialog.description', { labelName: label.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common:buttons.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('common:buttons.deleting') : t('labels:card.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
