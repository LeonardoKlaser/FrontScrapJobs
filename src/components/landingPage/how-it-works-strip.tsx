import { useTranslation } from 'react-i18next'
import { CreditCard, ListChecks, UserRoundSearch } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'

const STEPS = [
  { key: 'profile', icon: UserRoundSearch },
  { key: 'result', icon: ListChecks },
  { key: 'plan', icon: CreditCard }
] as const

export function HowItWorksStrip() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper id="howItWorks" className="px-6 py-16 text-center">
      <div className="mx-auto max-w-4xl">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
          {t('howItWorks.overline')}
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t('howItWorks.title')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          {t('howItWorks.description')}
        </p>

        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map(({ key, icon: Icon }, index) => (
            <li key={key} className="flex flex-col items-center gap-3">
              <span className="font-mono text-xs font-semibold text-emerald-600">0{index + 1}</span>
              <Icon className="h-6 w-6 text-emerald-500" />
              <h3 className="font-medium text-foreground">{t(`howItWorks.steps.${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`howItWorks.steps.${key}.body`)}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-sm text-muted-foreground">{t('howItWorks.note')}</p>
      </div>
    </SectionWrapper>
  )
}
