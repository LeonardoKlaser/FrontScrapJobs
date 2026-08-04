import { useTranslation } from 'react-i18next'
import { usePublicStats, usePublicSiteLogos } from '@/hooks/usePublicStats'
import { useCountUp } from '@/hooks/useCountUp'
import { useInViewOnce } from '@/hooks/useInViewOnce'

// Segundos que cada logo leva para atravessar — a duração total escala com a
// quantidade de logos, mantendo a velocidade percebida constante (~40px/s)
const SECONDS_PER_LOGO = 3.5

export function ProofBandSection() {
  const { t, i18n } = useTranslation('landing')
  const { data: stats } = usePublicStats()
  const { data: logos } = usePublicSiteLogos()
  const [ref, inView] = useInViewOnce<HTMLElement>()

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
    <section ref={ref} className="border-y border-border bg-muted px-6 py-12 text-center">
      {hasLogos && (
        <div
          className="mb-8 overflow-hidden py-2
            [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          <div
            className="flex w-max animate-logo-scroll items-center gap-12
              hover:[animation-play-state:paused]"
            style={{
              animationDuration: `${(duplicatedLogos.length / 2) * SECONDS_PER_LOGO}s`
            }}
          >
            {duplicatedLogos.map((logo, index) => {
              const isVisualDuplicate = index >= (logos?.length ?? 0)

              return (
                <img
                  key={`${logo.site_name}-${index}`}
                  src={logo.logo_url}
                  alt={isVisualDuplicate ? '' : logo.site_name}
                  aria-hidden={isVisualDuplicate}
                  className="h-9 w-auto object-contain opacity-70 transition-opacity
                    hover:opacity-100 mix-blend-multiply [filter:grayscale(1)]
                    dark:mix-blend-screen
                    dark:[filter:grayscale(1)_invert(1)_brightness(1.5)]"
                />
              )
            })}
          </div>
        </div>
      )}

      {hasStats && (
        <p className="text-foreground">
          <span className="font-semibold text-emerald-600">{fmt(sites)}</span>{' '}
          <span>{t('proofBand.sites')}</span> ·{' '}
          <span className="font-semibold text-emerald-600">{fmt(jobs)}</span>{' '}
          <span>{t('proofBand.jobs')}</span>
        </p>
      )}
    </section>
  )
}
