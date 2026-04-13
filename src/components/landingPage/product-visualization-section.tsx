import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import emailAnaliseImg from '@/assets/ScrapJobs_email_analise.png'
import { SectionWrapper } from './section-wrapper'

export function ProductVisualizationSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper className="py-16 px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        {/* Text Content */}
        <div className="space-y-6">
          <div>
            <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
              {t('labels.productVisualization')}
            </span>
            <h2 className="font-display text-2xl lg:text-4xl font-semibold text-zinc-900 mt-3">
              {t('productVisualization.title')}
            </h2>
            <p className="text-base text-zinc-500 mt-4">
              {t('productVisualization.description')}
            </p>
          </div>

          {/* Bullet points */}
          <ul className="space-y-3">
            {(['bullet1', 'bullet2', 'bullet3'] as const).map((key) => (
              <li key={key} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                <span className="text-base text-zinc-500">
                  {t(`productVisualization.${key}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Image */}
        <div>
          <img
            src={emailAnaliseImg}
            alt={t('productVisualization.emailAlt')}
            loading="lazy"
            className="max-w-full rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-zinc-200/50"
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
