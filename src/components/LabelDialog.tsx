'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Label, Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'
import { useMobile } from '@/hooks/use-mobile'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command'
import { cn } from '@/lib/utils'
import { Icons } from '@/lib/constances'
import { useTranslation } from 'react-i18next'

interface LabelDialogProps {
  label?: Label
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LabelDialog({ label, isOpen, onClose, onSuccess }: LabelDialogProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState({
    name: label?.name || '',
    description: label?.description || '',
    project_id: label?.project_id || '',
    label_json: label?.label_json || {},
    status: label?.status || 'draft',
  })
  const isMobile = useMobile()

  const isEditing = Boolean(label)
  const [open, setOpen] = useState(false)
  const { t } = useTranslation(['common', 'labels'])

  const fetchProjects = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id)
        .is('deleted_at', null)

      if (error) throw error
      setProjects(data || [])
    } catch {
      toast.error('Error fetching projects')
    }
  }, [user?.id])

  useEffect(() => {
    fetchProjects()
    if (label) {
      setFormData({
        name: label.name,
        description: label.description || '',
        project_id: label.project_id,
        label_json: label.label_json as object,
        status: label.status,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        project_id: '',
        label_json: {},
        status: 'draft',
      })
    }
  }, [label, fetchProjects])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('labels')
          .update({
            name: formData.name,
            description: formData.description,
            project_id: formData.project_id,
            label_json: formData.label_json,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', label?.id)

        if (error) throw error
        toast.success('Label updated', {
          description: `"${formData.name}" has been updated successfully.`,
          icon: true,
        })
        onSuccess()
        onClose()
      } else {
        // Creating new label
        const { data, error } = await supabase
          .from('labels')
          .insert([
            {
              name: formData.name,
              description: formData.description,
              project_id: formData.project_id,
              label_json: formData.label_json,
              status: formData.status,
              owner_id: user?.id,
            },
          ])
          .select()
          .single()

        if (error) throw error
        toast.success('Label created', {
          description: `"${formData.name}" has been created successfully.`,
          icon: true,
        })

        // Redirect to editor instead of closing
        navigate(`/editor/${data.id}`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} label`, {
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
            <Icons.labels className="h-5 w-5" />
            {isEditing ? t('labels:card.actions.edit') : t('labels:card.actions.create')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('labels:card.labelDialog.update') : t('labels:card.labelDialog.new')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('labels:card.labelDialog.projectLabel')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={loading}
                >
                  {formData.project_id
                    ? projects.find((project) => project.id === formData.project_id)?.name
                    : t('labels:card.labelDialog.projectPlaceholder')}
                  <Icons.chevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t('labels:card.labelDialog.projectSearch')} />
                  <CommandEmpty>{t('labels:card.labelDialog.noProjectFound')}</CommandEmpty>
                  <CommandGroup>
                    {projects.map((project) => (
                      <CommandItem
                        key={project.id}
                        value={project.name}
                        onSelect={() => {
                          setFormData({ ...formData, project_id: project.id })
                          setOpen(false)
                        }}
                      >
                        <Icons.checkmark
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.project_id === project.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {project.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('labels:card.labelDialog.labelName')} <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('labels:card.labelDialog.labelPlaceholder')}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('labels:card.labelDialog.descriptionLabel')}
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('labels:card.labelDialog.descriptionPlaceholder')}
              className="w-full min-h-[80px] sm:min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('labels:card.labelDialog.statusLabel')}
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as 'draft' | 'published' | 'archived',
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('labels:card.labelDialog.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('common:filter.status.draft')}</SelectItem>
                <SelectItem value="published">{t('common:filter.status.published')}</SelectItem>
                <SelectItem value="archived">{t('common:filter.status.archived')}</SelectItem>
              </SelectContent>
            </Select>
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
                t('labels:card.actions.update')
              ) : (
                t('labels:card.actions.create')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
