import { useTranslation } from 'react-i18next'
import {
  Bell,
  LayoutDashboard,
  MessageCircle,
  Radar,
  ScanSearch,
  SlidersHorizontal,
  WandSparkles
} from 'lucide-react'
import { SectionWrapper } from './section-wrapper'

const FEATURES = [
  { key: 'radar', icon: Radar },
  { key: 'selection', icon: SlidersHorizontal },
  { key: 'alerts', icon: Bell },
  { key: 'analysis', icon: ScanSearch },
  { key: 'prompt', icon: WandSparkles }
] as const

const INTERFACES = [
  { key: 'norte', icon: MessageCircle },
  { key: 'dashboard', icon: LayoutDashboard }
] as const

export function IncludedFeaturesSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper id="included" className="bg-muted px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
            {t('included.overline')}
          </p>
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {t('included.title')}
          </h2>
          <p className="mt-4 text-muted-foreground">{t('included.description')}</p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ key, icon: Icon }) => (
            <li
              key={key}
              data-testid="journey-feature"
              className="rounded-2xl border border-border bg-background p-6"
            >
              <Icon className="h-6 w-6 text-emerald-500" />
              <h3 className="mt-4 font-semibold text-foreground">
                {t(`included.features.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`included.features.${key}.body`)}
              </p>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-6 max-w-3xl rounded-xl border border-emerald-500/20 bg-primary/5 px-5 py-4 text-center text-sm text-muted-foreground">
          {t('included.promptNote')}
        </p>

        <div className="mt-12">
          <h3 className="text-center font-display text-xl font-semibold text-foreground">
            {t('included.interfacesTitle')}
          </h3>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {INTERFACES.map(({ key, icon: Icon }) => (
              <li key={key} className="rounded-2xl border border-border bg-background p-6">
                <Icon className="h-6 w-6 text-emerald-500" />
                <h4 className="mt-4 font-semibold text-foreground">
                  {t(`included.interfaces.${key}.title`)}
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`included.interfaces.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionWrapper>
  )
}
