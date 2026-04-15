import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { SectionWrapper } from './section-wrapper'

function CountUp({ target, duration = 2 }: { target: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState('0')

  const isPercentage = target.endsWith('%')
  const isHours = target.endsWith('h')
  const numericValue = parseFloat(target)

  useEffect(() => {
    if (!isInView) return
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      const current = numericValue * eased

      if (isPercentage) {
        setDisplay(`${Math.round(current)}%`)
      } else if (isHours) {
        setDisplay(`${current.toFixed(1)}h`)
      } else {
        setDisplay(`${Math.round(current)}`)
      }

      if (elapsed < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, numericValue, duration, isPercentage, isHours])

  return <span ref={ref}>{display}</span>
}

export function ProblemSection() {
  const { t } = useTranslation('landing')

  const stats = [
    { value: t('problemSection.stat1Value'), label: t('problemSection.stat1Label'), ariaLabel: '4.7 horas perdidas por semana' },
    { value: t('problemSection.stat2Value'), label: t('problemSection.stat2Label'), ariaLabel: '75 por cento dos CVs eliminados' },
    { value: t('problemSection.stat3Value'), label: t('problemSection.stat3Label'), ariaLabel: '3 horas para uma vaga lotar' },
  ]

  return (
    <SectionWrapper>
      <div className="py-16 px-6 lg:py-24 lg:px-8 flex items-center relative">
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-[15%] bottom-[15%] w-1 rounded-r-sm hidden lg:block"
          style={{ background: 'linear-gradient(180deg, #10b981, #06b6d4)' }}
        />

        <div className="max-w-3xl mx-auto lg:mx-0 lg:ml-16">
          {/* Overline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-xs tracking-[0.15em] uppercase text-emerald-500 mb-6"
          >
            {t('problemSection.overline')}
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-display font-extrabold leading-[1.15] mb-6"
          >
            <span className="text-2xl lg:text-[2.75rem] text-zinc-900 block">
              {t('problemSection.headline1')}
            </span>
            <span className="text-2xl lg:text-[2.75rem] text-zinc-500 block">
              {t('problemSection.headline2')}
            </span>
            <span className="text-xl lg:text-[2rem] text-zinc-400 block">
              {t('problemSection.headline3')}
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-zinc-500 text-[0.95rem] leading-[1.7] max-w-lg"
          >
            {t('problemSection.subtext')}{' '}
            <span className="text-zinc-900 font-semibold">{t('problemSection.subtextBold')}</span>
          </motion.p>

          {/* Stats in mini-cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                aria-label={stat.ariaLabel}
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center"
              >
                <span className="text-zinc-900 font-display font-extrabold text-2xl block">
                  <CountUp target={stat.value} />
                </span>
                <p className="text-zinc-400 text-[0.55rem] mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Transition Line */}
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-emerald-500 font-display font-semibold text-lg mt-8"
          >
            {t('problemSection.transition')}
          </motion.p>
        </div>
      </div>
    </SectionWrapper>
  )
}
