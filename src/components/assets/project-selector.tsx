'use client'

import { useState, useEffect } from 'react'
import type { Project } from '../../lib/types'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { cn } from '../../lib/utils'
import { Icons } from '../../lib/constances'
import { useTranslation } from 'react-i18next'

interface ProjectSelectorProps {
  projects: Project[]
  selectedProjectId: string
  onSelect: (projectId: string) => void
  placeholder?: string
  disabled?: boolean
  triggerClassName?: string
  includeAllOption?: boolean
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
  placeholder = 'Select a project',
  disabled = false,
  triggerClassName = '',
  includeAllOption = false,
}: ProjectSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const displayValue = selectedProject?.name || placeholder
  const { t } = useTranslation('assets')

  // Close popover when selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      setOpen(false)
    }
  }, [selectedProjectId])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', triggerClassName)}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2 truncate">
            <Icons.project className="h-4 w-4 shrink-0" />
            <span className="truncate">{displayValue}</span>
          </div>
          <Icons.chevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('assets:card.assignProject.search')} autoFocus />
          <CommandList>
            <CommandEmpty>{t('assets:card.assignProject.noProjectFound')}</CommandEmpty>
            <CommandGroup>
              {includeAllOption && (
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onSelect('all')
                    setOpen(false)
                  }}
                >
                  <Icons.checkmark
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedProjectId === 'all' ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {t('assets:card.assignProject.all')}
                </CommandItem>
              )}
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.id}
                  onSelect={(value) => {
                    onSelect(value)
                    setOpen(false)
                  }}
                >
                  <Icons.checkmark
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedProjectId === project.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {project.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
