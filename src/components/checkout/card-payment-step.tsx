import type React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Lock, ShieldCheck, FileTextIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CardData } from '@/services/paymentService'
import { useValidateCheckout } from '@/hooks/useValidateCheckout'
import { trackCheckout } from '@/lib/analytics'
import { CardPreview } from './card-preview'

interface CardFormState {
  cpfCnpj: string
  holderName: string
  cardNumber: string
  expDate: string
  cvv: string
}

export interface AddressData {
  zipCode: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
}

export interface DocumentData {
  cpfCnpj: string
}

interface CardPaymentStepProps {
  isLoading: boolean
  error: string
  userName: string
  userEmail: string
  onSubmit: (cardData: CardData, docData: DocumentData) => void
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  if (digits.length === 2 && !value.endsWith('/')) return `${digits}/`
  return digits
}

function parseExpDate(expDate: string): { month: number; year: number } {
  const digits = expDate.replace(/\D/g, '')
  const rawYear = parseInt(digits.slice(2, 4), 10)
  return {
    month: parseInt(digits.slice(0, 2), 10),
    year: rawYear < 100 ? 2000 + rawYear : rawYear
  }
}

function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function CardPaymentStep({
  isLoading,
  error,
  userName,
  userEmail,
  onSubmit
}: CardPaymentStepProps) {
  const { t } = useTranslation('plans')
  const { t: tAuth } = useTranslation('auth')

  const [cardForm, setCardForm] = useState<CardFormState>({
    cpfCnpj: '',
    // Inicializa com o nome do step 1 (UPPERCASE). Se o user voltar e mudar
    // o nome, sincronizamos via useEffect abaixo enquanto ele não tiver
    // editado holderName manualmente.
    holderName: userName.toUpperCase(),
    cardNumber: '',
    expDate: '',
    cvv: ''
  })
  const holderManuallyEdited = useRef(false)
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof CardFormState, string>>
  >({})
  const [cpfExistsOnServer, setCpfExistsOnServer] = useState(false)
  const [cvvFocused, setCvvFocused] = useState(false)
  const cpfDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { mutateAsync: validateAsync } = useValidateCheckout()
  const inFlightCpfRef = useRef<string>('')
  // Skip do primeiro tick do effect-on-userEmail (mount) pra não disparar
  // setStates inúteis sem nenhuma mudança real.
  const isFirstUserEmailEffect = useRef(true)

  useEffect(() => {
    return () => {
      if (cpfDebounce.current) clearTimeout(cpfDebounce.current)
    }
  }, [])

  // Sincroniza holderName com userName se o user voltou ao step 1 e mudou o nome,
  // mas SOMENTE se ele ainda não editou o campo holderName aqui no step 3.
  useEffect(() => {
    if (!holderManuallyEdited.current) {
      setCardForm((prev) => ({ ...prev, holderName: userName.toUpperCase() }))
    }
  }, [userName])

  // Se o usuário voltar pra etapa 1 e mudar o email, o resultado anterior do CPF
  // (que era único pro email antigo) fica stale. Reseta + limpa erro inline
  // pra evitar estado misto (erro vermelho + botão habilitado).
  useEffect(() => {
    if (isFirstUserEmailEffect.current) {
      isFirstUserEmailEffect.current = false
      return
    }
    setCpfExistsOnServer(false)
    setValidationErrors((prev) => (prev.cpfCnpj ? { ...prev, cpfCnpj: '' } : prev))
  }, [userEmail])

  const validateCpfOnServer = useCallback(
    async (cpf: string) => {
      const tax = cpf.replace(/\D/g, '')
      if (!tax || (tax.length !== 11 && tax.length !== 14)) return
      inFlightCpfRef.current = tax
      try {
        const data = await validateAsync({ email: userEmail, tax })
        if (inFlightCpfRef.current !== tax) return
        setCpfExistsOnServer(data.tax_exists)
        setValidationErrors((prev) => ({
          ...prev,
          cpfCnpj: data.tax_exists ? t('paymentForm.cpfExists') : ''
        }))
      } catch (err) {
        // Não bloqueia o submit; o backend ainda valida no createPayment.
        // Reporta pra telemetria — sem isso, falha mata a UX prometida.
        console.error('validate-checkout (cpf) failed', err)
        trackCheckout('checkout_validate_failed', {
          field: 'cpf',
          message: err instanceof Error ? err.message : 'unknown'
        })
      }
    },
    [userEmail, t, validateAsync]
  )

  const handleCpfBlur = () => {
    if (cpfDebounce.current) clearTimeout(cpfDebounce.current)
    cpfDebounce.current = setTimeout(() => {
      validateCpfOnServer(cardForm.cpfCnpj)
    }, 300)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cardNumber') formattedValue = formatCardNumber(value)
    else if (name === 'expDate') formattedValue = formatExpDate(value)
    else if (name === 'cvv') formattedValue = value.replace(/\D/g, '').slice(0, 4)
    else if (name === 'cpfCnpj') formattedValue = formatCpfCnpj(value)

    setCardForm((prev) => ({ ...prev, [name]: formattedValue }))
    if (name === 'holderName') holderManuallyEdited.current = true
    if (name === 'cpfCnpj') setCpfExistsOnServer(false)
    if (validationErrors[name as keyof CardFormState]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CardFormState, string>> = {}

    const cpfDigits = cardForm.cpfCnpj.replace(/\D/g, '')
    if (!cardForm.cpfCnpj.trim()) errors.cpfCnpj = tAuth('validation.cpfRequired')
    else if (cpfDigits.length !== 11 && cpfDigits.length !== 14)
      errors.cpfCnpj = tAuth('validation.cpfInvalid')

    const cardDigits = cardForm.cardNumber.replace(/\s/g, '')
    if (!cardForm.holderName.trim()) errors.holderName = t('paymentForm.fieldRequired')
    if (cardDigits.length < 13 || cardDigits.length > 19)
      errors.cardNumber = t('paymentForm.invalidCardNumber')

    const expDigits = cardForm.expDate.replace(/\D/g, '')
    if (expDigits.length < 4) errors.expDate = t('paymentForm.invalidExpiry')
    else {
      const expMonth = parseInt(expDigits.slice(0, 2), 10)
      const expYear = 2000 + parseInt(expDigits.slice(2, 4), 10)
      const now = new Date()
      if (expMonth < 1 || expMonth > 12) errors.expDate = t('paymentForm.invalidExpiry')
      else if (
        expYear < now.getFullYear() ||
        (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
      )
        errors.expDate = t('paymentForm.invalidExpiry')
    }

    if (cardForm.cvv.length < 3) errors.cvv = t('paymentForm.invalidCvv')

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cpfExistsOnServer) return
    if (!validateForm()) return

    trackCheckout('checkout_step3_submit')

    const { month, year } = parseExpDate(cardForm.expDate)
    onSubmit(
      {
        holderName: cardForm.holderName,
        cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
        expMonth: month,
        expYear: year,
        cvv: cardForm.cvv
      },
      {
        cpfCnpj: cardForm.cpfCnpj
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CardPreview
        cardNumber={cardForm.cardNumber}
        holderName={cardForm.holderName}
        expDate={cardForm.expDate}
        cvv={cardForm.cvv}
        cvvFocused={cvvFocused}
      />

      <div className="space-y-4 animate-fade-in-up">
        <div className="space-y-2">
          <Label htmlFor="holderName" className="text-muted-foreground">
            {t('paymentForm.cardHolder')}
          </Label>
          <Input
            id="holderName"
            name="holderName"
            type="text"
            autoComplete="cc-name"
            value={cardForm.holderName}
            onChange={handleChange}
            disabled={isLoading}
            className={`uppercase ${validationErrors.holderName ? 'border-destructive' : ''}`}
          />
          {validationErrors.holderName && (
            <p className="text-xs text-destructive">{validationErrors.holderName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardNumber" className="text-muted-foreground">
            {t('paymentForm.cardNumber')}
          </Label>
          <Input
            id="cardNumber"
            name="cardNumber"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder={t('paymentForm.cardNumberPlaceholder')}
            value={cardForm.cardNumber}
            onChange={handleChange}
            disabled={isLoading}
            className={`font-mono ${validationErrors.cardNumber ? 'border-destructive' : ''}`}
          />
          {validationErrors.cardNumber && (
            <p className="text-xs text-destructive">{validationErrors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="expDate" className="text-muted-foreground">
              {t('paymentForm.cardExpiry')}
            </Label>
            <Input
              id="expDate"
              name="expDate"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder={t('paymentForm.cardExpiryPlaceholder')}
              value={cardForm.expDate}
              onChange={handleChange}
              disabled={isLoading}
              className={`font-mono text-center ${
                validationErrors.expDate ? 'border-destructive' : ''
              }`}
              maxLength={5}
            />
            {validationErrors.expDate && (
              <p className="text-xs text-destructive">{validationErrors.expDate}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv" className="text-muted-foreground">
              {t('paymentForm.cardCvv')}
            </Label>
            <Input
              id="cvv"
              name="cvv"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={cardForm.cvv}
              onChange={handleChange}
              onFocus={() => setCvvFocused(true)}
              onBlur={() => setCvvFocused(false)}
              disabled={isLoading}
              className={`font-mono text-center ${
                validationErrors.cvv ? 'border-destructive' : ''
              }`}
              maxLength={4}
            />
            {validationErrors.cvv && (
              <p className="text-xs text-destructive">{validationErrors.cvv}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 animate-fade-in-up">
        <div className="space-y-2">
          <Label htmlFor="cpfCnpj" className="text-muted-foreground">
            {t('paymentForm.cpfLabel')}
          </Label>
          <div className="relative">
            <FileTextIcon
              className={
                'pointer-events-none absolute left-3 top-1/2 h-4 w-4' +
                ' -translate-y-1/2 text-muted-foreground'
              }
            />
            <Input
              id="cpfCnpj"
              name="cpfCnpj"
              type="text"
              inputMode="numeric"
              placeholder={t('paymentForm.cpfPlaceholder')}
              value={cardForm.cpfCnpj}
              onChange={handleChange}
              onBlur={handleCpfBlur}
              disabled={isLoading}
              className={`pl-10 font-mono ${validationErrors.cpfCnpj ? 'border-destructive' : ''}`}
            />
          </div>
          {validationErrors.cpfCnpj && (
            <p className="text-xs text-destructive">{validationErrors.cpfCnpj}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t border-border/50 pt-6">
        <Button
          type="submit"
          variant="glow"
          disabled={isLoading || cpfExistsOnServer}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {t('paymentForm.processingPayment')}
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              {t('paymentForm.finishPayment')}
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
  )
}
