import type React from 'react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  FileTextIcon,
  ShieldCheck,
  CreditCard
} from 'lucide-react'
import type { Plan } from '@/models/plan'
import { api } from '@/services/api'
import { createPayment, checkPaymentStatus } from '@/services/paymentService'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PATHS } from '@/router/paths'

declare global {
  interface Window {
    PagarmeCheckout: {
      init: (
        onSuccess: (data: { pagarmetoken: string }) => boolean,
        onError: (error: { message: string }) => boolean
      ) => void
    }
  }
}

interface PaymentFormProps {
  plan: Plan
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  cpfCnpj: string
  phone: string
}

interface FormErrors {
  [key: string]: string
}

function usePagarmeScript() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.pagar.me/v1/tokenizecard.js'
    script.dataset.pagarmeCheckoutPublicKey = import.meta.env.VITE_PAGARME_PUBLIC_KEY
    script.onload = () => setIsLoaded(true)
    script.onerror = () => setHasError(true)
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return { isLoaded, hasError }
}

export function PaymentForm({ plan, isLoading, setIsLoading }: PaymentFormProps) {
  const { t } = useTranslation('plans')
  const { t: tAuth } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const { isLoaded: scriptLoaded, hasError: scriptError } = usePagarmeScript()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'polling' | 'timeout'>('idle')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpfCnpj: '',
    phone: ''
  })

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timers = debounceTimers.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)
    }
  }, [])

  const validateFieldOnServer = useCallback(
    async (field: 'email' | 'cpfCnpj', value: string) => {
      const email = field === 'email' ? value : formData.email
      const tax =
        field === 'cpfCnpj' ? value.replace(/\D/g, '') : formData.cpfCnpj.replace(/\D/g, '')

      if (!email || !tax) return

      try {
        const res = await api.post('/api/users/validate-checkout', { email, tax })
        const data = res.data as { email_exists: boolean; tax_exists: boolean }

        setErrors((prev) => {
          const next = { ...prev }
          if (field === 'email') {
            next.email = data.email_exists ? t('paymentForm.emailExists') : ''
          }
          if (field === 'cpfCnpj') {
            next.cpfCnpj = data.tax_exists ? t('paymentForm.cpfExists') : ''
          }
          return next
        })
      } catch {
        // Silently ignore validation errors
      }
    },
    [formData.email, formData.cpfCnpj, t]
  )

  const handleFieldBlur = useCallback(
    (field: 'email' | 'cpfCnpj', value: string) => {
      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field])
      }
      debounceTimers.current[field] = setTimeout(() => {
        validateFieldOnServer(field, value)
      }, 300)
    },
    [validateFieldOnServer]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cpfCnpj') {
      const digits = value.replace(/\D/g, '').slice(0, 14)
      if (digits.length <= 11) {
        formattedValue = digits
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      } else {
        formattedValue = digits
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      }
    }

    if (name === 'phone') {
      formattedValue = value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    if (errors[name] || errors.submit) {
      setErrors((prev) => ({ ...prev, [name]: '', submit: '' }))
    }
  }

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

    if (!formData.password) {
      newErrors.password = tAuth('validation.passwordRequired')
    } else if (formData.password.length < 8) {
      newErrors.password = tAuth('validation.passwordMin')
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = tAuth('validation.passwordPattern')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = tAuth('validation.confirmPasswordRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = tAuth('validation.passwordsMismatch')
    }

    if (!formData.cpfCnpj.trim()) {
      newErrors.cpfCnpj = tAuth('validation.cpfRequired')
    } else {
      const cpfCnpjDigits = formData.cpfCnpj.replace(/\D/g, '')
      if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) {
        newErrors.cpfCnpj = tAuth('validation.cpfInvalid')
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = tAuth('validation.phoneRequired')
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        newErrors.phone = tAuth('validation.phoneInvalid')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const startPolling = (email: string) => {
    setPollingStatus('polling')

    pollingRef.current = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(email)
        if (result.status === 'confirmed') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)
          navigate(`${PATHS.paymentConfirmation}?plan=${encodeURIComponent(plan.name)}`)
        }
      } catch {
        // Continue polling on errors
      }
    }, 3000)

    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      setPollingStatus('timeout')
      setIsLoading(false)
    }, 120000)
  }

  const submitPayment = async (cardToken: string) => {
    try {
      const result = await createPayment(plan.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        tax: formData.cpfCnpj.replace(/\D/g, ''),
        cellphone: formData.phone.replace(/\D/g, ''),
        card_token: cardToken
      })

      if (result.status === 'processing') {
        startPolling(formData.email)
      }
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : err instanceof Error
            ? err.message
            : tCommon('status.error')
      setErrors({ submit: message })
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!scriptLoaded || !window.PagarmeCheckout) {
      setErrors({ submit: t('paymentForm.scriptLoadError') })
      return
    }

    setIsLoading(true)
    setErrors({})

    window.PagarmeCheckout.init(
      (data) => {
        submitPayment(data.pagarmetoken)
        return true
      },
      (error) => {
        setErrors({ submit: error.message || t('paymentForm.cardError') })
        setIsLoading(false)
        return false
      }
    )
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
        <form
          data-pagarmecheckout-form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-8"
        >
          {/* Submit Error Alert */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Script load error */}
          {scriptError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t('paymentForm.scriptLoadError')}</AlertDescription>
            </Alert>
          )}

          {/* Personal Data Section */}
          <fieldset className="space-y-4 animate-fade-in-up">
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t('paymentForm.personalData')}
            </legend>

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
                  placeholder={t('paymentForm.fullNamePlaceholder')}
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
                  placeholder={t('paymentForm.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('email', formData.email)}
                  disabled={isLoading}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email}
                  {errors.email === t('paymentForm.emailExists') && (
                    <>
                      {' '}
                      <Link to={PATHS.login} className="font-medium underline">
                        {t('paymentForm.goToLogin')}
                      </Link>
                    </>
                  )}
                </p>
              )}
            </div>

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
                  placeholder="••••••••"
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
              <p className="text-xs text-muted-foreground">{t('paymentForm.passwordHelper')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-muted-foreground">
                {t('paymentForm.confirmPassword')}
              </Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? t('paymentForm.hidePassword')
                      : t('paymentForm.showPassword')
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </fieldset>

          {/* Additional Data Section */}
          <fieldset
            className="space-y-4 border-t border-border/50 pt-8 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t('paymentForm.additionalData')}
            </legend>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj" className="text-muted-foreground">
                {t('paymentForm.cpfLabel')}
              </Label>
              <div className="relative">
                <FileTextIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cpfCnpj"
                  name="cpfCnpj"
                  type="text"
                  placeholder={t('paymentForm.cpfPlaceholder')}
                  value={formData.cpfCnpj}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('cpfCnpj', formData.cpfCnpj)}
                  disabled={isLoading}
                  className={`pl-10 font-mono ${errors.cpfCnpj ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj}</p>}
            </div>

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
                  placeholder={t('paymentForm.phonePlaceholder')}
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`pl-10 font-mono ${errors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </fieldset>

          {/* Card Data Section */}
          <fieldset
            className="space-y-4 border-t border-border/50 pt-8 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t('paymentForm.cardData')}
            </legend>

            <div className="space-y-2">
              <Label htmlFor="card_holder" className="text-muted-foreground">
                {t('paymentForm.cardHolder')}
              </Label>
              <Input
                id="card_holder"
                data-pagarmecheckout-element="holder_name"
                type="text"
                placeholder={t('paymentForm.cardHolderPlaceholder')}
                disabled={isLoading}
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card_number" className="text-muted-foreground">
                {t('paymentForm.cardNumber')}
              </Label>
              <Input
                id="card_number"
                data-pagarmecheckout-element="number"
                type="text"
                placeholder={t('paymentForm.cardNumberPlaceholder')}
                disabled={isLoading}
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="card_exp_month" className="text-muted-foreground">
                  {t('paymentForm.cardExpMonth')}
                </Label>
                <Input
                  id="card_exp_month"
                  data-pagarmecheckout-element="exp_month"
                  type="text"
                  placeholder={t('paymentForm.cardExpMonthPlaceholder')}
                  disabled={isLoading}
                  className="font-mono text-center"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_exp_year" className="text-muted-foreground">
                  {t('paymentForm.cardExpYear')}
                </Label>
                <Input
                  id="card_exp_year"
                  data-pagarmecheckout-element="exp_year"
                  type="text"
                  placeholder={t('paymentForm.cardExpYearPlaceholder')}
                  disabled={isLoading}
                  className="font-mono text-center"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_cvv" className="text-muted-foreground">
                  {t('paymentForm.cardCvv')}
                </Label>
                <Input
                  id="card_cvv"
                  data-pagarmecheckout-element="cvv"
                  type="text"
                  placeholder={t('paymentForm.cardCvvPlaceholder')}
                  disabled={isLoading}
                  className="font-mono text-center"
                  maxLength={4}
                />
              </div>
            </div>
          </fieldset>

          {/* Submit Button */}
          <div className="space-y-4 border-t border-border/50 pt-8">
            <Button
              type="submit"
              variant="glow"
              disabled={
                isLoading ||
                scriptError ||
                errors.email === t('paymentForm.emailExists') ||
                errors.cpfCnpj === t('paymentForm.cpfExists')
              }
              className="h-11 w-full text-base"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {tCommon('actions.processing')}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {t('paymentForm.submitButton')}
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>{t('paymentForm.securityMessage')}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>{t('paymentForm.lgpdBadge')}</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
