import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanSummary } from '@/components/checkout/plan-summary'
import { PaymentForm } from '@/components/checkout/payment-form'
import { useParams, useSearchParams } from 'react-router'
import { usePlans } from '@/hooks/usePlans'
import { Spinner } from '@/components/ui/spinner'

export default function CheckoutPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { data: plans, isLoading, isError } = usePlans()

  const planId = parseInt(params.planId || '', 10)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-10" />
      </div>
    )
  }

  if (isError || !plans) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader>
            <CardTitle>Erro ao carregar</CardTitle>
            <CardDescription>
              Nao foi possivel buscar os planos. Tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const plan = plans.find((p) => p.id === planId)

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader>
            <CardTitle>Plano nao encontrado</CardTitle>
            <CardDescription>
              O plano solicitado nao existe. Por favor, selecione um plano valido.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const isBetaTester = plan.name === 'Beta Tester'
  const periodParam = searchParams.get('period')
  const billingPeriod: 'monthly' | 'annual' = isBetaTester
    ? 'monthly'
    : periodParam === 'annual'
      ? 'annual'
      : 'monthly'

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="animate-fade-in-up mb-10">
          <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
            Finalize sua Assinatura
          </h1>
          <p className="mt-2 text-muted-foreground">
            Escolha seu metodo de pagamento e comece a usar o ScrapJobs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="animate-fade-in-up lg:col-span-1" style={{ animationDelay: '100ms' }}>
            <PlanSummary plan={plan} billingPeriod={billingPeriod} />
          </div>
          <div className="animate-fade-in-up lg:col-span-2" style={{ animationDelay: '200ms' }}>
            <PaymentForm plan={plan} billingPeriod={billingPeriod} />
          </div>
        </div>
      </div>
    </div>
  )
}
