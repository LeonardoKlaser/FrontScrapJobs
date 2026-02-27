import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/common/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ScrapingError } from '@/services/adminDashboardService'
import { useTranslation } from 'react-i18next'

interface ActivityLogsProps {
  errors: ScrapingError[]
  isLoading: boolean
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function ActivityLogs({ errors, isLoading }: ActivityLogsProps) {
  const { t } = useTranslation('admin')

  return (
    <Card className="p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t('activityLogs.title')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('activityLogs.subtitle')}</p>
        </div>
        {!isLoading && (
          <Badge variant={errors.length > 0 ? 'destructive' : 'default'}>
            {errors.length > 0 ? (
              <>
                <AlertTriangle className="size-3" />
                {errors.length} {t('activityLogs.errorCount', { count: errors.length })}
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3" />
                {t('activityLogs.allGood')}
              </>
            )}
          </Badge>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2.5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('activityLogs.dateTime')}
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('activityLogs.site')}
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('activityLogs.errorMessage')}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 px-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-2.5 px-3">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-2.5 px-3">
                      <Skeleton className="h-4 w-40" />
                    </td>
                  </tr>
                ))}
              </>
            ) : errors.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <EmptyState icon={CheckCircle2} title={t('activityLogs.empty')} />
                </td>
              </tr>
            ) : (
              errors.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors duration-150"
                >
                  <td className="py-2.5 px-3 text-sm font-mono text-muted-foreground whitespace-nowrap">
                    {formatDate(log.created_at)} {formatTime(log.created_at)}
                  </td>
                  <td className="py-2.5 px-3 text-sm font-medium text-foreground">
                    {log.site_name}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="destructive" className="font-normal max-w-xs truncate">
                      {log.error_message}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
