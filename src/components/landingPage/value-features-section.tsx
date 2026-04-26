import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { SectionWrapper } from './section-wrapper'
import { RadarNotifications } from './ui-snippets/radar-notifications'
import { AtsAnalysisCard } from './ui-snippets/ats-analysis-card'
import { PdfPreviewCard } from './ui-snippets/pdf-preview-card'

interface FeatureBlockProps {
  overline: string
  headline: string
  headlineGradient: string
  body: React.ReactNode
  snippet: React.ReactNode
  reverse?: boolean
}

function FeatureBlock({
  overline,
  headline,
  headlineGradient,
  body,
  snippet,
  reverse
}: FeatureBlockProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}
    >
      {/* Text side */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className={reverse ? 'lg:[direction:ltr]' : ''}
      >
        <span className="font-mono text-xs tracking-[0.15em] uppercase text-emerald-500 font-semibold">
          {overline}
        </span>
        <h3 className="font-display text-3xl lg:text-5xl font-extrabold text-zinc-900 leading-[1.1] mt-3">
          {headline}
          <br />
          <span className="text-gradient-primary">{headlineGradient}</span>
        </h3>
        <div className="mt-4 space-y-3">{body}</div>
      </motion.div>

      {/* UI snippet side */}
      <div className={`max-w-sm mx-auto lg:max-w-none ${reverse ? 'lg:[direction:ltr]' : ''}`}>
        {snippet}
      </div>
    </div>
  )
}

export function ValueFeaturesSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper id="features">
      <div className="py-20 lg:py-28 px-6">
        <div className="max-w-6xl mx-auto space-y-20 lg:space-y-28">
          {/* Block 1: O Radar — Text LEFT, UI RIGHT */}
          <FeatureBlock
            overline={t('valueFeatures.radar.overline')}
            headline={t('valueFeatures.radar.headline')}
            headlineGradient={t('valueFeatures.radar.headlineGradient')}
            body={
              <>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.radar.body1')}
                </p>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.radar.body2')}{' '}
                  <span className="text-zinc-900 font-semibold">
                    {t('valueFeatures.radar.body2Bold')}
                  </span>{' '}
                  {t('valueFeatures.radar.body2End')}
                </p>
              </>
            }
            snippet={<RadarNotifications />}
          />

          {/* Block 2: A Análise ATS — UI LEFT, Text RIGHT */}
          <FeatureBlock
            reverse
            overline={t('valueFeatures.ats.overline')}
            headline={t('valueFeatures.ats.headline')}
            headlineGradient={t('valueFeatures.ats.headlineGradient')}
            body={
              <>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.ats.body1')}
                </p>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.ats.body2')}{' '}
                  <span className="text-zinc-900 font-semibold">
                    {t('valueFeatures.ats.body2Bold')}
                  </span>
                </p>
              </>
            }
            snippet={<AtsAnalysisCard />}
          />

          {/* Block 3: A Vantagem Injusta — Text LEFT, UI RIGHT */}
          <FeatureBlock
            overline={t('valueFeatures.pdf.overline')}
            headline={t('valueFeatures.pdf.headline')}
            headlineGradient={t('valueFeatures.pdf.headlineGradient')}
            body={
              <>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.pdf.body1')}
                </p>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.pdf.body2')}{' '}
                  <span className="text-zinc-900 font-semibold">
                    {t('valueFeatures.pdf.body2Bold')}
                  </span>
                </p>
              </>
            }
            snippet={<PdfPreviewCard />}
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
