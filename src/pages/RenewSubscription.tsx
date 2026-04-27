import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Check, Zap } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import { PATHS } from '@/router/paths'
import { LoadingSection } from '@/components/common/loading-section'

export default function RenewSubscription() {
  const { t, i18n } = useTranslation('plans')
  const { data: plans, isLoading, refetch, isFetching } = usePlans()

  if (isLoading) {
    return <LoadingSection variant="full" label={t('renew.loading')} />
  }

  const sortedPlans = plans
    ? [...plans].filter((p) => !p.is_trial).sort((a, b) => a.price - b.price)
    : []
  const midIndex = Math.floor(sortedPlans.length / 2)

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 mb-12">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{t('renew.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('renew.description')}</p>
        </div>
      </div>

      {sortedPlans.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground">{t('renew.emptyTitle')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('renew.emptyDescription')}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {t('renew.emptyRetry')}
          </Button>
        </div>
      ) : (
        // Cards seguem o mesmo visual da landing (pricing-section.tsx): max-w-5xl,
        // gap-8, popular destacado em emerald + shadow + badge. Mantemos tokens
        // semânticos (bg-card, text-foreground) pra preservar dark mode.
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sortedPlans.map((plan, index) => {
            const isPopular = index === midIndex
            return (
              <div
                key={plan.id}
                className={
                  'relative flex flex-col rounded-2xl bg-card p-8 transition-all duration-150' +
                  ' hover-lift ' +
                  (isPopular
                    ? 'border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                    : 'border border-border')
                }
              >
                {isPopular && (
                  <span
                    className={
                      'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500' +
                      ' px-3 py-1 text-xs font-bold text-white'
                    }
                  >
                    {t('renew.popular')}
                  </span>
                )}

                <div className="text-center pb-6">
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="font-display text-[44px] font-bold leading-none text-foreground">
                      {plan.price === 0
                        ? t('renew.free')
                        : new Intl.NumberFormat(i18n.language, {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-muted-foreground">{t('renew.perMonth')}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-6">
                  <ul className="space-y-3 flex-1">
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">
                        {t('renew.sites', { count: plan.max_sites })}
                      </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">
                        {plan.max_ai_analyses === 0
                          ? t('renew.unlimitedAnalyses')
                          : t('renew.analyses', { count: plan.max_ai_analyses })}
                      </span>
                    </li>
                  </ul>

                  <Link to={PATHS.checkout(String(plan.id))} className="w-full">
                    <Button
                      variant="glow"
                      size="lg"
                      className="w-full h-auto rounded-lg gap-2 py-4 text-base font-semibold"
                    >
                      <Zap className="h-4 w-4" />
                      {t('renew.subscribe')}
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
