import { useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { signupService } from '@/services/signupService'
import type { SignupCompleteResponse } from '@/services/signupService'
import { PhoneStep } from './PhoneStep'
import { VerifyCodeStep } from './VerifyCodeStep'
import { InfoPaymentStep } from './InfoPaymentStep'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PATHS } from '@/router/paths'

// extractApiError lê o corpo de erro padrão do backend de uma rejeição do axios
// sem espalhar casts inline por cada handler.
interface ApiErrorData {
  error?: string
  message?: string
  attempts_remaining?: number
}

function extractApiError(err: unknown): ApiErrorData {
  return (err as { response?: { data?: ApiErrorData } })?.response?.data ?? {}
}

type Step = 'phone' | 'verify' | 'info'

export function SignupWizard() {
  const { t } = useTranslation('auth')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const planId = Number(searchParams.get('plan')) || 0

  const [step, setStep] = useState<Step>('phone')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [phoneMasked, setPhoneMasked] = useState('')
  const [lastPhone, setLastPhone] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhoneSubmit = useCallback(
    async (name: string, phone: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await signupService.init({
          name,
          phone,
          plan_id: planId || undefined
        })
        setSessionId(result.signup_session_id)
        setPhoneMasked(result.phone_masked)
        setLastPhone({ name, phone })
        setStep('verify')
      } catch (err: unknown) {
        const data = extractApiError(err)
        // Número já cadastrado: o caminho é login, não retry. Mostra a mensagem e
        // redireciona preservando o retorno (espelha o checkout em payment-form).
        if (data.error === 'phone_already_registered') {
          toast.info(data.message || t('signup.phoneExists', 'Número já cadastrado. Faça login.'))
          navigate(`${PATHS.login}?from=${encodeURIComponent(PATHS.signup)}`)
          return
        }
        setError(
          data.message ||
            data.error ||
            t('signup.initError', 'Erro ao enviar código. Tente novamente.')
        )
      } finally {
        setLoading(false)
      }
    },
    [planId, navigate, t]
  )

  const handleVerifySubmit = useCallback(
    async (code: string) => {
      if (!sessionId) return
      setLoading(true)
      setError(null)
      try {
        const result = await signupService.verifyPhone({
          signup_session_id: sessionId,
          code
        })
        if (result.verified) {
          setStep('info')
        }
      } catch (err: unknown) {
        // Código errado vem como HTTP 400 {error:"invalid_code", attempts_remaining} —
        // o axios rejeita, então tratamos aqui (não no valor resolvido). Sem este
        // case, um typo caía no genérico e o user nunca via as tentativas restantes.
        const data = extractApiError(err)
        if (data.error === 'invalid_code') {
          setError(
            t('signup.invalidCode', 'Código inválido. {{remaining}} tentativas restantes.', {
              remaining: data.attempts_remaining ?? 0
            })
          )
        } else if (data.error === 'session_expired') {
          setError(t('signup.sessionExpired', 'Sessão expirada. Comece novamente.'))
          setStep('phone')
        } else if (data.error === 'max_attempts') {
          setError(t('signup.maxAttempts', 'Tentativas esgotadas. Comece novamente.'))
          setStep('phone')
        } else {
          setError(t('signup.verifyError', 'Erro ao verificar código. Tente novamente.'))
        }
      } finally {
        setLoading(false)
      }
    },
    [sessionId, t]
  )

  const handleResend = useCallback(async () => {
    if (!lastPhone.name || !lastPhone.phone) return
    setLoading(true)
    setError(null)
    try {
      const result = await signupService.init({
        name: lastPhone.name,
        phone: lastPhone.phone,
        plan_id: planId || undefined
      })
      setSessionId(result.signup_session_id)
      setPhoneMasked(result.phone_masked)
    } catch (err: unknown) {
      // Mesma recuperação do submit inicial: se o número virou "já cadastrado"
      // (registro em outra aba) leva pro login em vez de prender o user no reenvio.
      const data = extractApiError(err)
      if (data.error === 'phone_already_registered') {
        toast.info(data.message || t('signup.phoneExists', 'Número já cadastrado. Faça login.'))
        navigate(`${PATHS.login}?from=${encodeURIComponent(PATHS.app.home)}`)
        return
      }
      setError(data.message || t('signup.resendError', 'Erro ao reenviar. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }, [lastPhone, planId, navigate, t])

  const handleCompleteSuccess = useCallback(
    (response: SignupCompleteResponse) => {
      if (response.action === 'payment_required' && response.pending_id) {
        const checkoutPlanId = response.plan?.id || planId
        navigate(`${PATHS.checkout(String(checkoutPlanId))}?pending_id=${response.pending_id}`)
      } else if (response.login_required) {
        // Trial criado mas sem cookie (assinatura do JWT falhou no backend). Mandar
        // pro /app cairia direto no interceptor 401 — leva pro login com contexto.
        toast.info(t('signup.accountCreatedLogin', 'Conta criada! Faça login para continuar.'))
        navigate(`${PATHS.login}?from=${encodeURIComponent(PATHS.app.home)}`)
      } else {
        queryClient.invalidateQueries({ queryKey: ['user'] })
        navigate(PATHS.app.home)
      }
    },
    [navigate, queryClient, planId, t]
  )

  const stepNumber = step === 'phone' ? 1 : step === 'verify' ? 2 : 3
  const totalSteps = 3

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center
                rounded-full text-xs font-medium ${
                  s <= stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
            >
              {s}
            </div>
            {s < totalSteps && (
              <div className={`h-0.5 w-8 ${s < stepNumber ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 'phone' && (
        <PhoneStep onSubmit={handlePhoneSubmit} loading={loading} error={error} />
      )}
      {step === 'verify' && sessionId && (
        <VerifyCodeStep
          phoneMasked={phoneMasked}
          onSubmit={handleVerifySubmit}
          onBack={() => {
            setStep('phone')
            setError(null)
          }}
          onResend={handleResend}
          loading={loading}
          error={error}
        />
      )}
      {step === 'info' && sessionId && (
        <InfoPaymentStep
          sessionId={sessionId}
          isPaidPlan={planId > 0}
          onSuccess={handleCompleteSuccess}
          onBack={() => {
            setStep('verify')
            setError(null)
          }}
        />
      )}
    </div>
  )
}
