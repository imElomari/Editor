'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

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
import { Icons } from '../lib/constances'
import { useTranslation } from 'react-i18next'

interface TrashItem {
  id: string
  name: string
  deleted_at: string
  type: 'project' | 'label'
  description?: string
}

export default function TrashPage() {
  const { user } = useAuth()
  const { t } = useTranslation(['common', 'assets'])
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<TrashItem[]>([])
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false)

  const fetchTrashItems = async () => {
    try {
      if (!user) return
      setLoading(true)

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Fetch deleted projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, deleted_at, description')
        .not('deleted_at', 'is', null)
        .gte('deleted_at', thirtyDaysAgo.toISOString())
        .eq('owner_id', user.id)

      // Fetch deleted labels
      const { data: labelsData, error: labelsError } = await supabase
        .from('labels')
        .select('id, name, deleted_at, description')
        .not('deleted_at', 'is', null)
        .gte('deleted_at', thirtyDaysAgo.toISOString())
        .eq('owner_id', user.id)

      if (projectsError) throw projectsError
      if (labelsError) throw labelsError

      const projectItems = (projectsData || []).map((p) => ({
        ...p,
        type: 'project' as const,
      }))
      const labelItems = (labelsData || []).map((l) => ({
        ...l,
        type: 'label' as const,
      }))

      setItems(
        [...projectItems, ...labelItems].sort(
          (a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
        )
      )
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load trash items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrashItems()
  }, [user])

  async function handleRestore() {
    try {
      const { error } = await supabase
        .from(selectedItem?.type === 'project' ? 'projects' : 'labels')
        .update({ deleted_at: null })
        .eq('id', selectedItem?.id)

      if (error) throw error

      toast.success(`${selectedItem?.type === 'project' ? 'Project' : 'Label'} restored`, {
        description: `"${selectedItem?.name}" has been restored successfully.`,
        icon: true,
      })
      fetchTrashItems()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error restoring item', {
        description: 'Failed to restore the item. Please try again.',
        icon: true,
      })
    } finally {
      setIsRestoreDialogOpen(false)
      setSelectedItem(null)
    }
  }

  async function handlePermanentDelete() {
    if (!selectedItem) return

    try {
      const { error } = await supabase
        .from(selectedItem.type === 'project' ? 'projects' : 'labels')
        .delete()
        .eq('id', selectedItem.id)

      if (error) throw error

      toast.success(
        `${selectedItem.type === 'project' ? 'Project' : 'Label'} deleted permanently`,
        {
          description: `"${selectedItem.name}" has been permanently deleted.`,
          icon: true,
        }
      )
      fetchTrashItems()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete item', {
        description: 'An unexpected error occurred. Please try again.',
        icon: true,
      })
    } finally {
      setIsPermanentDeleteDialogOpen(false)
      setSelectedItem(null)
    }
  }

  const getDaysRemaining = (deletedAt: string) => {
    const deleteDate = new Date(deletedAt)
    const expiryDate = new Date(deleteDate)
    expiryDate.setDate(expiryDate.getDate() + 30)
    const now = new Date()
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysRemaining
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Icons.loading className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="space-y-4 w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('common:trashPage.title')} </h1>
          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-2 rounded-md">
            <Icons.alert className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs sm:text-sm">{t('common:trashPage.description')}</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 sm:py-16 flex flex-col items-center justify-center text-center px-4">
            <Icons.delete className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('common:trashPage.isEmpty')}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {t('common:trashPage.msgIfEmpty')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    {item.type === 'project' ? (
                      <Icons.project className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Icons.label className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium flex flex-wrap items-center gap-2">
                      <span className="truncate">{item.name}</span>
                      <Badge variant="outline" className="flex-shrink-0">
                        {item.type === 'project'
                          ? t('common:badges.project')
                          : t('common:badges.label')}
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      <span className="whitespace-nowrap">
                        {t('common:trashPage.remainingDays', {
                          days: getDaysRemaining(item.deleted_at),
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="whitespace-nowrap">
                        {t('common:trashPage.deleted')}{' '}
                        {new Date(item.deleted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => {
                      setSelectedItem(item)
                      setIsRestoreDialogOpen(true)
                    }}
                  >
                    <Icons.reset className="h-4 w-4 mr-2" />
                    {t('common:buttons.restore')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => {
                      setSelectedItem(item)
                      setIsPermanentDeleteDialogOpen(true)
                    }}
                  >
                    <Icons.delete className="h-4 w-4 mr-2" />
                    {t('common:buttons.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle> {t('common:trashPage.restoreDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common:trashPage.restoreDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              {t('common:buttons.restore')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isPermanentDeleteDialogOpen} onOpenChange={setIsPermanentDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common:trashPage.deletePermanently.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common:trashPage.deletePermanently.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete}>
              {t('common:trashPage.deletePermanently.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
