import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import type { Plan } from '@/models/plan'
import {
  createPayment,
  checkPaymentStatus,
  tokenizeCard,
  TokenizationError
} from '@/services/paymentService'
import type { CardData } from '@/services/paymentService'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { PATHS } from '@/router/paths'
import { CheckoutStepper } from './checkout-stepper'
import { PersonalDataStep } from './personal-data-step'
import type { PersonalFormData } from './personal-data-step'
import { CardPaymentStep } from './card-payment-step'
import type { AddressData, DocumentData } from './card-payment-step'
import { AddressStep } from './address-step'
import { trackCheckout, trackTrial } from '@/lib/analytics'
import { useSaveLead } from '@/hooks/useSaveLead'
import { useUser } from '@/hooks/useUser'

interface PaymentFormProps {
  plan: Plan
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function PaymentForm({ plan, isLoading, setIsLoading }: PaymentFormProps) {
  const { t } = useTranslation('plans')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  // user data eh undefined em fluxo anonimo (landing → /checkout); presente quando
  // user vem de /app/renew apos trial expirar. from_trial separa metricas de
  // conversao do trial vs checkout direto.
  const { data: currentUser, isLoading: userLoading } = useUser()
  const isAuthenticated = !!currentUser

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(isAuthenticated ? 2 : 1)
  const [cardError, setCardError] = useState('')
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'polling' | 'timeout'>('idle')
  const [formData, setFormData] = useState<PersonalFormData>(() => ({
    name: currentUser?.user_name ?? '',
    email: currentUser?.email ?? '',
    // Backend aceita password vazio em renewal (binding omitempty); CompleteRegistration
    // detecta user existente e renova sem tocar password. Anônimos preenchem na step 1.
    password: '',
    phone: currentUser?.cellphone ?? ''
  }))
  const [addressData, setAddressData] = useState<AddressData>({
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: ''
  })

  const { mutate: saveLead } = useSaveLead()
  // Dedup: evita inflar attempts no banco quando user clica Next/Back/Next.
  // Re-fire só se algum campo do payload mudou desde o último envio.
  const lastLeadKeyRef = useRef<string>('')

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)
    }
  }, [])

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
        phone: currentUser.cellphone ?? ''
      }
    })
    // setCurrentStep fora do updater de setFormData (updater deve ser puro;
    // setState dentro de setState quebra StrictMode double-invocation).
    if (didPrefill) {
      setCurrentStep((s) => (s === 1 ? 2 : s))
    }
  }, [currentUser])

  const startPolling = (email: string) => {
    setPollingStatus('polling')
    let consecutiveErrors = 0

    pollingRef.current = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(email)
        consecutiveErrors = 0

        if (result.status === 'confirmed') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)
          setIsLoading(false)
          trackCheckout('checkout_payment_confirmed', { plan_id: plan.id })
          const fromTrial = !!currentUser?.trial_ends_at && !currentUser?.payment_method
          trackTrial('payment_complete', { plan_id: plan.id, from_trial: fromTrial })
          navigate(`${PATHS.paymentConfirmation}?plan=${encodeURIComponent(plan.name)}`)
        }
        // not_found e processing: continua polling até o timeout de 2 min
        // (webhook pode estar atrasado ou Redis pode ter evicted a key temporariamente)
      } catch (err) {
        consecutiveErrors++
        console.error('payment status check failed', err)
        if (consecutiveErrors >= 3) {
          if (pollingRef.current) clearInterval(pollingRef.current)
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)
          setPollingStatus('timeout')
          setCardError(tCommon('status.error'))
          setIsLoading(false)
        }
      }
    }, 3000)

    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      setPollingStatus('timeout')
      setIsLoading(false)
    }, 120000)
  }

  const handleCardSubmit = async (cardData: CardData, docData: DocumentData) => {
    setIsLoading(true)
    setCardError('')

    try {
      const token = await tokenizeCard(cardData)

      const result = await createPayment(plan.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        tax: docData.cpfCnpj.replace(/\D/g, ''),
        // Telefone agora vem do step 1 (formData), não mais do step 2.
        cellphone: formData.phone.replace(/\D/g, ''),
        card_token: token.id,
        zip_code: addressData.zipCode.replace(/\D/g, ''),
        street: addressData.street,
        number: addressData.number,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state
      })

      if (result.status === 'processing') {
        startPolling(formData.email)
      } else {
        setCardError(tCommon('status.error'))
        setIsLoading(false)
      }
    } catch (err) {
      let message: string
      if (err instanceof TokenizationError) {
        message = err.message
      } else if (axios.isAxiosError(err) && err.response) {
        const errorCode = err.response.data?.error
        const backendMessage = err.response.data?.message
        switch (errorCode) {
          case 'email_already_registered':
          case 'tax_already_registered':
            message = backendMessage ?? 'Faça login para renovar sua assinatura'
            break
          case 'email_mismatch':
            message = backendMessage ?? 'O email não bate com a conta logada'
            break
          case 'session_expired':
            // Redirect to login preserving the from path
            navigate(`/login?from=${encodeURIComponent(`/checkout/${plan.id}`)}`)
            return
          default:
            message = backendMessage ?? errorCode ?? tCommon('status.error')
        }
      } else if (err instanceof Error) {
        message = err.message
      } else {
        message = tCommon('status.error')
      }
      setCardError(message)
      setIsLoading(false)
    }
  }

  if (pollingStatus === 'polling') {
    return (
      <Card className="w-full border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <Spinner className="h-10 w-10 text-primary" />
          <h3 className="text-lg font-semibold">{t('paymentForm.processingPayment')}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {t('paymentForm.processingDescription')}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (pollingStatus === 'timeout') {
    return (
      <Card className="w-full border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <AlertCircle className="h-10 w-10 text-yellow-500" />
          <h3 className="text-lg font-semibold">{t('paymentForm.processingPayment')}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {t('paymentForm.paymentTimeout')}
          </p>
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? PATHS.app.home : PATHS.landing)}
            className={'mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline'}
          >
            {t('paymentForm.timeoutGoHome')}
          </button>
        </CardContent>
      </Card>
    )
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
    setCurrentStep((s) => Math.max(1, s - 1) as 1 | 2 | 3)
  }

  return (
    <Card className="w-full border-border/50">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        {currentStep > 1 && !(isAuthenticated && currentStep === 2) && (
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
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

        <CheckoutStepper
          currentStep={currentStep}
          labels={[t('checkout.stepData'), t('checkout.stepAddress'), t('checkout.stepPayment')]}
        />

        {currentStep === 1 && (
          <PersonalDataStep
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
            planId={plan.id}
            isAuthenticated={isAuthenticated}
            onNext={() => {
              // Fire-and-forget — falha de save NAO pode bloquear o checkout.
              const leadKey = `${formData.name}|${formData.email}|${formData.phone}|${plan.id}`
              if (leadKey !== lastLeadKeyRef.current) {
                lastLeadKeyRef.current = leadKey
                saveLead(
                  {
                    name: formData.name,
                    email: formData.email,
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

        {currentStep === 2 && (
          <AddressStep
            addressData={addressData}
            setAddressData={setAddressData}
            isLoading={isLoading}
            onNext={() => {
              trackCheckout('checkout_step3_view')
              setCurrentStep(3)
            }}
          />
        )}

        {currentStep === 3 && (
          <CardPaymentStep
            isLoading={isLoading}
            error={cardError}
            userName={formData.name}
            userEmail={formData.email}
            userTax={currentUser?.tax ?? ''}
            isAuthenticated={isAuthenticated}
            planId={plan.id}
            onSubmit={handleCardSubmit}
          />
        )}
      </CardContent>
    </Card>
  )
}
