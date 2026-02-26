import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles } from 'lucide-react'
import type { Plan } from '@/models/plan'

interface PlanSummaryProps {
  plan: Plan
  billingPeriod: 'monthly' | 'annual'
}

export function PlanSummary({ plan, billingPeriod }: PlanSummaryProps) {
  const isAnnual = billingPeriod === 'annual'
  const totalPrice = isAnnual ? plan.price * 12 * 0.8 : plan.price
  const periodLabel = isAnnual ? 'Pagamento unico anual' : 'Pagamento unico mensal'

  return (
    <Card className="sticky top-8 border-primary/30 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl tracking-tight">{plan.name}</CardTitle>
        </div>
        <CardDescription>Resumo do seu plano</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price */}
        <div className="border-b border-border/50 pb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-muted-foreground">R$</span>
            <span className="text-gradient-primary text-4xl font-bold tracking-tight">
              {totalPrice.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{periodLabel}</p>
          {isAnnual && (
            <Badge className="mt-2">Economia de R$ {(plan.price * 12 * 0.2).toFixed(2)}</Badge>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">O que esta incluido:</h3>
          <ul className="space-y-2.5">
            {plan.features.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            Plano {plan.name}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
