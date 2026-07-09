import { useTranslation } from 'react-i18next'
import { UserPlus, Building2, Bell, FileCheck } from 'lucide-react'

const STEP_ICONS = [UserPlus, Building2, Bell, FileCheck] as const

export function HowItWorksStrip() {
  const { t } = useTranslation('landing')
  return (
    <section id="howItWorks" className="bg-white px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-semibold text-zinc-900 sm:text-3xl">
        {t('howItWorksNew.headline')}
      </h2>
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
        {STEP_ICONS.map((Icon, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="font-mono text-xs font-semibold text-emerald-600">0{i + 1}</span>
            <Icon className="h-6 w-6 text-emerald-500" />
            <p className="text-sm text-zinc-600">{t(`howItWorksNew.step${i + 1}Title`)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
