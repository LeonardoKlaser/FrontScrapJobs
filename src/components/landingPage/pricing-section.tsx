'use client'

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

  const handleChoosePlan = (planId: number) => {
    navigate(PATHS.checkout(planId.toString()))
  }

  if (isLoading) {
    return <div>Carregando planos...</div>
  }

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Preço Simples e Transparente
          </h2>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-card border border-border rounded-lg p-1 flex">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !isAnnual
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                  isAnnual
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Anual
                {isAnnual && (
                  <Badge className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-8">
            {plans?.map((plan) => (
              <Card
                key={plan.id}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300"
              >
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Plano {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      R$ {isAnnual ? (plan.price * 0.8).toFixed(2) : plan.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">/{isAnnual ? 'mês' : 'mês'}</span>
                    {isAnnual && (
                      <p className="text-sm text-success mt-1">
                        Economize R$ {(plan.price * 0.2 * 12).toFixed(2)} por ano
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium"
                    onClick={() => handleChoosePlan(plan.id)}
                  >
                    Começar a Automatizar
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Teste gratuito de 7 dias • Cancele a qualquer momento
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
