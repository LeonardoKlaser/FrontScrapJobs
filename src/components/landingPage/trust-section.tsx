import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { usePublicStats, usePublicSiteLogos } from '@/hooks/usePublicStats'

interface StatProps {
  target: number
  suffix?: string
  label: string
}

function Stat({ target, suffix = '+', label }: StatProps) {
  const { i18n } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const value = useCountUp({ target, inView })

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl lg:text-5xl font-extrabold text-emerald-500">
        {value.toLocaleString(i18n.language)}
        {suffix}
      </div>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 lg:h-14 w-32 bg-zinc-800 rounded animate-pulse" />
      <div className="mx-auto mt-3 h-4 w-28 bg-zinc-800 rounded animate-pulse" />
    </div>
  )
}

export function TrustSection() {
  const { t } = useTranslation('landing')
  const { data: stats, isLoading: statsLoading, isError: statsError } = usePublicStats()
  const { data: siteLogos } = usePublicSiteLogos()

  const hasLogos = siteLogos && siteLogos.length > 0

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

        {hasLogos && (
          <div className="relative overflow-hidden mb-16">
            <div className="flex gap-12 animate-logo-scroll whitespace-nowrap items-center">
              {[...siteLogos, ...siteLogos].map((logo, i) => (
                <img
                  key={`${logo.site_name}-${i}`}
                  src={logo.logo_url}
                  alt={logo.site_name}
                  loading="lazy"
                  className="h-8 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${hasLogos ? 'pt-10 border-t border-zinc-800' : ''}`}
        >
          {statsLoading && (
            <>
              <StatSkeleton />
              <StatSkeleton />
            </>
          )}
          {statsError && (
            <p className="sm:col-span-2 text-center text-sm text-zinc-500">
              {t('trust.statsError')}
            </p>
          )}
          {stats && (
            <>
              <Stat target={stats.monitored_sites} label={t('trust.statSites')} />
              <Stat target={stats.total_jobs} label={t('trust.statJobs')} />
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
