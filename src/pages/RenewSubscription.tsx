import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Check, Zap } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import { PATHS } from '@/router/paths'
import { LoadingSection } from '@/components/common/loading-section'

export default function RenewSubscription() {
  const { t } = useTranslation('plans')
  const { data: plans, isLoading } = usePlans()

  if (isLoading) {
    return <LoadingSection variant="full" label={t('renew.loading')} />
  }

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      {/* Warning banner */}
      <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 mb-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{t('renew.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('renew.description')}</p>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <Card key={plan.id} className="relative flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-display text-2xl font-bold text-foreground">
                  {plan.price === 0
                    ? 'Grátis'
                    : `R$${plan.price.toFixed(2).replace('.', ',')}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-xs text-muted-foreground">/mês</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="space-y-2 flex-1">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {t('renew.sites', { count: plan.max_sites })}
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {plan.max_ai_analyses === 0
                    ? t('renew.unlimitedAnalyses')
                    : t('renew.analyses', { count: plan.max_ai_analyses })}
                </li>
              </ul>
              <Link to={PATHS.checkout(String(plan.id))} className="w-full">
                <Button variant="glow" className="w-full gap-2" size="sm">
                  <Zap className="h-3.5 w-3.5" />
                  {t('renew.subscribe')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
