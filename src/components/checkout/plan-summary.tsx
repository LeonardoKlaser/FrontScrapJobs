import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import type { Plan } from "@/models/plan"


interface PlanSummaryProps {
  plan: Plan
}

export function PlanSummary({ plan }: PlanSummaryProps) {
  return (
    <Card className="sticky top-8 border-blue-500/20 bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>Resumo do seu plano</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price */}
        <div className="border-b border-border pb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{plan.price.toFixed(2)}</span>
            <span className="text-muted-foreground">{plan.price}/mês</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Renovação automática. Cancele a qualquer momento.</p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">O que está incluído:</h3>
          <ul className="space-y-2">
            {plan.features.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        
        <div className="pt-4">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            Plano {plan.name}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
