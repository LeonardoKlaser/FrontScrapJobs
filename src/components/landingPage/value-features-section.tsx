import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Radar, Target, FileText, type LucideIcon } from 'lucide-react'
import { RadarNotifications } from './ui-snippets/radar-notifications'
import { AtsAnalysisCard } from './ui-snippets/ats-analysis-card'
import { PdfPreviewCard } from './ui-snippets/pdf-preview-card'

interface FeatureRow {
  Icon: LucideIcon
  titleKey: string
  descKey: string
  mockup: ReactNode
}

const FEATURES: FeatureRow[] = [
  {
    Icon: Radar,
    titleKey: 'valueFeatures.radar.title',
    descKey: 'valueFeatures.radar.description',
    mockup: <RadarNotifications compact />
  },
  {
    Icon: Target,
    titleKey: 'valueFeatures.ats.title',
    descKey: 'valueFeatures.ats.description',
    mockup: <AtsAnalysisCard compact />
  },
  {
    Icon: FileText,
    titleKey: 'valueFeatures.pdf.title',
    descKey: 'valueFeatures.pdf.description',
    mockup: <PdfPreviewCard compact />
  }
]

export function ValueFeaturesSection() {
  const { t } = useTranslation('landing')

  return (
    <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl lg:text-5xl font-bold text-zinc-900 text-balance">
            {t('valueFeatures.heading')}
          </h2>
          <p className="mt-4 text-lg text-zinc-500">{t('valueFeatures.subheading')}</p>
        </motion.div>

        <div className="space-y-6">
          {FEATURES.map(({ Icon, titleKey, descKey, mockup }, index) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              className="flex flex-col md:flex-row gap-6 items-center p-6 lg:p-8 bg-zinc-50/50 border border-zinc-200/50 rounded-2xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center"
              >
                <Icon className="w-7 h-7 text-emerald-500" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.15 }}
                className="flex-1 text-center md:text-left"
              >
                <h3 className="font-display text-xl lg:text-2xl font-bold text-zinc-900">
                  {t(titleKey)}
                </h3>
                <p className="mt-2 text-zinc-600 leading-relaxed">{t(descKey)}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className="hidden md:block flex-shrink-0 w-56 h-32 overflow-hidden rounded-xl bg-white border border-zinc-200/70"
              >
                {mockup}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
