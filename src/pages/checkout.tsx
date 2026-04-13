import { useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanSummary } from '@/components/checkout/plan-summary'
import { PaymentForm } from '@/components/checkout/payment-form'
import { useParams, Link } from 'react-router'
import { usePlans } from '@/hooks/usePlans'
import { PATHS } from '@/router/paths'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/common/page-header'

export default function CheckoutPage() {
  const { t } = useTranslation('plans')
  const params = useParams()
  const { data: plans, isLoading: plansLoading, isError } = usePlans()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const planId = parseInt(params.planId || '', 10)

  if (plansLoading) {
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

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Link
          to={PATHS.landing}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('paymentForm.backToHome')}
        </Link>

        <PageHeader title={t('checkout.title')} description={t('checkout.description')} className="mb-6" />

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="animate-fade-in-up lg:col-span-1" style={{ animationDelay: '100ms' }}>
            <PlanSummary plan={plan} />
          </div>
          <div className="animate-fade-in-up lg:col-span-2" style={{ animationDelay: '200ms' }}>
            <PaymentForm plan={plan} isLoading={isSubmitting} setIsLoading={setIsSubmitting} />
          </div>
        </div>
      </div>
    </div>
  )
}
