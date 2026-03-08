import { useTranslation } from 'react-i18next'
import emailAnaliseImg from '@/assets/ScrapJobs_email_analise.png'

export function ProductVisualizationSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="py-20 sm:py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight text-balance">
              {t('productVisualization.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              {t('productVisualization.description')}
            </p>
          </div>

          {/* Real Email Analysis Screenshot */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <img
              src={emailAnaliseImg}
              alt={t('productVisualization.emailAlt')}
              loading="lazy"
              className="max-w-full rounded-2xl border border-white/10 shadow-2xl shadow-emerald-500/20 overflow-hidden"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
