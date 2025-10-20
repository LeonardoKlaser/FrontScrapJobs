// src/pages/checkout.tsx

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanSummary } from "@/components/checkout/plan-summary"
import { PaymentForm } from "@/components/checkout/payment-form"
import { useParams } from "react-router"
import { usePlans } from "@/hooks/usePlans"
import { Spinner } from "@/components/ui/spinner" // Importe um componente de loading

export default function CheckoutPage() {
  const params = useParams()
  const { data: plans, isLoading, isError } = usePlans()

  const planId = parseInt(params.planId || "", 10)


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner fontSize={10} />
      </div>
    )
  }

  // 2. Lida com erro na busca dos planos
  if (isError || !plans) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erro ao carregar</CardTitle>
            <CardDescription>Não foi possível buscar os planos. Tente novamente mais tarde.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const plan = plans.find(p => p.id === planId);

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
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Finalize sua Assinatura</h1>
          <p className="text-muted-foreground">Escolha seu método de pagamento e comece a usar o ScrapJobs</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <PlanSummary plan={plan} />
          </div>
          <div className="lg:col-span-2">
            <PaymentForm plan={plan} />
          </div>
        </div>
      </div>
    </div>
  )
}