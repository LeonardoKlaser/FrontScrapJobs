import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Check, Clock, ShieldCheck, Lock, Sparkles } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import { PATHS } from '@/router/paths'
import { SectionWrapper } from './section-wrapper'

export function PricingSection() {
  const { t, i18n } = useTranslation('landing')
  const { data: plans, isLoading } = usePlans()
  const navigate = useNavigate()

  useEffect(() => {
    if (plans && window.location.hash === '#pricing') {
      const timer = setTimeout(() => {
        const el = document.getElementById('pricing')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [plans])

  const handleStartTrial = () => navigate(PATHS.signup)
  const handleSubscribeDirect = (planId: number) => navigate(PATHS.checkout(String(planId)))

  if (isLoading) {
    return (
      <SectionWrapper id="pricing">
        <div className="py-16 lg:py-20 px-6 text-center text-zinc-500">{t('pricing.loading')}</div>
      </SectionWrapper>
    )
  }

  const all = plans ? [...plans] : []
  const trial = all.find((p) => p.is_trial)
  const paid = all.filter((p) => !p.is_trial).sort((a, b) => a.price - b.price)
  const midIndex = Math.floor(paid.length / 2)

  return (
    <SectionWrapper id="pricing">
      <div className="py-16 lg:py-20 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
              {t('labels.pricing')}
            </span>
            <h2 className="font-display text-3xl lg:text-5xl font-semibold text-zinc-900 mb-6 mt-3 tracking-tight text-balance">
              {t('pricing.title')}
            </h2>
            <p className="text-base text-zinc-500 mt-3">{t('pricing.subtitle')}</p>
          </div>

          {trial && (
            <div className="mb-12 max-w-3xl mx-auto">
              <div className="relative rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 p-8 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {t('pricing.trialBadge')}
                </span>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-2xl font-bold text-zinc-900">{t('pricing.trialTitle')}</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-6">{t('pricing.trialSubtitle')}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-8 text-left">
                  {[
                    'pricing.trialFeatures.sites',
                    'pricing.trialFeatures.analyses',
                    'pricing.trialFeatures.extractions',
                    'pricing.trialFeatures.suggestions',
                    'pricing.trialFeatures.pdfs'
                  ].map((key) => (
                    <li key={key} className="flex items-center gap-2 text-sm text-zinc-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <Button
                  id="cta-plan-trial"
                  variant="glow"
                  size="lg"
                  className="rounded-lg px-8 py-4 text-base font-semibold"
                  onClick={handleStartTrial}
                >
                  {t('pricing.trialCta')}
                </Button>
              </div>
            </div>
          )}

          <p className="text-sm font-medium text-emerald-600 mb-8">{t('pricing.badge')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {paid.map((plan, index) => {
              const isPopular = index === midIndex
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col bg-white border rounded-2xl p-8 transition-all duration-150 animate-fade-in-up hover-lift ${
                    isPopular
                      ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative'
                      : 'border-zinc-200 relative'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('pricing.popular')}
                    </span>
                  )}

                  <div className="text-center pb-4">
                    <h3 className="text-2xl font-bold text-zinc-900">
                      {t('pricing.planName', { name: plan.name })}
                    </h3>
                    <div className="mt-4">
                      <span className="font-display text-[44px] font-bold text-zinc-900">
                        {new Intl.NumberFormat(i18n.language, {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(plan.price)}
                      </span>
                      <span className="text-sm text-zinc-500">{t('pricing.perMonth')}</span>
                    </div>
                    <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 mt-3">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {t('pricing.savingsAnchor', { hours: plan.max_ai_analyses })}
                    </p>
                  </div>

                  <div className="flex flex-col flex-1 space-y-6">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-zinc-500">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div>
                      <Button
                        id={`cta-plan-${plan.name
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                        variant="glow"
                        size="lg"
                        className="w-full h-auto py-4 text-base font-semibold rounded-lg"
                        onClick={() => handleSubscribeDirect(plan.id)}
                      >
                        {t('pricing.paidCta')}
                      </Button>

                      <p className="text-xs text-zinc-400 mt-2">{t('pricing.paidSubtext')}</p>

                      <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 text-center pt-2 mt-6 border-t border-zinc-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {t('pricing.guarantee')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 flex flex-col items-center gap-2 animate-fade-in-up [animation-delay:400ms]">
            <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Lock className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  {t('lgpd.badge')}
                </p>
                <p className="text-xs text-zinc-500">{t('lgpd.encryption')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
