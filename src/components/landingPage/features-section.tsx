import { useTranslation } from 'react-i18next'
import { Clock, BarChart3, Mail, Infinity as InfinityIcon } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'

export function FeaturesSection() {
  const { t } = useTranslation('landing')

  const features = [
    {
      icon: Clock,
      titleKey: 'features.scraping.title',
      descriptionKey: 'features.scraping.description',
    },
    {
      icon: BarChart3,
      titleKey: 'features.ai.title',
      descriptionKey: 'features.ai.description',
    },
    {
      icon: Mail,
      titleKey: 'features.alerts.title',
      descriptionKey: 'features.alerts.description',
    },
    {
      icon: InfinityIcon,
      titleKey: 'features.monitoring.title',
      descriptionKey: 'features.monitoring.description',
    },
  ]

  return (
    <SectionWrapper id="features" className="py-16 px-6 text-center">
      {/* Section header */}
      <div className="max-w-5xl mx-auto">
        <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
          {t('labels.features')}
        </span>
        <h2 className="font-display text-3xl lg:text-4xl font-semibold text-zinc-900 mt-3">
          An Unfair <span className="text-gradient-primary">Advantage</span> for Your Career
        </h2>
        <p className="text-base text-zinc-500 max-w-[600px] mx-auto mt-3">
          {t('features.subtitle')}
        </p>

        {/* Feature cards grid */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="bg-zinc-50 rounded-xl overflow-hidden hover-lift transition-all border border-transparent hover:border-emerald-200"
            >
              {/* Placeholder image area */}
              <div className="w-full h-40 bg-zinc-100 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-zinc-400" />
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-emerald-600" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-zinc-900">
                    {t(feature.titleKey)}
                  </h3>
                </div>
                <p className="text-[15px] text-zinc-500">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
