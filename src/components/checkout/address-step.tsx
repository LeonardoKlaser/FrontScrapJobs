import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCepLookup } from '@/hooks/useCepLookup'
import { trackCheckout } from '@/lib/analytics'
import { BRAZILIAN_STATES, formatZipCode } from '@/lib/brazil'
import type { AddressData } from './card-payment-step'

interface AddressStepProps {
  addressData: AddressData
  setAddressData: React.Dispatch<React.SetStateAction<AddressData>>
  isLoading: boolean
  onNext: () => void
  onBack: () => void
}

export function AddressStep({
  addressData,
  setAddressData,
  isLoading,
  onNext,
  onBack
}: AddressStepProps) {
  const { t } = useTranslation('plans')
  const [autoFilled, setAutoFilled] = useState<Set<keyof AddressData>>(new Set())
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({})
  const cep = useCepLookup(addressData.zipCode)

  useEffect(() => {
    if (!cep.data) return
    const data = cep.data
    const filled = new Set<keyof AddressData>()

    setAddressData((prev) => {
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

    if (filled.size === 0) return
    setAutoFilled((prev) => {
      const merged = new Set(prev)
      filled.forEach((f) => merged.add(f))
      return merged
    })
    setErrors((errs) => {
      const cleared = { ...errs }
      filled.forEach((f) => {
        cleared[f] = ''
      })
      return cleared
    })
  }, [cep.data, setAddressData])

  const applyEdit = (name: keyof AddressData, value: string) => {
    setAddressData((prev) => ({ ...prev, [name]: value }))
    if (autoFilled.has(name)) {
      setAutoFilled((prev) => {
        const next = new Set(prev)
        next.delete(name)
        return next
      })
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const formatted = name === 'zipCode' ? formatZipCode(value) : value
    applyEdit(name as keyof AddressData, formatted)
  }

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof AddressData, string>> = {}
    if (!addressData.zipCode.trim()) errs.zipCode = t('paymentForm.fieldRequired')
    if (!addressData.street.trim()) errs.street = t('paymentForm.fieldRequired')
    if (!addressData.number.trim()) errs.number = t('paymentForm.fieldRequired')
    if (!addressData.neighborhood.trim()) errs.neighborhood = t('paymentForm.fieldRequired')
    if (!addressData.city.trim()) errs.city = t('paymentForm.fieldRequired')
    if (!addressData.state) errs.state = t('paymentForm.fieldRequired')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return
    trackCheckout('checkout_step2_submit')
    onNext()
  }

  const autoFillClass = (f: keyof AddressData) =>
    autoFilled.has(f) ? 'text-muted-foreground/70 italic' : ''

  return (
    <div className="space-y-6">
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
        <h3 className="text-lg font-semibold">{t('paymentForm.step2Title')}</h3>
        <p className="text-sm text-muted-foreground">{t('paymentForm.step2Subtitle')}</p>
      </div>

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
                value={addressData.zipCode}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={9}
                className={errors.zipCode ? 'border-destructive' : ''}
              />
              {cep.isLoading && (
                <Spinner className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode}</p>}
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
              value={addressData.street}
              onChange={handleChange}
              disabled={isLoading}
              className={`${autoFillClass('street')} ${errors.street ? 'border-destructive' : ''}`}
            />
            {errors.street && <p className="text-xs text-destructive">{errors.street}</p>}
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
              value={addressData.number}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.number ? 'border-destructive' : ''}
            />
            {errors.number && <p className="text-xs text-destructive">{errors.number}</p>}
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
              value={addressData.neighborhood}
              onChange={handleChange}
              disabled={isLoading}
              className={`${autoFillClass('neighborhood')} ${
                errors.neighborhood ? 'border-destructive' : ''
              }`}
            />
            {errors.neighborhood && (
              <p className="text-xs text-destructive">{errors.neighborhood}</p>
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
              value={addressData.city}
              onChange={handleChange}
              disabled={isLoading}
              className={`${autoFillClass('city')} ${errors.city ? 'border-destructive' : ''}`}
            />
            {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-muted-foreground">
              {t('paymentForm.state')}
            </Label>
            <select
              id="state"
              name="state"
              value={addressData.state}
              onChange={(e) => applyEdit('state', e.target.value)}
              disabled={isLoading}
              className={
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1' +
                ' text-sm shadow-sm transition-colors placeholder:text-muted-foreground' +
                ' focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring' +
                ' disabled:cursor-not-allowed disabled:opacity-50 ' +
                autoFillClass('state')
              }
            >
              <option value="">{t('paymentForm.statePlaceholder')}</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
          </div>
        </div>
      </fieldset>

      <Button
        type="button"
        variant="glow"
        onClick={handleNext}
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {t('paymentForm.nextStep')}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
