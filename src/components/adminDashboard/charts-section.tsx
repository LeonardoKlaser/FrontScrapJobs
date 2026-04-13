import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { BarChart3, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ChartsSection() {
  const { t } = useTranslation('admin')

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('charts.monthlyRevenue')}</CardTitle>
          <CardDescription>{t('charts.last6Months')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 md:h-56 flex flex-col items-center justify-center rounded-lg bg-muted/30 border border-border/50">
            <TrendingUp className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">{t('charts.revenuePlaceholder')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('charts.usersVsCancellations')}</CardTitle>
          <CardDescription>{t('charts.thisMonth')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 md:h-56 flex flex-col items-center justify-center rounded-lg bg-muted/30 border border-border/50">
            <BarChart3 className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">{t('charts.usersPlaceholder')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
