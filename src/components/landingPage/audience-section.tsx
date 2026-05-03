import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { SectionWrapper } from './section-wrapper'

export function AudienceSection() {
  const { t } = useTranslation('landing')
  const forItems = t('audience.forItems', { returnObjects: true }) as string[]
  const notForItems = t('audience.notForItems', {
    returnObjects: true
  }) as string[]

  return (
    <SectionWrapper className="py-16 lg:py-20 px-6" id="audience">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="font-mono text-xs tracking-[0.15em] uppercase
            text-emerald-500 font-semibold">
            {t('audience.eyebrow')}
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold
            text-zinc-900 mt-3">
            {t('audience.title')}
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            {t('audience.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl border border-zinc-200 p-6
              shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex
                items-center justify-center">
                <span className="text-emerald-600 text-sm font-bold">
                  ✓
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                {t('audience.forTitle')}
              </h3>
            </div>
            <ul className="space-y-3">
              {forItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1 text-sm">●</span>
                  <span className="text-sm text-zinc-700 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl border border-zinc-200 p-6
              shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex
                items-center justify-center">
                <span className="text-red-600 text-sm font-bold">✗</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                {t('audience.notForTitle')}
              </h3>
            </div>
            <ul className="space-y-3">
              {notForItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1 text-sm">●</span>
                  <span className="text-sm text-zinc-700 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <p className="text-center mt-6 text-xs text-zinc-400">
          {t('audience.note')}
        </p>
      </div>
    </SectionWrapper>
  )
}
