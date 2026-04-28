import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CreditCard,
  QrCode,
  Zap
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { usePlans } from '@/hooks/usePlans'
import { useUser } from '@/hooks/useUser'
import { PATHS } from '@/router/paths'
import { LoadingSection } from '@/components/common/loading-section'
import { PixPaymentStep } from '@/components/checkout/pix-payment-step'
import { createPixPayment } from '@/services/pixService'
import type { PixPaymentResult } from '@/services/pixService'
import type { Plan } from '@/models/plan'
import axios from 'axios'

type Period = 'monthly' | 'quarterly'
type PaymentMethod = 'pix' | 'card'

// Fixed quarterly prices per plan name (backend calculates actual charge amounts).
// Keys must match the plan names returned by the API (case-insensitive lookup).
const QUARTERLY_PRICES: Record<string, number> = {
  basic: 37.90,
  pro: 48.90,
  premium: 57.90
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function RenewSubscription() {
  const { t, i18n } = useTranslation('plans')
  const navigate = useNavigate()
  const { data: plans, isLoading: plansLoading, refetch, isFetching } = usePlans()
  const { data: user } = useUser()

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [period, setPeriod] = useState<Period>('monthly')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [pixResult, setPixResult] = useState<PixPaymentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [name, setName] = useState(user?.user_name ?? '')
  const [cpf, setCpf] = useState(user?.tax ? formatCpf(user.tax) : '')
  const [phone, setPhone] = useState(user?.cellphone ?? '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const sortedPlans = useMemo(() => {
    if (!plans) return []
    return [...plans].filter((p) => !p.is_trial).sort((a, b) => a.price - b.price)
  }, [plans])

  const midIndex = Math.floor(sortedPlans.length / 2)

  // Auto-select middle (popular) plan if nothing selected yet
  const effectivePlanId =
    selectedPlanId ?? (sortedPlans.length > 0 ? sortedPlans[midIndex]?.id : null)
  const selectedPlan = sortedPlans.find((p) => p.id === effectivePlanId) ?? null

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'BRL'
    }).format(value)

  const getDisplayPrice = (plan: Plan): number => {
    if (period === 'quarterly') {
      const key = plan.name.toLowerCase()
      return QUARTERLY_PRICES[key] ?? plan.price * 3
    }
    return plan.price
  }

  const getMonthlyEquivalent = (plan: Plan): string => {
    const key = plan.name.toLowerCase()
    const qPrice = QUARTERLY_PRICES[key]
    if (!qPrice) return ''
    return (qPrice / 3).toFixed(2).replace('.', ',')
  }

  const getDiscountPercent = (plan: Plan): number => {
    const key = plan.name.toLowerCase()
    const qPrice = QUARTERLY_PRICES[key]
    if (!qPrice || plan.price === 0) return 0
    const monthlyTotal = plan.price * 3
    return Math.round(((monthlyTotal - qPrice) / monthlyTotal) * 100)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = t('renew.fields.required')
    const cpfDigits = cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) errors.cpf = t('renew.fields.required')
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) errors.phone = t('renew.fields.required')
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePixSubmit = async () => {
    if (!selectedPlan || !validateForm()) return

    setLoading(true)
    setError('')

    try {
      const result = await createPixPayment({
        name: name.trim(),
        email: user?.email ?? '',
        tax: cpf.replace(/\D/g, ''),
        cellphone: phone.replace(/\D/g, ''),
        plan_id: selectedPlan.id,
        months: period === 'quarterly' ? 3 : 1
      })
      setPixResult(result)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError(t('renew.pixError'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCardNavigate = () => {
    if (!selectedPlan) return
    navigate(PATHS.checkout(String(selectedPlan.id)))
  }

  if (plansLoading) {
    return <LoadingSection variant="full" label={t('renew.loading')} />
  }

  // If pixResult is set, show the QR code step
  if (pixResult && selectedPlan) {
    return (
      <div className="container mx-auto max-w-lg py-10 px-4">
        <PixPaymentStep
          pixResult={pixResult}
          planId={selectedPlan.id}
          userEmail={user?.email ?? ''}
          onExpired={() => setPixResult(null)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      {/* Header warning */}
      <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 mb-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{t('renew.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('renew.description')}</p>
        </div>
      </div>

      {sortedPlans.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground">{t('renew.emptyTitle')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('renew.emptyDescription')}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {t('renew.emptyRetry')}
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Period toggle */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={
                  'rounded-md px-4 py-2 text-sm font-medium transition-all' +
                  (period === 'monthly'
                    ? ' bg-card text-foreground shadow-sm'
                    : ' text-muted-foreground hover:text-foreground')
                }
              >
                {t('renew.period.monthly')}
              </button>
              <button
                type="button"
                onClick={() => setPeriod('quarterly')}
                className={
                  'rounded-md px-4 py-2 text-sm font-medium transition-all flex items-center gap-2' +
                  (period === 'quarterly'
                    ? ' bg-card text-foreground shadow-sm'
                    : ' text-muted-foreground hover:text-foreground')
                }
              >
                {t('renew.period.quarterly')}
                {selectedPlan && getDiscountPercent(selectedPlan) > 0 && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500">
                    {t('renew.period.discount', {
                      percent: getDiscountPercent(selectedPlan)
                    })}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 2. Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedPlans.map((plan, index) => {
              const isPopular = index === midIndex
              const isSelected = plan.id === effectivePlanId
              const displayPrice = getDisplayPrice(plan)
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={
                    'relative flex flex-col rounded-2xl bg-card p-6 text-left transition-all' +
                    ' duration-150 hover-lift cursor-pointer' +
                    (isSelected
                      ? ' border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                      : ' border border-border hover:border-border/80')
                  }
                >
                  {isPopular && (
                    <span
                      className={
                        'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500' +
                        ' px-3 py-1 text-xs font-bold text-white'
                      }
                    >
                      {t('renew.popular')}
                    </span>
                  )}

                  <div className="text-center pb-4">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline justify-center gap-1">
                      <span className="font-display text-3xl font-bold leading-none text-foreground">
                        {formatCurrency(displayPrice)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {period === 'quarterly' ? '/tri' : t('renew.perMonth')}
                      </span>
                    </div>
                    {period === 'quarterly' && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('renew.perMonthAbbrev', { price: getMonthlyEquivalent(plan) })}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2 flex-1">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">
                        {t('renew.sites', { count: plan.max_sites })}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">
                        {plan.max_ai_analyses === 0
                          ? t('renew.unlimitedAnalyses')
                          : t('renew.analyses', { count: plan.max_ai_analyses })}
                      </span>
                    </li>
                  </ul>

                  {/* Selection indicator */}
                  <div className="mt-4 flex items-center justify-center">
                    <div
                      className={
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors' +
                        (isSelected
                          ? ' border-emerald-500 bg-emerald-500'
                          : ' border-muted-foreground/30')
                      }
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 3. Payment method toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {t('renew.paymentMethod.title')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={
                  'flex flex-col items-center gap-2 rounded-xl p-4 transition-all border' +
                  (paymentMethod === 'pix'
                    ? ' border-emerald-500 bg-emerald-500/5 shadow-sm'
                    : ' border-border bg-card hover:border-border/80')
                }
              >
                <QrCode
                  className={
                    'h-6 w-6' +
                    (paymentMethod === 'pix'
                      ? ' text-emerald-500'
                      : ' text-muted-foreground')
                  }
                />
                <span className="text-sm font-semibold text-foreground">
                  {t('renew.paymentMethod.pix')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('renew.paymentMethod.pixDescription')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={
                  'flex flex-col items-center gap-2 rounded-xl p-4 transition-all border' +
                  (paymentMethod === 'card'
                    ? ' border-emerald-500 bg-emerald-500/5 shadow-sm'
                    : ' border-border bg-card hover:border-border/80')
                }
              >
                <CreditCard
                  className={
                    'h-6 w-6' +
                    (paymentMethod === 'card'
                      ? ' text-emerald-500'
                      : ' text-muted-foreground')
                  }
                />
                <span className="text-sm font-semibold text-foreground">
                  {t('renew.paymentMethod.card')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('renew.paymentMethod.cardDescription')}
                </span>
              </button>
            </div>
          </div>

          {/* 4. Conditional form / action */}
          {paymentMethod === 'pix' ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="pix-name">{t('renew.fields.name')}</Label>
                <Input
                  id="pix-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name)
                      setFieldErrors((p) => ({ ...p, name: '' }))
                  }}
                  disabled={loading}
                  className={fieldErrors.name ? 'border-destructive' : ''}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-destructive">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix-cpf">{t('renew.fields.cpf')}</Label>
                <Input
                  id="pix-cpf"
                  inputMode="numeric"
                  placeholder={t('renew.fields.cpfPlaceholder')}
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatCpf(e.target.value))
                    if (fieldErrors.cpf)
                      setFieldErrors((p) => ({ ...p, cpf: '' }))
                  }}
                  disabled={loading}
                  className={
                    'font-mono' + (fieldErrors.cpf ? ' border-destructive' : '')
                  }
                />
                {fieldErrors.cpf && (
                  <p className="text-xs text-destructive">{fieldErrors.cpf}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix-phone">{t('renew.fields.phone')}</Label>
                <Input
                  id="pix-phone"
                  inputMode="tel"
                  placeholder={t('renew.fields.phonePlaceholder')}
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatPhone(e.target.value))
                    if (fieldErrors.phone)
                      setFieldErrors((p) => ({ ...p, phone: '' }))
                  }}
                  disabled={loading}
                  className={fieldErrors.phone ? 'border-destructive' : ''}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>

              <Button
                variant="glow"
                size="lg"
                className="w-full h-auto gap-2 py-4 text-base font-semibold"
                disabled={loading || !selectedPlan}
                onClick={handlePixSubmit}
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    {t('renew.generating')}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    {t('renew.pixCta')}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <Button
                variant="glow"
                size="lg"
                className="w-full h-auto gap-2 py-4 text-base font-semibold"
                disabled={!selectedPlan}
                onClick={handleCardNavigate}
              >
                <CreditCard className="h-4 w-4" />
                {t('renew.cardCta')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
