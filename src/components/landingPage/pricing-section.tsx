import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import { useNavigate } from 'react-router'
import { PATHS } from '@/router/paths'

export function PricingSection() {
  const { t } = useTranslation('landing')
  const [isQuarterly, setIsQuarterly] = useState(false)
  const { data: plans, isLoading } = usePlans()
  const navigate = useNavigate()

  const handleChoosePlan = (planId: number) => {
    const period = isQuarterly ? 'quarterly' : 'monthly'
    navigate(PATHS.checkout(planId.toString()) + `?period=${period}`)
  }

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 sm:py-24 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          {t('pricing.loading')}
        </div>
      </section>
    )
  }

  // Premium is the last plan — featured with decoy effect
  const featuredIndex = plans ? plans.length - 1 : 0

  return (
    <section id="pricing" className="py-20 sm:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight text-balance">
            {t('pricing.title')}
          </h2>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-card border border-border/50 rounded-lg p-1 flex">
              <button
                onClick={() => setIsQuarterly(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  !isQuarterly
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setIsQuarterly(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative ${
                  isQuarterly
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('pricing.quarterly')}
                {isQuarterly && (
                  <Badge className="absolute -top-2 -right-2 text-xs">
                    {t('pricing.discount')}
                  </Badge>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
            {plans?.map((plan, index) => {
              const isFeatured = index === featuredIndex
              const displayPrice = isQuarterly
                ? ((plan.price * 3 * 0.85) / 3).toFixed(2)
                : plan.price.toFixed(2)
              const quarterlyTotal = (plan.price * 3 * 0.85).toFixed(2)
              const quarterlySavings = (plan.price * 3 * 0.15).toFixed(2)

              return (
                <Card
                  key={plan.id}
                  className={`bg-card border-border/50 transition-all duration-300 animate-fade-in-up hover-lift min-w-[280px] max-w-[340px] flex-1 relative overflow-visible ${
                    isFeatured ? 'border-primary/50 glow-border' : 'hover:border-primary/30'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge>{t('pricing.popular')}</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {t('pricing.planName', { name: plan.name })}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">R$ {displayPrice}</span>
                      <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
                      {isQuarterly && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-sm text-muted-foreground">
                            R$ {quarterlyTotal} {t('pricing.perQuarter')}
                          </p>
                          <p className="text-sm text-primary">
                            {t('pricing.savePerQuarter', { amount: quarterlySavings })}
                          </p>
                        </div>
                      )}
                    </div>
                    {isFeatured && (
                      <p className="text-xs text-primary mt-2 font-medium">
                        {t('pricing.decoyComparison')}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isFeatured ? 'glow' : 'default'}
                      className="w-full py-3 text-lg font-medium"
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      {t('pricing.cta')}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
