import type React from 'react'
import { useState, useRef, useCallback, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Eye,
  EyeOff,
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  ArrowRight,
  QrCode,
  CreditCard,
  Loader2
} from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PATHS } from '@/router/paths'
import { trackCheckout } from '@/lib/analytics'
import { formatPhoneBR } from '@/lib/format'
import { useValidateCheckout } from '@/hooks/useValidateCheckout'
import { cn } from '@/lib/utils'
import { quarterlyDiscountPct } from '@/lib/pricing'
import type { Plan } from '@/models/plan'

export interface PersonalFormData {
  name: string
  email: string
  password: string
  phone: string
  // CPF — apenas para fluxo PIX (cartao coleta CPF na step 3 com endereco).
  // Optional pra preservar shape do path autenticado/cartao.
  tax?: string
}

interface FormErrors {
  [key: string]: string
}

interface PersonalDataStepProps {
  formData: PersonalFormData
  setFormData: React.Dispatch<React.SetStateAction<PersonalFormData>>
  isLoading: boolean
  planId: number
  isAuthenticated: boolean
  onNext: () => void
  paymentMethod: 'pix' | 'card'
  onPaymentMethodChange: (method: 'pix' | 'card') => void
  pixMonths: 1 | 3
  onPixMonthsChange: (months: 1 | 3) => void
  plan: Plan
}

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PersonalDataStep({
  formData,
  setFormData,
  isLoading,
  planId,
  isAuthenticated,
  onNext,
  paymentMethod,
  onPaymentMethodChange,
  pixMonths,
  onPixMonthsChange,
  plan
}: PersonalDataStepProps) {
  const { t } = useTranslation('plans')
  const { t: tAuth } = useTranslation('auth')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [emailExistsOnServer, setEmailExistsOnServer] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // mutateAsync é estável em React Query v5; usar o objeto inteiro quebra
  // memoização porque useMutation devolve nova ref a cada render.
  const { mutateAsync: validateAsync } = useValidateCheckout()
  // Email da última request que foi disparada — descarta resposta stale.
  const inFlightEmailRef = useRef<string>('')

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  const validateEmailOnServer = useCallback(
    async (email: string) => {
      if (!email) return
      inFlightEmailRef.current = email
      try {
        const data = await validateAsync({ email })
        // Race guard: ignora resposta se o usuário já mudou o email
        if (inFlightEmailRef.current !== email) return
        setEmailExistsOnServer(data.email_exists)
      } catch (err) {
        if (axios.isCancel(err)) return
        // Não bloqueia o usuário; o gate final é o createPayment.
        // Limpa flag stale: se a request anterior tinha email_exists=true e
        // agora a request falha pra um email diferente, o aviso fica errado.
        if (inFlightEmailRef.current === email) {
          setEmailExistsOnServer(false)
        }
        console.error('validate-checkout (email) failed', err)
        trackCheckout('checkout_validate_failed', {
          field: 'email',
          message: err instanceof Error ? err.message : 'unknown'
        })
      }
    },
    [validateAsync]
  )

  const handleEmailBlur = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      validateEmailOnServer(formData.email)
    }, 300)
  }, [formData.email, validateEmailOnServer])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const formatted = name === 'phone' ? formatPhoneBR(value) : value
    setFormData((prev) => ({ ...prev, [name]: formatted }))
    if (name === 'email') setEmailExistsOnServer(false)
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const emailBlocked = !isAuthenticated && emailExistsOnServer

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = tAuth('validation.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = tAuth('validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = tAuth('validation.emailInvalid')
    }

    // Password obrigatorio apenas em fluxo anonimo (criando conta). User
    // autenticado renovando tem formData.password = '' inicialmente — sem
    // este gate, validateForm bloqueia onNext durante a janela de loading
    // do useUser caso o user clique antes do auto-avanco pra step 2.
    if (!isAuthenticated) {
      if (!formData.password) {
        newErrors.password = tAuth('validation.passwordRequired')
      } else if (formData.password.length < 8) {
        newErrors.password = tAuth('validation.passwordMin')
      }
    }

    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (!formData.phone.trim()) {
      newErrors.phone = tAuth('validation.phoneRequired')
    } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      newErrors.phone = tAuth('validation.phoneInvalid')
    }

    // CPF obrigatorio apenas pro fluxo PIX (cartao coleta na step 3).
    if (paymentMethod === 'pix') {
      const taxDigits = (formData.tax || '').replace(/\D/g, '')
      if (taxDigits.length !== 11) {
        newErrors.tax = t('paymentForm.cpfInvalid')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm() && !emailBlocked) {
      trackCheckout('checkout_step1_submit')
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-4 animate-fade-in-up">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-muted-foreground">
            {t('paymentForm.fullName')}
          </Label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-muted-foreground">
            {t('paymentForm.emailLabel')}
          </Label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t('paymentForm.emailPlaceholder')}
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleEmailBlur}
              disabled={isLoading}
              className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          {emailBlocked && (
            <p className="text-xs text-destructive">
              <Trans
                i18nKey="paymentForm.emailExistsBlocked"
                t={t}
                components={{
                  login: (
                    <Link
                      to={`${PATHS.login}?from=${encodeURIComponent(`/checkout/${planId}`)}`}
                      className="font-medium underline text-destructive"
                    />
                  )
                }}
              />
            </p>
          )}
        </div>

        {/* Password só renderiza pra fluxo anônimo (criando conta).
            Autenticado renovando nao tem senha pra digitar — formData.password
            ja eh '' inicialmente, e backend aceita empty em renewal. Renderizar
            campo enganaria UX (parece obrigatorio mas nao eh) e a validacao
            ja esta gated por !isAuthenticated em validateForm. */}
        {!isAuthenticated && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">
              {t('paymentForm.passwordLabel')}
            </Label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? t('paymentForm.hidePassword') : t('paymentForm.showPassword')
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-muted-foreground">
            {t('paymentForm.phoneLabel')}
          </Label>
          <div className="relative">
            <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="text"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t('paymentForm.phonePlaceholder')}
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`pl-10 font-mono ${errors.phone ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        {paymentMethod === 'pix' && (
          <div className="space-y-2">
            <Label htmlFor="tax" className="text-muted-foreground">
              {t('paymentForm.cpfLabel')}
            </Label>
            <Input
              id="tax"
              name="tax"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={t('paymentForm.cpfPlaceholder')}
              value={formData.tax || ''}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, tax: e.target.value }))
                if (errors.tax) setErrors((prev) => ({ ...prev, tax: '' }))
              }}
              disabled={isLoading}
              maxLength={14}
              className={errors.tax ? 'border-destructive' : ''}
            />
            {errors.tax && <p className="text-xs text-destructive">{errors.tax}</p>}
          </div>
        )}
      </fieldset>

      <div className="space-y-3 pt-4 border-t border-border/50">
        <p className="text-sm font-medium text-foreground">{t('checkout.paymentMethod')}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onPaymentMethodChange('pix')}
            disabled={isLoading}
            className={cn(
              'flex flex-col items-start gap-1.5 rounded-lg border p-4 text-left transition-all',
              paymentMethod === 'pix'
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span className="text-sm font-medium">{t('checkout.pixOption')}</span>
            </div>
            <span className="text-xs text-muted-foreground">{t('checkout.pixDescription')}</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange('card')}
            disabled={isLoading}
            className={cn(
              'flex flex-col items-start gap-1.5 rounded-lg border p-4 text-left transition-all',
              paymentMethod === 'card'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">{t('checkout.cardOption')}</span>
            </div>
            <span className="text-xs text-muted-foreground">{t('checkout.cardDescription')}</span>
          </button>
        </div>

        {paymentMethod === 'pix' && plan.quarterly_price_cents != null && (
          <div className="space-y-2 pl-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t('checkout.pixPeriodLabel')}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onPixMonthsChange(1)}
                disabled={isLoading}
                className={cn(
                  'rounded-md border px-3 py-2 text-sm transition-all',
                  pixMonths === 1
                    ? 'border-emerald-500 bg-emerald-500/5 font-medium'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                {t('checkout.pixMonthly', { price: formatCurrencyBRL(plan.price) })}
              </button>
              <button
                type="button"
                onClick={() => onPixMonthsChange(3)}
                disabled={isLoading}
                className={cn(
                  'rounded-md border px-3 py-2 text-sm transition-all',
                  pixMonths === 3
                    ? 'border-emerald-500 bg-emerald-500/5 font-medium'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                {t('checkout.pixQuarterly', {
                  price: formatCurrencyBRL(plan.quarterly_price_cents / 100),
                  discount: quarterlyDiscountPct(plan)
                })}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          variant="glow"
          onClick={handleNext}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : paymentMethod === 'pix' ? (
            <>
              {t('checkout.generateQR')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              {t('paymentForm.nextStep')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          <Trans
            i18nKey="paymentForm.termsAccept"
            t={t}
            components={{
              terms: <Link to={PATHS.terms} className="underline hover:text-foreground" />,
              privacy: <Link to={PATHS.privacy} className="underline hover:text-foreground" />
            }}
          />
        </p>
      </div>
    </div>
  )
}
