import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ChartsSection() {
  const { t } = useTranslation('admin')

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in-up">
      <Card className="p-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground mb-1">
          {t('charts.monthlyRevenue')}
        </h2>
        <p className="text-xs text-muted-foreground mb-6">{t('charts.last6Months')}</p>
        <div className="h-48 md:h-56 flex flex-col items-center justify-center rounded-lg bg-muted/30 border border-border/50">
          <TrendingUp className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{t('charts.revenuePlaceholder')}</p>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground mb-1">
          {t('charts.usersVsCancellations')}
        </h2>
        <p className="text-xs text-muted-foreground mb-6">{t('charts.thisMonth')}</p>
        <div className="h-48 md:h-56 flex flex-col items-center justify-center rounded-lg bg-muted/30 border border-border/50">
          <BarChart3 className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{t('charts.usersPlaceholder')}</p>
        </div>
      </Card>
    </div>
  )
}
