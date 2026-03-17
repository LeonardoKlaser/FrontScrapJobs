import { useState, useCallback } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanSummary } from '@/components/checkout/plan-summary'
import { PaymentForm } from '@/components/checkout/payment-form'
import { PixQRCodeStep } from '@/components/checkout/pix-qrcode-step'
import { useParams, Link } from 'react-router'
import { usePlans } from '@/hooks/usePlans'
import { PATHS } from '@/router/paths'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PixQRCodeData } from '@/services/paymentService'

function StepIndicator({ step }: { step: 1 | 2 }) {
  const { t } = useTranslation('plans')

  return (
    <div className="mb-8 flex items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
            step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          {step > 1 ? <Check className="h-4 w-4" /> : '1'}
        </div>
        <span
          className={`text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          {t('checkout.stepData')}
        </span>
      </div>

      <div className="h-px w-12 bg-border" />

      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
            step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          2
        </div>
        <span
          className={`text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          {t('checkout.stepPayment')}
        </span>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { t } = useTranslation('plans')
  const params = useParams()
  const { data: plans, isLoading: plansLoading, isError } = usePlans()
  const [step, setStep] = useState<1 | 2>(1)
  const [pixData, setPixData] = useState<PixQRCodeData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const planId = parseInt(params.planId || '', 10)

  const handlePixCreated = useCallback((data: PixQRCodeData) => {
    setPixData(data)
    setStep(2)
    setIsSubmitting(false)
  }, [])

  const handleGenerateNew = useCallback(() => {
    setPixData(null)
    setStep(1)
  }, [])

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

        <div className="animate-fade-in-up mb-6">
          <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
            {t('checkout.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">{t('checkout.description')}</p>
        </div>

        <StepIndicator step={step} />

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="animate-fade-in-up lg:col-span-1" style={{ animationDelay: '100ms' }}>
            <PlanSummary plan={plan} />
          </div>
          <div className="animate-fade-in-up lg:col-span-2" style={{ animationDelay: '200ms' }}>
            {step === 1 && (
              <PaymentForm
                plan={plan}
                onPixCreated={handlePixCreated}
                isLoading={isSubmitting}
                setIsLoading={setIsSubmitting}
              />
            )}
            {step === 2 && pixData && (
              <PixQRCodeStep pixData={pixData} onGenerateNew={handleGenerateNew} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
