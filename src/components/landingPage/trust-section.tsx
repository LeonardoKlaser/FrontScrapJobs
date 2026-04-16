import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { usePublicStats } from '@/hooks/usePublicStats'

const COMPANY_LOGOS = [
  'Nubank',
  'Stone',
  'iFood',
  'Mercado Livre',
  'Magazine Luiza',
  'Americanas',
  'Itau',
  'Bradesco'
]

interface StatProps {
  target: number
  suffix?: string
  label: string
}

function Stat({ target, suffix = '+', label }: StatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const value = useCountUp({ target, inView })

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl lg:text-5xl font-extrabold text-emerald-500">
        {value.toLocaleString('pt-BR')}
        {suffix}
      </div>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  )
}

export function TrustSection() {
  const { t } = useTranslation('landing')
  const { data: stats } = usePublicStats()

  const sitesMonitored = stats?.monitored_sites ?? 150
  const jobsCollected = stats?.total_jobs ?? 50000
  const activeUsers = 2000

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 bg-zinc-950 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-8"
        >
          {t('trust.overline')}
        </motion.p>

        <div className="relative overflow-hidden mb-16">
          <div className="flex gap-12 animate-logo-scroll whitespace-nowrap">
            {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((logo, i) => (
              <span
                key={`${logo}-${i}`}
                className="text-zinc-600 font-semibold text-lg flex-shrink-0"
              >
                {logo}
              </span>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-zinc-800"
        >
          <Stat target={sitesMonitored} label={t('trust.statSites')} />
          <Stat target={jobsCollected} label={t('trust.statJobs')} />
          <Stat target={activeUsers} label={t('trust.statUsers')} />
        </motion.div>
      </div>
    </section>
  )
}
