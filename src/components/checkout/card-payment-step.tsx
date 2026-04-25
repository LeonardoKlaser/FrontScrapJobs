import type React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Lock,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  FileTextIcon,
  PhoneIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CardData } from '@/services/paymentService'
import { useCepLookup } from '@/hooks/useCepLookup'
import { useValidateCheckout } from '@/hooks/useValidateCheckout'
import { trackCheckout } from '@/lib/analytics'

interface CardFormState {
  cpfCnpj: string
  phone: string
  holderName: string
  cardNumber: string
  expDate: string
  cvv: string
  zipCode: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
}

export interface AddressData {
  zipCode: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
}

export interface DocumentContactData {
  cpfCnpj: string
  phone: string
}

interface CardPaymentStepProps {
  isLoading: boolean
  error: string
  userName: string
  userEmail: string
  planPrice: string
  onSubmit: (cardData: CardData, addressData: AddressData, docData: DocumentContactData) => void
  onBack: () => void
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

function formatPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function formatZipCode(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
}

const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO'
]

export function CardPaymentStep({
  isLoading,
  error,
  userName,
  userEmail,
  planPrice,
  onSubmit,
  onBack
}: CardPaymentStepProps) {
  const { t } = useTranslation('plans')
  const { t: tAuth } = useTranslation('auth')

  const [cardForm, setCardForm] = useState<CardFormState>({
    cpfCnpj: '',
    phone: '',
    holderName: userName.toUpperCase(),
    cardNumber: '',
    expDate: '',
    cvv: '',
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: ''
  })
  const [autoFilledFields, setAutoFilledFields] = useState<Set<keyof CardFormState>>(new Set())
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof CardFormState, string>>
  >({})
  const [cpfExistsOnServer, setCpfExistsOnServer] = useState(false)
  const cpfDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  // mutateAsync é estável; o objeto inteiro de useMutation muda toda render.
  const { mutateAsync: validateAsync } = useValidateCheckout()
  const inFlightCpfRef = useRef<string>('')
  // Skip do primeiro tick do effect-on-userEmail (mount) pra não disparar
  // setStates inúteis sem nenhuma mudança real.
  const isFirstUserEmailEffect = useRef(true)

  const cep = useCepLookup(cardForm.zipCode)

  useEffect(() => {
    return () => {
      if (cpfDebounce.current) clearTimeout(cpfDebounce.current)
    }
  }, [])

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

  useEffect(() => {
    if (!cep.data) return
    const data = cep.data
    const filled = new Set<keyof CardFormState>()

    setCardForm((prev) => {
      const next = { ...prev }
      if (!prev.street) {
        next.street = data.logradouro
        filled.add('street')
      }
      if (!prev.neighborhood) {
        next.neighborhood = data.bairro
        filled.add('neighborhood')
      }
      if (!prev.city) {
        next.city = data.localidade
        filled.add('city')
      }
      if (!prev.state) {
        next.state = data.uf
        filled.add('state')
      }
      return next
    })

    // Mutações de outros estados ficam fora do updater do setCardForm —
    // updaters devem ser puros (StrictMode em dev roda 2x).
    if (filled.size === 0) return

    setAutoFilledFields((prev) => {
      const merged = new Set(prev)
      filled.forEach((f) => merged.add(f))
      return merged
    })
    setValidationErrors((errs) => {
      const cleared = { ...errs }
      filled.forEach((f) => {
        cleared[f] = ''
      })
      return cleared
    })
  }, [cep.data])

  const validateCpfOnServer = useCallback(
    async (cpf: string) => {
      const tax = cpf.replace(/\D/g, '')
      if (!tax || (tax.length !== 11 && tax.length !== 14)) return
      inFlightCpfRef.current = tax
      try {
        const data = await validateAsync({ email: userEmail, tax })
        // Race guard: ignora resposta stale se usuário já mudou o CPF
        if (inFlightCpfRef.current !== tax) return
        setCpfExistsOnServer(data.tax_exists)
        setValidationErrors((prev) => ({
          ...prev,
          cpfCnpj: data.tax_exists ? t('paymentForm.cpfExists') : ''
        }))
      } catch (err) {
        // Não bloqueia o submit; o backend ainda valida no createPayment.
        // Mas loga: falha silenciosa aqui mata a UX prometida pelo spec.
        console.error('validate-checkout (cpf) failed', err)
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

  // Núcleo do "usuário editou X": atualiza valor, remove flag de auto-fill
  // e limpa qualquer erro pendente desse campo. Compartilhado entre input e select.
  const applyFieldEdit = (name: keyof CardFormState, value: string) => {
    setCardForm((prev) => ({ ...prev, [name]: value }))

    if (autoFilledFields.has(name)) {
      setAutoFilledFields((prev) => {
        const next = new Set(prev)
        next.delete(name)
        return next
      })
    }

    if (name === 'cpfCnpj') setCpfExistsOnServer(false)

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cardNumber') formattedValue = formatCardNumber(value)
    else if (name === 'expDate') formattedValue = formatExpDate(value)
    else if (name === 'cvv') formattedValue = value.replace(/\D/g, '').slice(0, 4)
    else if (name === 'cpfCnpj') formattedValue = formatCpfCnpj(value)
    else if (name === 'phone') formattedValue = formatPhone(value)
    else if (name === 'zipCode') formattedValue = formatZipCode(value)

    applyFieldEdit(name as keyof CardFormState, formattedValue)
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CardFormState, string>> = {}

    const cpfDigits = cardForm.cpfCnpj.replace(/\D/g, '')
    if (!cardForm.cpfCnpj.trim()) errors.cpfCnpj = tAuth('validation.cpfRequired')
    else if (cpfDigits.length !== 11 && cpfDigits.length !== 14)
      errors.cpfCnpj = tAuth('validation.cpfInvalid')

    const phoneDigits = cardForm.phone.replace(/\D/g, '')
    if (!cardForm.phone.trim()) errors.phone = tAuth('validation.phoneRequired')
    else if (phoneDigits.length < 10 || phoneDigits.length > 11)
      errors.phone = tAuth('validation.phoneInvalid')

    if (!cardForm.zipCode.trim()) errors.zipCode = t('paymentForm.fieldRequired')
    if (!cardForm.street.trim()) errors.street = t('paymentForm.fieldRequired')
    if (!cardForm.number.trim()) errors.number = t('paymentForm.fieldRequired')
    if (!cardForm.neighborhood.trim()) errors.neighborhood = t('paymentForm.fieldRequired')
    if (!cardForm.city.trim()) errors.city = t('paymentForm.fieldRequired')
    if (!cardForm.state) errors.state = t('paymentForm.fieldRequired')

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

    trackCheckout('checkout_step2_submit')

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
        zipCode: cardForm.zipCode.replace(/\D/g, ''),
        street: cardForm.street,
        number: cardForm.number,
        neighborhood: cardForm.neighborhood,
        city: cardForm.city,
        state: cardForm.state
      },
      {
        cpfCnpj: cardForm.cpfCnpj,
        phone: cardForm.phone
      }
    )
  }

  const autoFillClass = (field: keyof CardFormState) =>
    autoFilledFields.has(field) ? 'text-muted-foreground/70 italic' : ''

  const firstName = userName.trim().split(/\s+/)[0] || ''

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('paymentForm.prevStep')}
      </button>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold">
          {t('paymentForm.step2Greeting', { name: firstName })}
        </h3>
        <p className="text-sm text-muted-foreground">{t('paymentForm.step2Subtitle')}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <fieldset className="space-y-4 animate-fade-in-up">
        <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('paymentForm.documentSection')}
        </legend>

        <div className="grid grid-cols-2 gap-3">
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
                inputMode="numeric"
                placeholder={t('paymentForm.cpfPlaceholder')}
                value={cardForm.cpfCnpj}
                onChange={handleChange}
                onBlur={handleCpfBlur}
                disabled={isLoading}
                className={`pl-10 font-mono ${
                  validationErrors.cpfCnpj ? 'border-destructive' : ''
                }`}
              />
            </div>
            {validationErrors.cpfCnpj && (
              <p className="text-xs text-destructive">{validationErrors.cpfCnpj}</p>
            )}
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
                inputMode="tel"
                autoComplete="tel"
                placeholder={t('paymentForm.phonePlaceholder')}
                value={cardForm.phone}
                onChange={handleChange}
                disabled={isLoading}
                className={`pl-10 font-mono ${validationErrors.phone ? 'border-destructive' : ''}`}
              />
            </div>
            {validationErrors.phone && (
              <p className="text-xs text-destructive">{validationErrors.phone}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 animate-fade-in-up">
        <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {t('paymentForm.billingAddress')}
        </legend>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="zipCode" className="text-muted-foreground">
              {t('paymentForm.zipCode')}
            </Label>
            <div className="relative">
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder={t('paymentForm.zipCodePlaceholder')}
                value={cardForm.zipCode}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={9}
                className={validationErrors.zipCode ? 'border-destructive' : ''}
              />
              {cep.isLoading && (
                <Spinner className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {validationErrors.zipCode && (
              <p className="text-xs text-destructive">{validationErrors.zipCode}</p>
            )}
            {cep.error && (
              <p className="text-xs text-muted-foreground">{t('paymentForm.cepLookupError')}</p>
            )}
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="street" className="text-muted-foreground">
              {t('paymentForm.street')}
            </Label>
            <Input
              id="street"
              name="street"
              type="text"
              autoComplete="address-line1"
              placeholder={t('paymentForm.streetPlaceholder')}
              value={cardForm.street}
              onChange={handleChange}
              disabled={isLoading}
              className={`${autoFillClass('street')} ${
                validationErrors.street ? 'border-destructive' : ''
              }`}
            />
            {validationErrors.street && (
              <p className="text-xs text-destructive">{validationErrors.street}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="number" className="text-muted-foreground">
              {t('paymentForm.addressNumber')}
            </Label>
            <Input
              id="number"
              name="number"
              type="text"
              inputMode="numeric"
              placeholder={t('paymentForm.addressNumberPlaceholder')}
              value={cardForm.number}
              onChange={handleChange}
              disabled={isLoading}
              className={validationErrors.number ? 'border-destructive' : ''}
            />
            {validationErrors.number && (
              <p className="text-xs text-destructive">{validationErrors.number}</p>
            )}
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="neighborhood" className="text-muted-foreground">
              {t('paymentForm.neighborhood')}
            </Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              type="text"
              placeholder={t('paymentForm.neighborhoodPlaceholder')}
              value={cardForm.neighborhood}
              onChange={handleChange}
              disabled={isLoading}
              className={`${autoFillClass('neighborhood')} ${
                validationErrors.neighborhood ? 'border-destructive' : ''
              }`}
            />
            {validationErrors.neighborhood && (
              <p className="text-xs text-destructive">{validationErrors.neighborhood}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-muted-foreground">
              {t('paymentForm.city')}
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              placeholder={t('paymentForm.cityPlaceholder')}
              value={cardForm.city}
              onChange={handleChange}
              disabled={isLoading}
              className={`${autoFillClass('city')} ${
                validationErrors.city ? 'border-destructive' : ''
              }`}
            />
            {validationErrors.city && (
              <p className="text-xs text-destructive">{validationErrors.city}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-muted-foreground">
              {t('paymentForm.state')}
            </Label>
            <select
              id="state"
              name="state"
              value={cardForm.state}
              onChange={(e) => applyFieldEdit('state', e.target.value)}
              disabled={isLoading}
              className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${autoFillClass(
                'state'
              )}`}
            >
              <option value="">{t('paymentForm.statePlaceholder')}</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            {validationErrors.state && (
              <p className="text-xs text-destructive">{validationErrors.state}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 animate-fade-in-up">
        <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          {t('paymentForm.cardData')}
        </legend>

        <div className="space-y-2">
          <Label htmlFor="holderName" className="text-muted-foreground">
            {t('paymentForm.cardHolder')}
          </Label>
          <Input
            id="holderName"
            name="holderName"
            type="text"
            autoComplete="cc-name"
            placeholder={t('paymentForm.cardHolderPlaceholder')}
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
              placeholder={t('paymentForm.cardCvvPlaceholder')}
              value={cardForm.cvv}
              onChange={handleChange}
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
      </fieldset>

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
              {t('paymentForm.finishPayment', { price: planPrice })}
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
