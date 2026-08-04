import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlans } from '@/hooks/usePlans'
import { trackLanding } from '@/lib/analytics'
import { PATHS } from '@/router/paths'
import { getLandingPlanBenefits } from './landing-plan-benefits'
import { SectionWrapper } from './section-wrapper'

export function PricingSection() {
  const { t, i18n } = useTranslation('landing')
  const { data: plans, isLoading, isError, isSuccess, errorUpdateCount, refetch } = usePlans()
  const navigate = useNavigate()
  const lastTrackedTerminalError = useRef<number | null>(null)
  const visibleFailureAttempt = useRef(0)

  useEffect(() => {
    if (plans && window.location.hash === '#pricing') {
      const timer = setTimeout(() => {
        const el = document.getElementById('pricing')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [plans])

  useEffect(() => {
    if (isSuccess) {
      lastTrackedTerminalError.current = null
      visibleFailureAttempt.current = 0
      return
    }
    if (!isError || lastTrackedTerminalError.current === errorUpdateCount) return
    lastTrackedTerminalError.current = errorUpdateCount
    visibleFailureAttempt.current += 1
    trackLanding('lp_plans_load_error', { attempt: visibleFailureAttempt.current })
  }, [errorUpdateCount, isError, isSuccess])

  const handleSubscribeDirect = (id: number, name: string, position: number) => {
    trackLanding('lp_plan_click', {
      plan_id: id,
      plan_name: name,
      position,
      origin: 'landing_pricing'
    })
    navigate(`${PATHS.signup}?plan=${id}`)
  }

  if (isLoading) {
    return (
      <SectionWrapper id="pricing">
        <div className="py-16 lg:py-20 px-6 text-center text-muted-foreground">
          {t('pricing.loading')}
        </div>
      </SectionWrapper>
    )
  }

  if (isError) {
    return (
      <SectionWrapper id="pricing">
        <div className="py-16 lg:py-20 px-6 text-center">
          <div role="alert" className="text-muted-foreground">
            {t('pricing.loadError')}
          </div>
          <Button className="mt-4" onClick={() => void refetch()}>
            {t('pricing.retry')}
          </Button>
        </div>
      </SectionWrapper>
    )
  }

  const all = plans ? [...plans] : []
  const paid = all.filter((plan) => !plan.is_trial).sort((a, b) => a.price - b.price)

  return (
    <SectionWrapper id="pricing">
      <div className="py-16 lg:py-20 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
              {t('pricing.overline')}
            </span>
            <h2 className="font-display text-3xl lg:text-5xl font-semibold text-foreground mb-6 mt-3 tracking-tight text-balance">
              {t('pricing.title')}
            </h2>
            <p className="text-base text-muted-foreground mt-3">{t('pricing.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {paid.map((plan, index) => {
              const isPopular = index === 0
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col bg-background border rounded-2xl p-8 transition-all duration-150 animate-fade-in-up hover-lift ${
                    isPopular
                      ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative'
                      : 'border-border relative'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('pricing.starter')}
                    </span>
                  )}

                  <div className="text-center pb-4">
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="font-display text-[44px] font-bold text-foreground">
                        {new Intl.NumberFormat(i18n.language, {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(plan.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 space-y-6">
                    <ul className="space-y-3 flex-1">
                      {getLandingPlanBenefits(plan).map((benefit) => (
                        <li key={benefit.key} className="flex items-start gap-3">
                          <Check
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500"
                            aria-hidden
                          />
                          <span className="text-muted-foreground">
                            {t(`pricing.benefits.${benefit.key}`, benefit.values)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      id={`cta-plan-${plan.name
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                      variant="glow"
                      size="lg"
                      className="w-full h-auto py-4 text-base font-semibold rounded-lg"
                      onClick={() => handleSubscribeDirect(plan.id, plan.name, index + 1)}
                    >
                      {t('pricing.subscribePlan', { name: plan.name })}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-xs text-muted-foreground">{t('pricing.footer')}</p>
        </div>
      </div>
    </SectionWrapper>
  )
}
