'use client'

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Icons } from '../../lib/constances'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { useMobile } from '../../hooks/use-mobile'
import { Button } from '../ui/button'
import { Suspense } from 'react'

interface StatsCardsProps {
  stats: {
    totalProjects: number
    totalLabels: number
    recentActivity: number
    publishedLabels: number
    totalAssets: number
  }
  isRTL: boolean
  handleCreateLabel: () => void
}

// Loading component for individual stat cards
export function StatsCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-muted/30 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_1.5s_ease-in-out_infinite]" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-1/3 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-10 w-10 rounded-xl bg-muted/40 animate-pulse shadow-sm" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="h-7 w-28 bg-muted/60 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-muted/50 rounded-md animate-pulse" />
          <div className="flex gap-3 mt-6">
            <div className="h-5 w-20 bg-muted/40 rounded-full animate-pulse" />
            <div className="h-5 w-6 bg-muted/30 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-muted/50 to-transparent opacity-60" />
    </div>
  )
}

// Individual stat card component with loading state
function StatCard({ children, loading = false }: { children: React.ReactNode; loading?: boolean }) {
  if (loading) return <StatsCardSkeleton />
  return children
}

export default function StatsCards({ stats, isRTL, handleCreateLabel }: StatsCardsProps) {
  const { t } = useTranslation(['common', 'dashboard', 'projects', 'labels', 'assets'])
  const isMobile = useMobile()

  return (
    <div
      className={cn('grid gap-4 mb-8', isMobile ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4')}
    >
      <Suspense fallback={<StatsCardSkeleton />}>
        <StatCard loading={!stats.totalLabels}>
          <Card className={cn('overflow-hidden relative group', isRTL && 'rtl')}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-80"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            <CardHeader className="pb-2 relative">
              <div className={cn('flex items-center justify-between', isRTL && 'rtl')}>
                <CardTitle className={cn('text-sm font-medium', isRTL && 'rtl')}>
                  {t('dashboard:cards.labels.title')}
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Icons.labels className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                {stats.totalLabels}
              </div>
              <div className={cn('flex items-center gap-2 mt-2', isRTL && 'flex-row-reverse')}>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500 border-green-500/20"
                >
                  {stats.publishedLabels} {t('common:filter.status.published')}
                </Badge>
                {stats.publishedLabels > 0 && <Icons.trend className="h-4 w-4 text-green-500" />}
              </div>
            </CardContent>
          </Card>
        </StatCard>
      </Suspense>

      <Suspense fallback={<StatsCardSkeleton />}>
        <StatCard loading={!stats.totalLabels}>
          <Card className="overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-80"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            <CardHeader className="pb-2 relative">
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <CardTitle className="text-sm font-medium">
                  {t('dashboard:cards.projects.title')}
                </CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Icons.project className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                {stats.totalProjects}
              </div>
              <p
                className={cn(
                  'text-sm text-muted-foreground mt-2 flex items-center gap-1',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <Icons.mark className="h-4 w-4" />
                <span>{t('dashboard:cards.projects.subTitle')}</span>
              </p>
            </CardContent>
          </Card>
        </StatCard>
      </Suspense>

      <Suspense fallback={<StatsCardSkeleton />}>
        <StatCard loading={!stats.totalLabels}>
          <Card className="overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-500/5 opacity-80"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            <CardHeader className="pb-2 relative">
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <CardTitle className="text-sm font-medium">
                  {t('dashboard:cards.assets.title')}
                </CardTitle>
                <div className="p-2 bg-green-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Icons.asset className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                {stats.totalAssets}
              </div>
              <p
                className={cn(
                  'text-sm text-muted-foreground mt-2 flex items-center gap-1',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <Icons.file className="h-4 w-4" />
                <span>{t('dashboard:cards.assets.subTitle')}</span>
              </p>
            </CardContent>
          </Card>
        </StatCard>
      </Suspense>

      <Suspense fallback={<StatsCardSkeleton />}>
        <StatCard loading={!stats.totalLabels}>
          <Card className="overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5 opacity-80"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            <CardHeader className="pb-2 relative">
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <CardTitle className="text-sm font-medium">
                  {t('dashboard:cards.recent.title')}
                </CardTitle>
                <div className="p-2 bg-amber-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Icons.calendar className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                {stats.recentActivity}
              </div>
              <p
                className={cn(
                  'text-sm text-muted-foreground mt-2 flex items-center gap-1',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <Icons.clock className="h-4 w-4" />
                <span>{t('dashboard:cards.recent.subTitle')}</span>
              </p>
            </CardContent>
          </Card>
        </StatCard>
      </Suspense>

      <Suspense fallback={<StatsCardSkeleton />}>
        <StatCard loading={!stats.totalLabels}>
          <Card
            className="overflow-hidden relative group cursor-pointer hover:shadow-md transition-all duration-300"
            onClick={handleCreateLabel}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5 opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            <CardHeader className="pb-2 relative">
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <CardTitle className="text-sm font-medium">
                  {t('dashboard:cards.quickCreate.title')}
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Icons.sparkle className="h-4 w-4 text-purple-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Button
                variant="ghost"
                className={cn(
                  'group-hover:text-purple-500 transition-colors flex items-center gap-2',
                  isRTL ? 'pr-0' : 'pl-0',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
                  <Icons.plus className="h-4 w-4 relative z-10" />
                </div>
                <span className="font-medium">{t('dashboard:cards.quickCreate.action')}</span>
              </Button>
              <p
                className={cn(
                  'text-sm text-muted-foreground mt-2 flex items-center gap-1',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <Icons.zap className="h-4 w-4" />
                <span>{t('dashboard:cards.quickCreate.comment')}</span>
              </p>
            </CardContent>
          </Card>
        </StatCard>
      </Suspense>
    </div>
  )
}
