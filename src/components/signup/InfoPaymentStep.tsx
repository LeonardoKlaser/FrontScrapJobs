import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  MailIcon,
  LockIcon,
  FileTextIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  Eye,
  EyeOff,
  QrCode,
  CreditCard
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { formatCPF } from '@/lib/format'
import { PATHS } from '@/router/paths'
import { signupService } from '@/services/signupService'
import { cn } from '@/lib/utils'
import { useAbacatePaySubscribeCard, useAbacatePayPixMonthly } from '@/hooks/useAbacatePay'
import { PixPaymentStep } from '@/components/checkout/pix-payment-step'
import type { PixPaymentResult } from '@/services/pixService'
import type { Plan } from '@/models/plan'
import { trackCheckout } from '@/lib/analytics'

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const infoStepSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  tax: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .pipe(z.string().length(11, 'CPF inválido'))
})

type InfoStepInput = z.infer<typeof infoStepSchema>

type PaymentMethodChoice = 'card' | 'pix'

interface InfoPaymentStepProps {
  sessionId: string
  plan: Plan
  onBack: () => void
}

export function InfoPaymentStep({ sessionId, plan, onBack }: InfoPaymentStepProps) {
  const { t } = useTranslation('auth')
  const { t: tPlans } = useTranslation('plans')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [pendingId, setPendingId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodChoice>('card')
  const [pixResult, setPixResult] = useState<PixPaymentResult | null>(null)

  const subscribeCardMutation = useAbacatePaySubscribeCard()
  const pixMonthlyMutation = useAbacatePayPixMonthly()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<InfoStepInput>({
    resolver: zodResolver(infoStepSchema),
    mode: 'onBlur'
  })

  const tax = watch('tax') ?? ''

  const onSubmit = async (data: InfoStepInput) => {
    setLoading(true)
    setError(null)
    try {
      const result = await signupService.complete({
        signup_session_id: sessionId,
        email: data.email.trim(),
        password: data.password,
        tax: data.tax
      })
      sessionStorage.setItem('pending_checkout_email', data.email.trim().toLowerCase())

      if (result.action !== 'payment_required' || !result.pending_id) {
        throw new Error('Resposta inválida ao preparar pagamento')
      }
      setPendingId(result.pending_id)
    } catch (err: unknown) {
      const resp = (
        err as {
          response?: { data?: { error?: string; message?: string } }
        }
      )?.response?.data
      if (resp?.error === 'email_ou_cpf_ja_cadastrado') {
        setError(t('signup.emailOrCpfExists', 'E-mail ou CPF já cadastrado.'))
      } else if (resp?.error === 'phone_already_registered') {
        toast.info(resp?.message || t('signup.phoneExists', 'Número já cadastrado. Faça login.'))
        navigate(`${PATHS.login}?from=${encodeURIComponent(PATHS.app.home)}`)
      } else if (resp?.error === 'phone_not_verified') {
        setError(t('signup.phoneNotVerified', 'Telefone não verificado. Volte e verifique.'))
      } else {
        setError(
          resp?.message || t('signup.completeError', 'Erro ao finalizar cadastro. Tente novamente.')
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (err: unknown, planId: number) => {
    const resp = (err as { response?: { data?: { error?: string; message?: string } } })?.response
      ?.data
    if (resp?.error === 'email_already_registered' || resp?.error === 'tax_already_registered') {
      toast.info(resp?.message || 'Conta já existe. Faça login.')
      navigate(`${PATHS.login}?from=${encodeURIComponent(`/checkout/${planId}`)}`)
      return
    }
    if (resp?.error === 'pix_auto_disabled') {
      toast.error('PIX automático ainda não está disponível.')
      return
    }
    toast.error(resp?.message || resp?.error || 'Erro ao processar pagamento')
  }

  const handlePayment = async () => {
    if (!pendingId || !plan) return

    if (paymentMethod === 'card') {
      try {
        const result = await subscribeCardMutation.mutateAsync({
          planId: plan.id,
          data: { pending_id: pendingId }
        })
        trackCheckout('checkout_abacatepay_redirect', {
          plan_id: plan.id,
          method: 'card'
        })
        if (!result.checkout_url) {
          throw new Error('Checkout de cartão não retornou URL')
        }
        window.location.href = result.checkout_url
      } catch (err) {
        handlePaymentError(err, plan.id)
      }
      return
    }

    // PIX mensal
    try {
      const result = await pixMonthlyMutation.mutateAsync({
        pending_id: pendingId,
        plan_id: plan.id
      })
      setPixResult({
        checkout_id: result.checkout_id,
        qr_code: result.qr_code,
        qr_code_url: result.qr_code_url,
        expires_at: result.expires_at
      })
      trackCheckout('checkout_pix_qr_generated', {
        plan_id: plan.id,
        months: 1
      })
    } catch (err) {
      handlePaymentError(err, plan.id)
    }
  }

  if (pixResult && plan) {
    const pendingEmail = sessionStorage.getItem('pending_checkout_email') || ''
    return (
      <PixPaymentStep
        pixResult={pixResult}
        planId={plan.id}
        userEmail={pendingEmail}
        onExpired={() => {
          pixMonthlyMutation.reset()
          setPixResult(null)
        }}
        redirectAfterConfirm={`${PATHS.paymentConfirmation}?plan=${encodeURIComponent(plan.name)}`}
      />
    )
  }

  if (pendingId && plan) {
    const isProcessing = subscribeCardMutation.isPending || pixMonthlyMutation.isPending
    const priceStr = formatCurrencyBRL(plan.price)

    return (
      <div className="flex w-full flex-col gap-5">
        <p className="text-sm font-medium text-foreground">
          {tPlans('checkout.chooseMethodLabel', 'Como você prefere pagar?')}
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            disabled={isProcessing}
            className={cn(
              'flex flex-col items-start gap-1 rounded-md border px-4 py-3 text-left transition-all',
              paymentMethod === 'card'
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-2 font-medium">
              <CreditCard className="h-4 w-4" />
              {tPlans('checkout.methodCardTitle', 'Assinar com cartão de crédito')}
            </div>
            <p className="text-xs text-muted-foreground">
              {tPlans('checkout.methodCardDesc', {
                price: priceStr,
                defaultValue: `R$ ${priceStr}/mês · 7 dias grátis · renovação automática · cancela quando quiser`
              })}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('pix')}
            disabled={isProcessing}
            className={cn(
              'flex flex-col items-start gap-1 rounded-md border px-4 py-3 text-left transition-all',
              paymentMethod === 'pix'
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-2 font-medium">
              <QrCode className="h-4 w-4" />
              {tPlans('checkout.methodPixTitle', 'Pagar com PIX')}
            </div>
            <p className="text-xs text-muted-foreground">
              {tPlans('checkout.methodPixDesc', {
                price: priceStr,
                defaultValue: `R$ ${priceStr}/mês · renovação manual · avisamos antes de vencer`
              })}
            </p>
          </button>
        </div>

        <Button
          type="button"
          variant="glow"
          size="lg"
          className="w-full font-semibold"
          disabled={isProcessing}
          onClick={handlePayment}
        >
          {isProcessing ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {paymentMethod === 'card' ? (
                <CreditCard className="mr-2 h-4 w-4" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              {paymentMethod === 'card'
                ? tPlans('checkout.goToCardCheckout', 'Ir para pagamento')
                : tPlans('checkout.generateMonthlyQR', 'Gerar QR Code PIX')}
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={() => setPendingId(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="mr-1 inline h-3 w-3" />
          {t('signup.back', 'Voltar')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-muted-foreground">
          {t('email', 'E-mail')}
        </Label>
        <div className="relative">
          <MailIcon
            className="pointer-events-none absolute left-3 top-1/2
              h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder', 'seu@email.com')}
            className="pl-10"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-muted-foreground">
          {t('password', 'Senha')}
        </Label>
        <div className="relative">
          <LockIcon
            className="pointer-events-none absolute left-3 top-1/2
              h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('signup.passwordPlaceholder', 'Mínimo 8 caracteres')}
            className="pl-10 pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2
              text-muted-foreground transition-colors
              hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tax" className="text-muted-foreground">
          {t('signup.cpf', 'CPF')}
        </Label>
        <div className="relative">
          <FileTextIcon
            className="pointer-events-none absolute left-3 top-1/2
              h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="tax"
            type="text"
            inputMode="numeric"
            placeholder={t('signup.cpfPlaceholder', '000.000.000-00')}
            className="pl-10 font-mono"
            {...register('tax')}
            value={tax}
            onChange={(e) => {
              setValue('tax', formatCPF(e.target.value), {
                shouldValidate: false
              })
            }}
            onBlur={() => trigger('tax')}
          />
        </div>
        {errors.tax && <p className="text-xs text-destructive">{errors.tax.message}</p>}
      </div>

      {error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2
            text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={loading}>
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          {t('signup.back', 'Voltar')}
        </Button>

        <Button
          type="submit"
          variant="glow"
          disabled={loading}
          size="lg"
          className="flex-1 font-semibold"
        >
          {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t('signup.goToPayment', 'Ir para pagamento')}
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
