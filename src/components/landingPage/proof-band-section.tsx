import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'framer-motion'
import { usePublicStats, usePublicSiteLogos } from '@/hooks/usePublicStats'
import { useCountUp } from '@/hooks/useCountUp'

export function ProofBandSection() {
  const { t, i18n } = useTranslation('landing')
  const { data: stats } = usePublicStats()
  const { data: logos } = usePublicSiteLogos()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const sites = useCountUp({ target: stats?.monitored_sites ?? 0, inView })
  const jobs = useCountUp({ target: stats?.total_jobs ?? 0, inView })

  const hasStats = !!stats && (stats.monitored_sites > 0 || stats.total_jobs > 0)
  const hasLogos = !!logos && logos.length > 0
  if (!hasStats && !hasLogos) return null

  const fmt = (n: number) => new Intl.NumberFormat(i18n.language).format(n)

  const duplicatedLogos =
    logos && logos.length < 3
      ? [...logos, ...logos, ...logos, ...logos]
      : [...(logos ?? []), ...(logos ?? [])]

  return (
    <section ref={ref} className="border-y border-zinc-100 bg-zinc-50 px-6 py-8 text-center">
      <p className="text-sm text-zinc-500">{t('proofBand.title')}</p>

      {hasLogos && (
        <div
          className="my-6 overflow-hidden
            [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          <div
            className="flex w-max animate-logo-scroll items-center gap-10
              hover:[animation-play-state:paused]"
          >
            {duplicatedLogos.map((logo, index) => (
              <img
                key={`${logo.site_name}-${index}`}
                src={logo.logo_url}
                alt={logo.site_name}
                className="h-7 w-auto object-contain opacity-70 transition-opacity
                  hover:opacity-100"
              />
            ))}
          </div>
        </div>
      )}

      {hasStats && (
        <p className="text-zinc-900">
          <span className="font-semibold text-emerald-600">{fmt(sites)}</span>{' '}
          <span>{t('proofBand.sites')}</span> ·{' '}
          <span className="font-semibold text-emerald-600">{fmt(jobs)}</span>{' '}
          <span>{t('proofBand.jobs')}</span>
        </p>
      )}
    </section>
  )
}
