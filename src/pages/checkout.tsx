import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanSummary } from '@/components/checkout/plan-summary'
import { PaymentForm } from '@/components/checkout/payment-form'
import { useParams, useSearchParams, Link } from 'react-router'
import { usePlans } from '@/hooks/usePlans'
import { PATHS } from '@/router/paths'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CheckoutPage() {
  const { t } = useTranslation('plans')
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
            <CardTitle>{t('checkout.loadError')}</CardTitle>
            <CardDescription>{t('checkout.loadErrorDescription')}</CardDescription>
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
            <CardTitle>{t('checkout.notFound')}</CardTitle>
            <CardDescription>{t('checkout.notFoundDescription')}</CardDescription>
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
        <Link
          to={PATHS.landing}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('paymentForm.backToHome')}
        </Link>

        <div className="animate-fade-in-up mb-10">
          <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
            {t('checkout.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">{t('checkout.description')}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr] lg:grid-cols-3">
          <div className="animate-fade-in-up md:col-span-1" style={{ animationDelay: '100ms' }}>
            <PlanSummary plan={plan} billingPeriod={billingPeriod} />
          </div>
          <div
            className="animate-fade-in-up md:col-span-1 lg:col-span-2"
            style={{ animationDelay: '200ms' }}
          >
            <PaymentForm plan={plan} billingPeriod={billingPeriod} />
          </div>
        </div>
      </div>
    </div>
  )
}
