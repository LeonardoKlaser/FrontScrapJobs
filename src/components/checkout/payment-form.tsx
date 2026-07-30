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
import { getLeadCheckout, completeLeadCheckout } from '@/services/leadCheckoutService'
import type { LeadCheckoutInfo } from '@/services/leadCheckoutService'

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface PaymentFormProps {
  plan: Plan
  pendingId?: string | null
  // Presente quando o lead abre o checkout mágico via link do WhatsApp
  // (/checkout/:planId?lead_token=X) — troca o pré-preenchimento e o submit
  // do passo 1 pelo fluxo de completeLeadCheckout (ver useEffect abaixo).
  leadToken?: string | null
}

export function PaymentForm({ plan, pendingId, leadToken }: PaymentFormProps) {
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

  // Modo lead (checkout mágico via WhatsApp): leadPendingId só é setado
  // depois que completeLeadCheckout cria a PendingRegistration do lead — até
  // lá o fluxo se comporta como anônimo normal (currentStep 1). pendingId
  // (query string) resume um checkout anônimo já criado (ex.: volta do
  // redirect do PIX); effectivePendingId unifica os dois caminhos pro resto
  // do componente, que nunca deve olhar pendingId cru de novo — se olhar, o
  // passo 2 no modo lead cai no caminho anônimo e cria uma SEGUNDA
  // PendingRegistration em vez de usar a do lead.
  const [leadPendingId, setLeadPendingId] = useState<string | null>(null)
  const [leadInfo, setLeadInfo] = useState<LeadCheckoutInfo | null>(null)
  const [isCompletingLead, setIsCompletingLead] = useState(false)
  const effectivePendingId = pendingId ?? leadPendingId

  const [currentStep, setCurrentStep] = useState<1 | 2>(
    effectivePendingId || (isAuthenticated && hasTax) ? 2 : 1
  )

  const pendingEmail = effectivePendingId
    ? sessionStorage.getItem('pending_checkout_email') || ''
    : ''
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

  // Checkout mágico do lead: valida o token e pré-preenche nome + telefone
  // (mascarado, travado — ver lockedFields abaixo). Se o link expirou/é
  // inválido (404), não trava a página: toast e o formulário segue como
  // fluxo anônimo normal, com campos vazios e editáveis.
  //
  // Nunca roda pra usuário já autenticado: cliente existente (cookie válido)
  // que conversou com o funil e clicou no link mágico já auto-avançou pro
  // passo 2 via o efeito de currentUser acima — completeLeadCheckout nunca
  // roda nesse caso, então prefill de phone/name aqui vazaria o
  // phone_masked pro payload de pagamento anônimo (celular corrompido,
  // '+55 (51) 9****-0000' → 9 dígitos) sem nenhuma UI que denuncie, já que o
  // PersonalDataStep nem chega a renderizar. Guard também contra pisar em
  // cima do que o usuário já digitou enquanto o GET estava em voo — mesmo
  // guard do efeito irmão de currentUser acima.
  useEffect(() => {
    if (!leadToken || isAuthenticated) return
    let cancelled = false
    getLeadCheckout(leadToken)
      .then((info) => {
        if (cancelled) return
        setLeadInfo(info)
        setFormData((prev) => {
          if (prev.email || prev.name || prev.phone) return prev
          return { ...prev, name: info.name, phone: info.phone_masked }
        })
      })
      .catch((err) => {
        if (cancelled) return
        console.error('getLeadCheckout failed', err)
        toast.error(
          t('checkout.leadLinkExpired', 'Link expirado — preencha seus dados normalmente')
        )
      })
    return () => {
      cancelled = true
    }
    // t fora das deps de proposito: troca de identidade em
    // languageChanged/loaded, e incluir aqui re-dispararia o GET e
    // re-sobrescreveria nome/telefone por cima do que o usuário já editou
    // (inclusive se ele já estiver no passo 2).
  }, [leadToken, isAuthenticated])

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
    const normalizedEmail = effectivePendingId ? pendingEmail : formData.email.trim().toLowerCase()

    if (paymentMethod === 'card') {
      try {
        const data = effectivePendingId
          ? { pending_id: effectivePendingId }
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
      const data = effectivePendingId
        ? { pending_id: effectivePendingId, plan_id: plan.id }
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
      handlePaymentError(err, 'pix')
    }
  }

  // Submit do passo 1 (PersonalDataStep.onNext). Modo lead: completa a
  // PendingRegistration já criada pelo bot (telefone verificado via
  // WhatsApp) via completeLeadCheckout — NÃO chama saveLead (o lead já
  // existe, não é um novo lead a salvar). Anônimo/renovação: fluxo
  // pré-existente de saveLead fire-and-forget.
  const handlePersonalDataNext = () => {
    if (leadToken && leadInfo) {
      const normalizedEmail = formData.email.trim().toLowerCase()
      setIsCompletingLead(true)
      completeLeadCheckout(leadToken, {
        name: formData.name,
        email: normalizedEmail,
        password: formData.password,
        tax: formData.tax ?? ''
      })
        .then((result) => {
          sessionStorage.setItem('pending_checkout_email', normalizedEmail)
          setLeadPendingId(result.pending_id)
          trackCheckout('checkout_step2_view')
          setCurrentStep(2)
        })
        .catch((err) => {
          const isAxiosErr = axios.isAxiosError(err)
          const status = isAxiosErr ? err.response?.status : undefined
          if (status === 409) {
            // Backend distingue email/CPF duplicado (sem message, só error)
            // de telefone já cadastrado (com message pronta pro usuário —
            // "Numero ja cadastrado. Faca login."). Mostra a mensagem do
            // backend quando vier; só cai no default genérico se não vier.
            const backendMessage = isAxiosErr ? err.response?.data?.message : undefined
            toast.info(
              backendMessage ||
                t(
                  'checkout.leadDuplicateAccount',
                  'E-mail ou CPF já cadastrado. Faça login para continuar.'
                )
            )
            navigate(`${PATHS.login}?from=${encodeURIComponent(`/checkout/${plan.id}`)}`)
            return
          }
          if (status === 404) {
            // Token expirou entre o GET e o POST (janela rara, mas real).
            // Espelha o tratamento do GET: destrava o telefone e devolve o
            // usuário pro fluxo anônimo normal — sem isso ele fica preso em
            // modo lead repetindo o mesmo 404 a cada retry.
            setLeadInfo(null)
            toast.error(
              t('checkout.leadLinkExpired', 'Link expirado — preencha seus dados normalmente')
            )
            return
          }
          console.error('completeLeadCheckout failed', err)
          toast.error(tCommon('status.error'))
        })
        .finally(() => setIsCompletingLead(false))
      return
    }

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
          !(effectivePendingId && currentStep === 2) && (
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

        {!pixResult && !effectivePendingId && (
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
            userEmail={effectivePendingId ? pendingEmail : formData.email.trim().toLowerCase()}
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
            isLoading={isPaymentPending || isCompletingLead}
            planId={plan.id}
            isAuthenticated={isAuthenticated}
            hasTaxOnFile={hasTax}
            lockedFields={leadInfo ? ['phone'] : undefined}
            lockedHint={t('checkout.verifiedViaWhatsApp', 'Verificado via WhatsApp ✓')}
            onNext={handlePersonalDataNext}
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
