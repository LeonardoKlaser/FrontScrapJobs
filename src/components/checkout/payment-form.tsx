import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, CreditCard, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Plan } from '@/models/plan'
import type { PixPaymentResult } from '@/services/pixService'
import axios from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { PATHS } from '@/router/paths'
import { CheckoutStepper } from './checkout-stepper'
import { PersonalDataStep } from './personal-data-step'
import type { PersonalFormData } from './personal-data-step'
import { PixPaymentStep } from './pix-payment-step'
import { trackCheckout } from '@/lib/analytics'
import { useSaveLead } from '@/hooks/useSaveLead'
import { useUser } from '@/hooks/useUser'
import { useAbacatePaySubscribeCard, useAbacatePayPixMonthly } from '@/hooks/useAbacatePay'

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface PaymentFormProps {
  plan: Plan
  pendingId?: string | null
}

export function PaymentForm({ plan, pendingId }: PaymentFormProps) {
  const { t } = useTranslation('plans')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  // user data eh undefined em fluxo anonimo (landing → /checkout); presente quando
  // user vem de /app/renew apos trial expirar. from_trial separa metricas de
  // conversao do trial vs checkout direto.
  const { data: currentUser, isLoading: userLoading } = useUser()
  const isAuthenticated = !!currentUser
  // Users antigos (pré-coleta de CPF) tem currentUser.tax undefined. Sem essa
  // flag eles pulariam pro step 2 sem nunca ver o campo de CPF, e o submit
  // caia no backend com "CPF inválido" sem UI de recuperação (ver finding
  // critico da migração AbacatePay).
  const hasTax = !!currentUser?.tax

  const [currentStep, setCurrentStep] = useState<1 | 2>(
    pendingId || (isAuthenticated && hasTax) ? 2 : 1
  )

  const pendingEmail = pendingId ? sessionStorage.getItem('pending_checkout_email') || '' : ''
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card')
  const [pixResult, setPixResult] = useState<PixPaymentResult | null>(null)
  const subscribeCardMutation = useAbacatePaySubscribeCard()
  const pixMonthlyMutation = useAbacatePayPixMonthly()
  const isPaymentPending = subscribeCardMutation.isPending || pixMonthlyMutation.isPending
  const [formData, setFormData] = useState<PersonalFormData>(() => ({
    name: currentUser?.user_name ?? '',
    email: currentUser?.email ?? '',
    // Backend aceita password vazio em renewal (binding omitempty); CompleteRegistration
    // detecta user existente e renova sem tocar password. Anônimos preenchem na step 1.
    password: '',
    phone: currentUser?.cellphone ?? '',
    tax: ''
  }))
  const { mutate: saveLead } = useSaveLead()
  // Dedup: evita inflar attempts no banco quando user clica Next/Back/Next.
  // Re-fire só se algum campo do payload mudou desde o último envio.
  const lastLeadKeyRef = useRef<string>('')

  useEffect(() => {
    if (!currentUser) return
    // Race: user comecou a digitar antes do currentUser resolver. Mantem
    // o que foi digitado e NAO auto-avanca (so avanca quando o pre-fill
    // realmente aconteceu). Guarda em todos os campos (email/name/phone) —
    // qualquer coisa nao-vazia indica interacao.
    let didPrefill = false
    setFormData((prev) => {
      if (prev.email || prev.name || prev.phone) return prev
      didPrefill = true
      return {
        name: currentUser.user_name,
        email: currentUser.email,
        password: '',
        phone: currentUser.cellphone ?? '',
        tax: currentUser.tax ?? ''
      }
    })
    // setCurrentStep fora do updater de setFormData (updater deve ser puro;
    // setState dentro de setState quebra StrictMode double-invocation).
    // So auto-avanca se o user ja tem tax cadastrado — grandfathered sem CPF
    // fica no step 1 pra preencher (backend exige tax valido em ambos os
    // paths AbacatePay, card e pix).
    if (didPrefill && currentUser.tax) {
      setCurrentStep((s) => (s === 1 ? 2 : s))
    }
  }, [currentUser])

  // Trata erros das mutations AbacatePay (subscribe-card e pix-monthly) —
  // ambas retornam o mesmo shape de erro {error, message}.
  const handlePaymentError = (err: unknown, method: 'card' | 'pix') => {
    const isAxiosErr = axios.isAxiosError(err)
    const errorCode = isAxiosErr ? err.response?.data?.error : undefined
    const errorMessage = isAxiosErr ? err.response?.data?.message : undefined
    const status = isAxiosErr ? (err.response?.status ?? 0) : 0
    trackCheckout(
      method === 'card' ? 'checkout_subscription_create_failed' : 'checkout_pix_create_failed',
      {
        plan_id: plan.id,
        error_code: errorCode ?? 'unknown',
        status
      }
    )
    if (errorCode === 'email_already_registered' || errorCode === 'tax_already_registered') {
      toast.info(errorMessage || t('paymentForm.userExistsRedirect'))
      navigate(`${PATHS.login}?from=${encodeURIComponent(`/checkout/${plan.id}`)}`)
      return
    }
    // Defensivo: pix_auto_disabled eh do endpoint subscribe-pix (flag-gated,
    // nao usado neste fluxo), mas o backend pode devolver em cenarios de
    // migracao/rollback — nao deveria acontecer no caminho card/pix-monthly.
    if (errorCode === 'pix_auto_disabled') {
      toast.error(errorMessage || 'PIX automático ainda não está disponível.')
      return
    }
    if (errorCode === 'active_card_subscription') {
      toast.info(errorMessage || 'Você já possui uma assinatura de cartão ativa.')
      return
    }
    toast.error(errorMessage || tCommon('status.error'))
  }

  // Dispara a mutation AbacatePay correta pro metodo escolhido na step 2
  // (cartao = checkout hospedado com redirect; pix = QR code inline).
  const handlePaymentSubmit = async () => {
    const normalizedEmail = pendingId ? pendingEmail : formData.email.trim().toLowerCase()

    if (paymentMethod === 'card') {
      try {
        const data = pendingId
          ? { pending_id: pendingId }
          : {
              name: formData.name,
              email: normalizedEmail,
              password: formData.password,
              tax: (formData.tax || '').replace(/\D/g, ''),
              cellphone: formData.phone.replace(/\D/g, '')
            }
        const result = await subscribeCardMutation.mutateAsync({
          planId: plan.id,
          data
        })
        if (result.plan_change_scheduled) {
          trackCheckout('checkout_plan_change_scheduled', { plan_id: plan.id })
          toast.success('Troca de plano agendada para o próximo ciclo de cobrança.')
          await queryClient.invalidateQueries({ queryKey: ['user'] })
          navigate(PATHS.app.account)
          return
        }
        if (!result.checkout_url) {
          throw new Error('Checkout não retornado pelo provedor de pagamento.')
        }
        trackCheckout('checkout_abacatepay_redirect', {
          plan_id: plan.id,
          method: 'card'
        })
        window.location.href = result.checkout_url
      } catch (err) {
        handlePaymentError(err, 'card')
      }
      return
    }

    try {
      const data = pendingId
        ? { pending_id: pendingId, plan_id: plan.id }
        : {
            name: formData.name,
            email: normalizedEmail,
            password: formData.password,
            tax: (formData.tax || '').replace(/\D/g, ''),
            cellphone: formData.phone.replace(/\D/g, ''),
            plan_id: plan.id
          }
      const result = await pixMonthlyMutation.mutateAsync(data)
      setPixResult({
        qr_code: result.qr_code,
        qr_code_url: result.qr_code_url,
        expires_at: result.expires_at
      })
      trackCheckout('checkout_pix_qr_generated', {
        plan_id: plan.id,
        months: 1
      })
    } catch (err) {
      handlePaymentError(err, 'pix')
    }
  }

  if (userLoading) {
    return (
      <Card className="w-full border-border/50">
        <CardContent className="flex items-center justify-center py-16">
          <Spinner className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    )
  }

  const handleBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1) as 1 | 2)
  }

  return (
    <Card className="w-full border-border/50">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        {!pixResult &&
          currentStep > 1 &&
          !(isAuthenticated && currentStep === 2) &&
          !(pendingId && currentStep === 2) && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isPaymentPending}
              aria-label={t('paymentForm.prevStep')}
              className={
                'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full' +
                ' text-muted-foreground transition-colors hover:bg-muted hover:text-foreground' +
                ' disabled:cursor-not-allowed disabled:opacity-50'
              }
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
        <div className="flex-1 space-y-1.5">
          <CardTitle className="text-2xl tracking-tight">{t('paymentForm.title')}</CardTitle>
          <CardDescription>{t('paymentForm.description')}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {isAuthenticated && currentUser && (
          <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
            <p className="text-sm text-foreground">
              {t('paymentForm.renewalBanner', { email: currentUser.email })}
            </p>
          </div>
        )}

        {!pixResult && !pendingId && (
          <CheckoutStepper
            currentStep={currentStep}
            labels={[t('checkout.stepData'), t('checkout.stepPayment')]}
          />
        )}

        {pixResult && (
          <PixPaymentStep
            pixResult={pixResult}
            planId={plan.id}
            // O backend normaliza a chave de confirmação por e-mail.
            userEmail={pendingId ? pendingEmail : formData.email.trim().toLowerCase()}
            onExpired={() => {
              pixMonthlyMutation.reset()
              setPixResult(null)
            }}
            redirectAfterConfirm={
              isAuthenticated
                ? PATHS.app.home
                : `${PATHS.paymentConfirmation}?plan=${encodeURIComponent(plan.name)}`
            }
          />
        )}

        {!pixResult && currentStep === 1 && (
          <PersonalDataStep
            formData={formData}
            setFormData={setFormData}
            isLoading={isPaymentPending}
            planId={plan.id}
            isAuthenticated={isAuthenticated}
            hasTaxOnFile={hasTax}
            onNext={() => {
              // Fire-and-forget — falha de save NAO pode bloquear o checkout.
              // Email normalizado (lower+trim) pra simetria com o payload de
              // pagamento — dedup do leads store fica consistente entre fluxos.
              const normalizedEmail = formData.email.trim().toLowerCase()
              const leadKey = `${formData.name}|${normalizedEmail}|${formData.phone}|${plan.id}`
              if (leadKey !== lastLeadKeyRef.current) {
                lastLeadKeyRef.current = leadKey
                saveLead(
                  {
                    name: formData.name,
                    email: normalizedEmail,
                    phone: formData.phone,
                    plan_id: plan.id
                  },
                  {
                    onError: (err) => {
                      // Fire-and-forget: NÃO bloqueia o avanço, mas reporta a falha
                      // pra telemetria — sem isso, falha de save fica invisível em prod.
                      console.error('saveLead failed', err)
                      trackCheckout('checkout_lead_save_failed', {
                        message: err instanceof Error ? err.message : 'unknown'
                      })
                    }
                  }
                )
              }
              trackCheckout('checkout_step2_view')
              setCurrentStep(2)
            }}
          />
        )}

        {!pixResult && currentStep === 2 && (
          <div className="flex w-full flex-col gap-5">
            <p className="text-sm font-medium text-foreground">{t('checkout.chooseMethodLabel')}</p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                disabled={subscribeCardMutation.isPending || pixMonthlyMutation.isPending}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-md border px-4 py-3 text-left transition-all',
                  paymentMethod === 'card'
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center gap-2 font-medium">
                  <CreditCard className="h-4 w-4" />
                  {t('checkout.methodCardTitle')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('checkout.methodCardDesc', {
                    price: formatCurrencyBRL(plan.price)
                  })}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                disabled={subscribeCardMutation.isPending || pixMonthlyMutation.isPending}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-md border px-4 py-3 text-left transition-all',
                  paymentMethod === 'pix'
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center gap-2 font-medium">
                  <QrCode className="h-4 w-4" />
                  {t('checkout.methodPixTitle')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('checkout.methodPixDesc', {
                    price: formatCurrencyBRL(plan.price)
                  })}
                </p>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePaymentSubmit}
              disabled={subscribeCardMutation.isPending || pixMonthlyMutation.isPending}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg border',
                'border-emerald-500 bg-emerald-500/5 p-4 text-sm font-medium',
                'transition-all hover:bg-emerald-500/10',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {subscribeCardMutation.isPending || pixMonthlyMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  {paymentMethod === 'card' ? (
                    <CreditCard className="h-4 w-4" />
                  ) : (
                    <QrCode className="h-4 w-4" />
                  )}
                  {paymentMethod === 'card'
                    ? t('checkout.goToCardCheckout')
                    : t('checkout.generateMonthlyQR')}
                </>
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
