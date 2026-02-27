import type React from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/common/skeleton'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Globe,
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface KPICardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend?: 'positive' | 'negative' | 'neutral'
}

function TrendIcon({ trend }: { trend: 'positive' | 'negative' | 'neutral' }) {
  if (trend === 'positive') return <TrendingUp className="size-3.5 text-primary" />
  if (trend === 'negative') return <TrendingDown className="size-3.5 text-destructive" />
  return <Minus className="size-3.5 text-muted-foreground" />
}

function KPICard({ title, value, subtitle, icon, trend = 'neutral' }: KPICardProps) {
  return (
    <Card className="p-5 hover:border-primary/30 transition-colors duration-150 group hover-lift">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div className="text-muted-foreground group-hover:text-primary transition-colors duration-150">
          {icon}
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-bold font-display tracking-tight text-foreground">
        {value === '—' ? <Skeleton className="h-8 w-20 inline-block" /> : value}
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        <TrendIcon trend={trend} />
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Card>
  )
}

export interface KPICardsProps {
  totalRevenue: number
  activeUsers: number
  monitoredSites: number
  scrapingErrors: number
  isLoading: boolean
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function KPICards({
  totalRevenue,
  activeUsers,
  monitoredSites,
  scrapingErrors,
  isLoading
}: KPICardsProps) {
  const { t } = useTranslation('admin')
  const placeholder = isLoading ? '—' : undefined

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <KPICard
          title={t('kpi.revenue')}
          value={placeholder ?? formatCurrency(totalRevenue)}
          subtitle={t('kpi.revenueSubtitle')}
          icon={<DollarSign className="size-5" />}
          trend="positive"
        />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <KPICard
          title={t('kpi.activeUsers')}
          value={placeholder ?? String(activeUsers)}
          subtitle={t('kpi.activeUsersSubtitle')}
          icon={<Users className="size-5" />}
          trend="positive"
        />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <KPICard
          title={t('kpi.monitoredSites')}
          value={placeholder ?? String(monitoredSites)}
          subtitle={t('kpi.monitoredSitesSubtitle')}
          icon={<Globe className="size-5" />}
          trend="neutral"
        />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        <KPICard
          title={t('kpi.errors24h')}
          value={placeholder ?? String(scrapingErrors)}
          subtitle={t('kpi.errors24hSubtitle')}
          icon={<AlertTriangle className="size-5" />}
          trend={scrapingErrors > 0 ? 'negative' : 'neutral'}
        />
      </div>
    </div>
  )
}
