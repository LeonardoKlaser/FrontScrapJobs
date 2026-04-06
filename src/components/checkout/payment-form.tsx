import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle } from 'lucide-react'
import type { Plan } from '@/models/plan'
import { createPayment, checkPaymentStatus, tokenizeCard, TokenizationError } from '@/services/paymentService'
import type { CardData } from '@/services/paymentService'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { PATHS } from '@/router/paths'
import { CheckoutStepper } from './checkout-stepper'
import { PersonalDataStep } from './personal-data-step'
import type { PersonalFormData } from './personal-data-step'
import { CardPaymentStep } from './card-payment-step'
import type { AddressData } from './card-payment-step'

interface PaymentFormProps {
  plan: Plan
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function PaymentForm({ plan, isLoading, setIsLoading }: PaymentFormProps) {
  const { t } = useTranslation('plans')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [cardError, setCardError] = useState('')
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'polling' | 'timeout'>('idle')
  const [formData, setFormData] = useState<PersonalFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpfCnpj: '',
    phone: '',
  })

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)
    }
  }, [])

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
          navigate(`${PATHS.paymentConfirmation}?plan=${encodeURIComponent(plan.name)}`)
        }
        // not_found e processing: continua polling até o timeout de 2 min
        // (webhook pode estar atrasado ou Redis pode ter evicted a key temporariamente)
      } catch {
        consecutiveErrors++
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

  const handleCardSubmit = async (cardData: CardData, addressData: AddressData) => {
    setIsLoading(true)
    setCardError('')

    try {
      const token = await tokenizeCard(cardData)

      const result = await createPayment(plan.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        tax: formData.cpfCnpj.replace(/\D/g, ''),
        cellphone: formData.phone.replace(/\D/g, ''),
        card_token: token.id,
        zip_code: addressData.zipCode,
        street: addressData.street,
        number: addressData.number,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
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
      } else if (axios.isAxiosError(err) && err.response?.data?.error) {
        message = err.response.data.error
      } else if (err instanceof Error) {
        message = err.message
      } else {
        message = tCommon('status.error')
      }
      setCardError(message)
      setIsLoading(false)
    }
  }

  // Polling overlay
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
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">{t('paymentForm.title')}</CardTitle>
        <CardDescription>{t('paymentForm.description')}</CardDescription>
      </CardHeader>

      <CardContent>
        <CheckoutStepper
          currentStep={currentStep}
          labels={[t('checkout.stepData'), t('checkout.stepPayment')]}
        />

        {currentStep === 1 && (
          <PersonalDataStep
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <CardPaymentStep
            isLoading={isLoading}
            error={cardError}
            onSubmit={handleCardSubmit}
            onBack={() => setCurrentStep(1)}
          />
        )}
      </CardContent>
    </Card>
  )
}
