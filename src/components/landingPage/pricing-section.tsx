import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import { useNavigate } from 'react-router'
import { PATHS } from '@/router/paths'

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  const { data: plans, isLoading } = usePlans()
  const navigate = useNavigate()

  const handleChoosePlan = (planId: number, planName: string) => {
    const period = planName === 'Beta Tester' ? 'monthly' : isAnnual ? 'annual' : 'monthly'
    navigate(PATHS.checkout(planId.toString()) + `?period=${period}`)
  }

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 sm:py-24 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          Carregando planos...
        </div>
      </section>
    )
  }

  const featuredIndex = plans && plans.length > 1 ? 1 : 0

  return (
    <section id="pricing" className="py-20 sm:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight text-balance">
            Preço Simples e Transparente
          </h2>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-card border border-border/50 rounded-lg p-1 flex">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  !isAnnual
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 relative ${
                  isAnnual
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Anual
                {isAnnual && <Badge className="absolute -top-2 -right-2 text-xs">-20%</Badge>}
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-8 flex-wrap">
            {plans?.map((plan, index) => {
              const isBetaTester = plan.name === 'Beta Tester'
              const isFeatured = index === featuredIndex
              const showAnnual = isAnnual && !isBetaTester
              const displayPrice = showAnnual
                ? (plan.price * 0.8).toFixed(2)
                : plan.price.toFixed(2)

              return (
                <Card
                  key={plan.id}
                  className={`bg-card border-border/50 transition-all duration-300 animate-fade-in-up min-w-[280px] max-w-[340px] flex-1 relative ${
                    isFeatured ? 'border-primary/50 glow-border' : 'hover:border-primary/30'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge>Popular</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-foreground">
                      Plano {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">R$ {displayPrice}</span>
                      <span className="text-muted-foreground">/mês</span>
                      {showAnnual && (
                        <p className="text-sm text-primary mt-1">
                          Economize R$ {(plan.price * 0.2 * 12).toFixed(2)} por ano
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features List */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      variant={isFeatured ? 'glow' : 'default'}
                      className="w-full py-3 text-lg font-medium"
                      onClick={() => handleChoosePlan(plan.id, plan.name)}
                    >
                      Começar a Automatizar
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
