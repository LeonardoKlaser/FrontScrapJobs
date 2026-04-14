import { useTranslation } from 'react-i18next'
import { Target, Filter, Sparkles } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'

export function HowItWorksSection() {
  const { t } = useTranslation('landing')

  const steps = [
    {
      icon: Target,
      titleKey: 'howItWorks.step1.title',
      descriptionKey: 'howItWorks.step1.description'
    },
    {
      icon: Filter,
      titleKey: 'howItWorks.step2.title',
      descriptionKey: 'howItWorks.step2.description'
    },
    {
      icon: Sparkles,
      titleKey: 'howItWorks.step3.title',
      descriptionKey: 'howItWorks.step3.description'
    }
  ]

  return (
    <SectionWrapper id="howItWorks">
      <div className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
              {t('labels.howItWorks')}
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-zinc-900 mb-6 mt-3 tracking-tight text-balance">
              {t('howItWorks.title')}
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.titleKey} className="contents">
                <div
                  className="bg-white border border-zinc-200/50 rounded-xl p-8 text-center space-y-4 flex-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold mx-auto">
                    {index + 1}
                  </span>
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">{t(step.titleKey)}</h3>
                  <p className="text-zinc-500 leading-relaxed text-pretty">
                    {t(step.descriptionKey)}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex items-center">
                    <div className="w-8 border-t-2 border-dashed border-emerald-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
