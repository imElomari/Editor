'use client'

import { useAuth } from '../@/context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../@/components/ui/button'
import { Icons } from '../@/lib/constances'
import { cn } from '../@/lib/utils'
import { useMobile } from '../../hooks/use-mobile'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '../@/components/ui/avatar'
import { useTranslation } from 'react-i18next'

type SidePanelProps = {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function SidePanel({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse = () => {},
}: SidePanelProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const isMobile = useMobile()
  const { t } = useTranslation('common')

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || 'U'
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 bg-background border-r shadow-xl transform transition-all duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:z-0',
        isCollapsed && !isMobile ? 'md:w-20' : 'md:w-72',
        'flex flex-col',
        'bg-gradient-to-b from-background to-background/95',
        isMobile ? 'w-[85%] max-w-[300px]' : ''
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b bg-background/50 backdrop-blur-sm">
        <div
          className={cn(
            'flex items-center',
            isCollapsed && !isMobile ? 'justify-center w-full' : 'space-x-3'
          )}
        >
          <Icons.label
            className={cn(
              'h-6 w-6 text-primary transition-all',
              isCollapsed && !isMobile ? 'h-7 w-7' : ''
            )}
          />
          {(!isCollapsed || isMobile) && (
            <span className="font-bold text-lg tracking-tight">Label Editor</span>
          )}
        </div>
        {isMobile ? (
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-background/80">
            <Icons.close className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn('hover:bg-background/80 transition-opacity', isCollapsed ? 'hidden' : '')}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icons.chevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Collapse toggle button for desktop collapsed state */}
      {isCollapsed && !isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 h-7 w-7 rounded-full border bg-background shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          aria-label="Expand sidebar"
        >
          <Icons.chevronRight className="h-4 w-4 text-primary" />
        </Button>
      )}

      {/* Profile Section */}
      <div
        className={cn(
          'p-5 border-b bg-muted/20',
          isCollapsed && !isMobile ? 'flex justify-center py-6' : ''
        )}
      >
        {isCollapsed && !isMobile ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/profile"
                  className="transition-transform hover:scale-105 duration-200"
                  onClick={isMobile ? onClose : undefined}
                >
                  <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                    <AvatarImage src={user?.user_metadata?.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user?.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                <p>{user?.user_metadata?.name || user?.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Link
            to="/profile"
            className="flex items-center space-x-4 group"
            onClick={isMobile ? onClose : undefined}
          >
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm transition-transform group-hover:scale-105 duration-200">
              <AvatarImage src={user?.user_metadata?.avatar_url || '/placeholder.svg'} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(user?.email || '')}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium truncate group-hover:text-primary transition-colors">
                {user?.user_metadata?.name || user?.email}
              </p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn('p-5 space-y-3 flex-grow', isCollapsed && !isMobile ? 'items-center' : '')}
      >
        {isCollapsed && !isMobile ? (
          <TooltipProvider>
            <div className="flex flex-col items-center space-y-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/"
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
                      isActive('/')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'hover:bg-accent hover:text-accent-foreground hover:scale-105'
                    )}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icons.home className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t('common:sidePanel.navigation.dashboard')}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/projects"
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
                      isActive('/projects')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'hover:bg-accent hover:text-accent-foreground hover:scale-105'
                    )}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icons.project className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t('common:sidePanel.navigation.projects')}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/labels"
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
                      isActive('/labels')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'hover:bg-accent hover:text-accent-foreground hover:scale-105'
                    )}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icons.labels className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t('common:sidePanel.navigation.labels')}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/assets"
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
                      isActive('/assets')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'hover:bg-accent hover:text-accent-foreground hover:scale-105'
                    )}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icons.asset className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t('common:sidePanel.navigation.assets')}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/trash"
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
                      isActive('/trash')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'hover:bg-accent hover:text-accent-foreground hover:scale-105'
                    )}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icons.delete className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t('common:sidePanel.navigation.trash')}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : (
          <>
            <Link
              to="/"
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive('/')
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={isMobile ? onClose : undefined}
            >
              <Icons.home className="h-5 w-5 min-w-5" />
              <span>{t('common:sidePanel.navigation.dashboard')}</span>
            </Link>
            <Link
              to="/projects"
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive('/projects')
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={isMobile ? onClose : undefined}
            >
              <Icons.project className="h-5 w-5 min-w-5" />
              <span>{t('common:sidePanel.navigation.projects')}</span>
            </Link>
            <Link
              to="/labels"
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive('/labels')
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={isMobile ? onClose : undefined}
            >
              <Icons.labels className="h-5 w-5 min-w-5" />
              <span>{t('common:sidePanel.navigation.labels')}</span>
            </Link>
            <Link
              to="/assets"
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive('/assets')
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={isMobile ? onClose : undefined}
            >
              <Icons.asset className="h-5 w-5 min-w-5" />
              <span>{t('common:sidePanel.navigation.assets')}</span>
            </Link>
            <Link
              to="/trash"
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive('/trash')
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={isMobile ? onClose : undefined}
            >
              <Icons.delete className="h-5 w-5 min-w-5" />
              <span>{t('common:sidePanel.navigation.trash')}</span>
            </Link>
          </>
        )}
      </nav>

      {/* Settings */}
      <div
        className={cn(
          'p-5 border-t mt-auto bg-muted/20 backdrop-blur-sm',
          isCollapsed && !isMobile ? 'flex flex-col items-center space-y-4 py-6' : ''
        )}
      >
        {isCollapsed && !isMobile ? (
          <TooltipProvider>
            <div className="flex flex-col items-center space-y-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      signOut()
                      if (isMobile) onClose()
                    }}
                    className="rounded-xl h-12 w-12 border border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-200 hover:scale-105"
                    aria-label="Sign out"
                  >
                    <Icons.logout className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{t('common:sidePanel.account.logout')}</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : (
          <>
            <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider px-2 mb-3">
              {t('common:sidePanel.account.settings')}
            </div>
            <div className="flex items-center justify-between mb-5">
              <Link
                to={`/profile`}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-200 w-full"
                onClick={isMobile ? onClose : undefined}
              >
                <Icons.user className="h-5 w-5 min-w-5" />
                <span>{t('common:sidePanel.account.profile')}</span>
              </Link>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-6 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-200"
              onClick={() => {
                signOut()
                if (isMobile) onClose()
              }}
            >
              <Icons.logout className="h-5 w-5" />
              <span>{t('common:buttons.signout')}</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
