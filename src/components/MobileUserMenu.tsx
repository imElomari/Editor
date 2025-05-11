'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu'
import { CircleUser } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { Icons } from '../lib/constances'
import { useTranslation } from 'react-i18next'

interface User {
  user_metadata?: {
    avatar_url?: string
    full_name?: string
  }
  email?: string
}

export const MobileUserMenu = ({ user, onSignOut }: { user: User; onSignOut: () => void }) => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['common', 'profile'])
  const isRTL = i18n.language === 'ar'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex items-center gap-2 h-9 px-2',
            'rounded-full',
            'hover:bg-accent/100 active:scale-95',
            'transition-all duration-200',
            'border border-border/100',
            'bg-background/80 backdrop-blur-sm'
          )}
        >
          <div className="relative">
            <Avatar className="h-7 w-7 rounded-full border-2 border-background">
              <AvatarImage
                src={user?.user_metadata?.avatar_url || '/placeholder.svg'}
                alt={user?.user_metadata?.full_name || user?.email}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10">
                <CircleUser className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isRTL ? 'start' : 'end'}
        sideOffset={8}
        className={cn(
          'w-56 p-2',
          'bg-background/95 backdrop-blur-sm',
          'border border-border/30',
          'shadow-lg rounded-lg',
          'animate-in fade-in-0 zoom-in-95'
        )}
      >
        <div className="px-2 pt-1 pb-2 border-b border-border/30">
          <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || ''}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className={cn(
            'flex items-center gap-2 h-9 px-2',
            'rounded-md text-sm',
            'cursor-pointer transition-colors',
            'hover:bg-accent focus:bg-accent',
            isRTL ? 'flex-row-reverse text-right' : ''
          )}
        >
          <Icons.user className="h-4 w-4 opacity-70" />
          <span>{t('profile:page.title')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onSignOut}
          className={cn(
            'flex items-center gap-2 h-9 px-2',
            'rounded-md text-sm',
            'cursor-pointer transition-colors',
            'hover:bg-destructive/10 focus:bg-destructive/10',
            'text-destructive hover:text-destructive',
            isRTL ? 'flex-row-reverse text-right' : ''
          )}
        >
          <Icons.logout className="h-4 w-4" />
          <span>{t('common:buttons.signout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
