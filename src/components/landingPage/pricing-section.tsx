import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Check, Clock, ShieldCheck, Lock } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import { PATHS } from '@/router/paths'

export function PricingSection() {
  const { t, i18n } = useTranslation('landing')
  const { data: plans, isLoading, isError, refetch } = usePlans()
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

  const handleChoosePlan = (planId: number) => {
    navigate(PATHS.checkout(planId.toString()))
  }

  if (isLoading) {
    return (
      <section id="pricing">
        <div className="py-16 px-6 text-center text-zinc-500">{t('pricing.loading')}</div>
      </section>
    )
  }

  if (isError || !plans || plans.length === 0) {
    return (
      <section id="pricing">
        <div className="py-16 px-6 text-center">
          <div className="max-w-md mx-auto bg-white border border-zinc-200 rounded-2xl p-8">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-zinc-900">
              {t('pricing.errorTitle')}
            </h3>
            <p className="mt-2 text-sm text-zinc-500">{t('pricing.errorSubtitle')}</p>
            <Button variant="glow" size="lg" className="mt-6" onClick={() => refetch()}>
              {t('pricing.retry')}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)
  const midIndex = Math.floor(sortedPlans.length / 2)

  return (
    <section id="pricing">
      <div className="py-16 px-6 text-center">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="mb-16">
            <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
              {t('labels.pricing')}
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-zinc-900 mb-6 mt-3 tracking-tight text-balance">
              {t('pricing.title')}
            </h2>
            <p className="text-base text-zinc-500 mt-3">{t('pricing.subtitle')}</p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {sortedPlans.map((plan, index) => {
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
                          className="w-full"
                          onClick={() => handleChoosePlan(plan.id)}
                        >
                          {t('pricing.cta')}
                        </Button>

                        {/* Risk-Free Guarantee */}
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

            {/* Urgency line */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-10 text-center text-sm text-amber-600 flex items-center justify-center gap-2"
            >
              <span aria-hidden>⚡</span>
              {t('pricing.urgency')}
            </motion.p>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                {t('lgpd.badge')}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {t('lgpd.encryption')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
