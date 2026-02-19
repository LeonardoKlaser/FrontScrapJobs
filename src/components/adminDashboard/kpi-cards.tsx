import type React from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, Users, Globe, AlertTriangle } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend?: 'positive' | 'negative' | 'neutral'
  delay?: string
}

function KPICard({ title, value, subtitle, icon, trend = 'neutral', delay = '0s' }: KPICardProps) {
  const trendColor =
    trend === 'positive'
      ? 'text-success'
      : trend === 'negative'
        ? 'text-destructive'
        : 'text-foreground'

  return (
    <Card
      className="bg-card border-border p-4 md:p-6 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 group cursor-pointer transform hover:scale-105"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-muted-foreground text-xs md:text-sm font-medium truncate">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary group-hover:text-primary/80 transition-colors">
            {value}
          </p>
          <p className={`text-xs md:text-sm ${trendColor} leading-tight`}>{subtitle}</p>
        </div>
        <div className="text-primary opacity-60 group-hover:opacity-100 transition-opacity ml-2">
          {icon}
        </div>
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
  const placeholder = isLoading ? '...' : undefined

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <KPICard
        title="Faturamento (Mês)"
        value={placeholder ?? formatCurrency(totalRevenue)}
        subtitle="Receita de assinaturas ativas"
        icon={<TrendingUp size={20} className="md:w-6 md:h-6" />}
        trend="positive"
        delay="0.1s"
      />
      <KPICard
        title="Usuários Ativos"
        value={placeholder ?? String(activeUsers)}
        subtitle="Total de usuários cadastrados"
        icon={<Users size={20} className="md:w-6 md:h-6" />}
        trend="positive"
        delay="0.2s"
      />
      <KPICard
        title="Sites Monitorados"
        value={placeholder ?? String(monitoredSites)}
        subtitle="Sites com scraping ativo"
        icon={<Globe size={20} className="md:w-6 md:h-6" />}
        trend="neutral"
        delay="0.3s"
      />
      <KPICard
        title="Erros de Scraping (24h)"
        value={placeholder ?? String(scrapingErrors)}
        subtitle="Falhas nas últimas 24 horas"
        icon={<AlertTriangle size={20} className="md:w-6 md:h-6" />}
        trend={scrapingErrors > 0 ? 'negative' : 'neutral'}
        delay="0.4s"
      />
    </div>
  )
}
