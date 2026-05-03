import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'
import { Input } from '@/components/ui/input'
import { usePlans } from '@/hooks/usePlans'

export function SavingsCalculatorSection() {
  const { t, i18n } = useTranslation('landing')
  const { data: plans, isLoading } = usePlans()
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'

  const defaultSalary = locale === 'pt-BR' ? 8000 : 6000
  const [rawSalary, setRawSalary] = useState(defaultSalary)
  const [displayValue, setDisplayValue] = useState(defaultSalary.toLocaleString(locale))

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (digits === '') {
      setRawSalary(0)
      setDisplayValue('')
      return
    }
    const numericValue = Number(digits)
    setRawSalary(numericValue)
    setDisplayValue(numericValue.toLocaleString(locale))
  }

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'BRL'
      }),
    [locale]
  )

  const formatCurrency = (value: number) => currencyFormatter.format(value)

  const { valorHora, economia, custoPlano, roi } = useMemo(() => {
    const hoursPerMonth = Number(t('calculator.hoursPerMonth'))
    const valorHora = rawSalary / hoursPerMonth
    const economia = valorHora * 50
    const paidPlans = plans?.filter((p) => !p.is_trial) ?? []
    const custoPlano = paidPlans.length > 0 ? Math.min(...paidPlans.map((p) => p.price)) : 14.9
    const roi = custoPlano > 0 ? Math.floor(economia / custoPlano) : 0

    return { valorHora, economia, custoPlano, roi }
  }, [rawSalary, plans, t])

  return (
    <SectionWrapper id="calculator">
      <div className="py-16 lg:py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column — text */}
          <div>
            <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
              {t('labels.calculator')}
            </span>

            <h2 className="font-display text-3xl lg:text-5xl font-semibold text-zinc-900 mt-3">
              {t('calculator.title')}{' '}
              <span className="text-gradient-primary">{t('calculator.titleHighlight')}</span>
            </h2>

            <p className="text-base text-zinc-500 mt-4">{t('calculator.description')}</p>
          </div>

          {/* Right column — calculator card */}
          <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200">
            {/* Salary input */}
            <label className="block text-sm font-medium text-zinc-600 mb-2">
              {t('calculator.salaryLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg font-medium">
                {t('calculator.currencySymbol')}
              </span>
              <Input
                className="pl-14 text-3xl h-auto py-3 font-normal text-zinc-900 bg-white"
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleSalaryChange}
              />
            </div>

            {/* Results */}
            <dl className="space-y-3 mt-6">
              {/* Hourly rate */}
              <div className="flex justify-between items-center">
                <dt className="text-[15px] text-zinc-500">{t('calculator.hourlyRate')}</dt>
                <dd
                  className="text-[15px] font-semibold text-zinc-900"
                  style={{ transition: 'all 300ms ease-out' }}
                >
                  {isLoading ? (
                    <div className="h-5 w-20 rounded bg-zinc-200 animate-shimmer" />
                  ) : (
                    formatCurrency(valorHora)
                  )}
                </dd>
              </div>

              {/* Hours saved */}
              <div className="flex justify-between items-center">
                <dt className="text-[15px] text-zinc-500">{t('calculator.hoursSaved')}</dt>
                <dd
                  className="text-[15px] font-semibold text-zinc-900"
                  style={{ transition: 'all 300ms ease-out' }}
                >
                  {t('calculator.hoursUnit')}
                </dd>
              </div>

              <div className="border-t border-zinc-200 my-3" />

              {/* Savings */}
              <div className="flex justify-between items-center">
                <dt className="text-[15px] text-zinc-500">{t('calculator.yourSavings')}</dt>
                <dd
                  className="text-[15px] font-bold text-emerald-500"
                  style={{ transition: 'all 300ms ease-out' }}
                >
                  {isLoading ? (
                    <div className="h-5 w-24 rounded bg-zinc-200 animate-shimmer" />
                  ) : (
                    <>
                      {formatCurrency(economia)}
                      <span className="text-zinc-400 font-normal text-sm">
                        {t('calculator.perMonth')}
                      </span>
                    </>
                  )}
                </dd>
              </div>

              {/* Plan cost */}
              <div className="flex justify-between items-center">
                <dt className="text-[15px] text-zinc-500">{t('calculator.planCost')}</dt>
                <dd
                  className="text-[15px] font-semibold text-zinc-900"
                  style={{ transition: 'all 300ms ease-out' }}
                >
                  {isLoading ? (
                    <div className="h-5 w-20 rounded bg-zinc-200 animate-shimmer" />
                  ) : (
                    <>
                      {formatCurrency(custoPlano)}
                      <span className="text-zinc-400 font-normal text-sm">
                        {t('calculator.perMonth')}
                      </span>
                    </>
                  )}
                </dd>
              </div>

              <div className="border-t border-zinc-200 my-3" />

              {/* ROI badge */}
              {roi > 0 && (
                <div className="flex justify-center pt-1">
                  {isLoading ? (
                    <div className="h-8 w-40 rounded-full bg-zinc-200 animate-shimmer" />
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-sm font-semibold"
                      style={{ transition: 'all 300ms ease-out' }}
                    >
                      <Check className="w-4 h-4" />
                      {t('calculator.roi', { value: roi })}
                    </span>
                  )}
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
