import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { SectionWrapper } from './section-wrapper'

interface PainCardProps {
  target: number
  suffix: string
  label: string
  delay: number
}

function PainCard({ target, suffix, label, delay }: PainCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const value = useCountUp({ target, inView })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="flex-1 bg-red-50 border border-red-100 rounded-2xl p-8 text-center"
    >
      <div className="font-display text-5xl lg:text-6xl font-extrabold text-red-500">
        {value}
        {suffix}
      </div>
      <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{label}</p>
    </motion.div>
  )
}

export function ProblemSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper className="py-16 lg:py-20 px-6 bg-zinc-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl lg:text-5xl font-bold text-zinc-900 text-balance">
            {t('problem.headline')}
          </h2>
          <p className="mt-4 text-lg text-zinc-500">{t('problem.subheading')}</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-5">
          <PainCard target={85} suffix="%" label={t('problem.pain1')} delay={0} />
          <PainCard target={6} suffix="h" label={t('problem.pain2')} delay={0.15} />
          <PainCard target={72} suffix="%" label={t('problem.pain3')} delay={0.3} />
        </div>
      </div>
    </SectionWrapper>
  )
}
