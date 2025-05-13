'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMobile } from '@/hooks/use-mobile'
import { Icons } from '@/lib/constances'
import { useTranslation } from 'react-i18next'

interface ProjectDialogProps {
  project?: Project
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProjectDialog({ project, isOpen, onClose, onSuccess }: ProjectDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
  })
  const isMobile = useMobile()

  const isEditing = Boolean(project)
  const { t } = useTranslation(['common', 'projects'])

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
      })
    } else {
      setFormData({ name: '', description: '' })
    }
  }, [project])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name,
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project?.id)

        if (error) throw error
        toast.success('Project updated', {
          description: `"${formData.name}" has been updated successfully.`,
          icon: true,
        })
      } else {
        const { error } = await supabase.from('projects').insert([
          {
            name: formData.name,
            description: formData.description,
            owner_id: user?.id,
          },
        ])

        if (error) throw error
        toast.success('Project created', {
          description: `"${formData.name}" has been created successfully.`,
          icon: true,
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} project`, {
        description: 'An unexpected error occurred. Please try again.',
        icon: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isMobile ? 'w-[calc(100%-32px)] p-4' : 'sm:max-w-[500px]'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.project className="h-5 w-5" />
            {isEditing ? t('projects:card.actions.edit') : t('projects:card.actions.create')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('projects:card.projectDialog.update')
              : t('projects:card.projectDialog.new')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('projects:card.projectDialog.nameLabel')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('projects:card.projectDialog.namePlaceholder')}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('projects:card.projectDialog.descriptionLabel')}
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('projects:card.projectDialog.descriptionPlaceholder')}
              className="w-full min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 sm:pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('common:buttons.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? t('common:buttons.updating') : t('common:buttons.creating')}
                </>
              ) : isEditing ? (
                t('projects:card.actions.update')
              ) : (
                t('projects:card.actions.create')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
