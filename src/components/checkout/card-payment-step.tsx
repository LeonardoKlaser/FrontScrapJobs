import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Lock, CreditCard, ArrowLeft, ShieldCheck, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CardData } from '@/services/paymentService'

interface CardFormState {
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

interface CardPaymentStepProps {
  isLoading: boolean
  error: string
  onSubmit: (cardData: CardData, addressData: AddressData) => void
  onBack: () => void
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
  if (digits.length === 2) {
    return `${digits}/`
  }
  return digits
}

function parseExpDate(expDate: string): { month: number; year: number } {
  const digits = expDate.replace(/\D/g, '')
  const rawYear = parseInt(digits.slice(2, 4), 10)
  return {
    month: parseInt(digits.slice(0, 2), 10),
    year: rawYear < 100 ? 2000 + rawYear : rawYear,
  }
}

const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export function CardPaymentStep({ isLoading, error, onSubmit, onBack }: CardPaymentStepProps) {
  const { t } = useTranslation('plans')
  const [cardForm, setCardForm] = useState<CardFormState>({
    holderName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'cardNumber') {
      setCardForm((prev) => ({ ...prev, cardNumber: formatCardNumber(value) }))
    } else if (name === 'expDate') {
      setCardForm((prev) => ({ ...prev, expDate: formatExpDate(value) }))
    } else if (name === 'cvv') {
      setCardForm((prev) => ({ ...prev, cvv: value.replace(/\D/g, '').slice(0, 4) }))
    } else {
      setCardForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { month, year } = parseExpDate(cardForm.expDate)
    onSubmit(
      {
        holderName: cardForm.holderName,
        cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
        expMonth: month,
        expYear: year,
        cvv: cardForm.cvv,
      },
      {
        zipCode: cardForm.zipCode.replace(/\D/g, ''),
        street: cardForm.street,
        number: cardForm.number,
        neighborhood: cardForm.neighborhood,
        city: cardForm.city,
        state: cardForm.state,
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('paymentForm.prevStep')}
      </button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            <Input
              id="zipCode"
              name="zipCode"
              type="text"
              inputMode="numeric"
              placeholder={t('paymentForm.zipCodePlaceholder')}
              value={cardForm.zipCode}
              onChange={handleChange}
              disabled={isLoading}
              maxLength={9}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="street" className="text-muted-foreground">
              {t('paymentForm.street')}
            </Label>
            <Input
              id="street"
              name="street"
              type="text"
              placeholder={t('paymentForm.streetPlaceholder')}
              value={cardForm.street}
              onChange={handleChange}
              disabled={isLoading}
            />
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
              placeholder={t('paymentForm.addressNumberPlaceholder')}
              value={cardForm.number}
              onChange={handleChange}
              disabled={isLoading}
            />
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
            />
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
              placeholder={t('paymentForm.cityPlaceholder')}
              value={cardForm.city}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-muted-foreground">
              {t('paymentForm.state')}
            </Label>
            <select
              id="state"
              name="state"
              value={cardForm.state}
              onChange={(e) => setCardForm((prev) => ({ ...prev, state: e.target.value }))}
              disabled={isLoading}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t('paymentForm.statePlaceholder')}</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
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
            placeholder={t('paymentForm.cardHolderPlaceholder')}
            value={cardForm.holderName}
            onChange={handleChange}
            disabled={isLoading}
            className="uppercase"
          />
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
            placeholder={t('paymentForm.cardNumberPlaceholder')}
            value={cardForm.cardNumber}
            onChange={handleChange}
            disabled={isLoading}
            className="font-mono"
          />
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
              placeholder={t('paymentForm.cardExpiryPlaceholder')}
              value={cardForm.expDate}
              onChange={handleChange}
              disabled={isLoading}
              className="font-mono text-center"
              maxLength={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv" className="text-muted-foreground">
              {t('paymentForm.cardCvv')}
            </Label>
            <Input
              id="cvv"
              name="cvv"
              type="text"
              inputMode="numeric"
              placeholder={t('paymentForm.cardCvvPlaceholder')}
              value={cardForm.cvv}
              onChange={handleChange}
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
          disabled={isLoading}
          className="h-11 w-full text-base"
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
