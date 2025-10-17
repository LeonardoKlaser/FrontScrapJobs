import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanSummary } from "@/components/checkout/plan-summary"
import { PaymentForm } from "@/components/checkout/payment-form"
import { useParams } from "react-router"

const PLANS = {
  starter: {
    id: "starter",
    name: "Plano Starter",
    price: 29.9,
    currency: "BRL",
    benefits: ["Até 5 sites", "50 análises de IA/mês", "Suporte por email", "Relatórios básicos"],
  },
  professional: {
    id: "professional",
    name: "Plano Professional",
    price: 79.9,
    currency: "BRL",
    benefits: ["Até 15 sites", "100 análises de IA/mês", "Suporte prioritário", "Relatórios avançados", "API access"],
  },
  enterprise: {
    id: "enterprise",
    name: "Plano Enterprise",
    price: 199.9,
    currency: "BRL",
    benefits: [
      "Até 50 sites",
      "Análises ilimitadas",
      "Suporte 24/7",
      "Relatórios customizados",
      "API access",
      "Gerenciador dedicado",
    ],
  },
}

export default function CheckoutPage() {
  const params = useParams()
  const planId = params.planId as string
  const plan = PLANS[planId as keyof typeof PLANS]

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Plano não encontrado</CardTitle>
            <CardDescription>O plano solicitado não existe. Por favor, selecione um plano válido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Finalize sua Assinatura</h1>
          <p className="text-muted-foreground">Escolha seu método de pagamento e comece a usar o ScrapJobs</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Plan Summary */}
          <div className="lg:col-span-1">
            <PlanSummary plan={plan} />
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-2">
            <PaymentForm plan={plan} />
          </div>
        </div>
      </div>
    </div>
  )
}
