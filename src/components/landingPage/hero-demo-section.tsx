import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePublicStats } from '@/hooks/usePublicStats'
import { usePublicJobs } from '@/hooks/usePublicJobs'
import { AREAS, DEFAULT_AREA, type Area } from './areas'
import { JobCard } from './ui-snippets/job-card'
import { HeroToastNotifications } from './ui-snippets/hero-toast-notifications'
import { LANDING_CTA_CLASS, scrollToPricing } from './landing-cta'
import { trackLanding } from '@/lib/analytics'
import { PATHS } from '@/router/paths'

// Altura minima compartilhada pelos 3 estados (skeleton/grid/fallback) pra CLS~0.
// Dimensionada pra caber o grid real (mobile: 3 cards/1 col = 3 linhas; sm+: 4
// cards/2 cols = 2 linhas) sem deixar um vao grande ate o CTA abaixo.
const DEMO_MIN_H = 'min-h-[224px] sm:min-h-[152px]'

// Mobile (<sm) mostra no maximo 3 cards (o 3o borrado); a partir de sm o grid
// vira 2 colunas e mostra 4 (o 4o borrado). Spec 3.2 — evita empurrar o CTA pra
// baixo da dobra no celular. Default 4 quando matchMedia nao existe (jsdom/SSR).
const SM_QUERY = '(min-width: 640px)'

function useCardCap() {
  const read = () =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(SM_QUERY).matches
        ? 4
        : 3
      : 4
  const [cap, setCap] = useState(read)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(SM_QUERY)
    const onChange = () => setCap(mql.matches ? 4 : 3)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return cap
}

export function HeroDemoSection() {
  const { t } = useTranslation('landing')
  const [area, setArea] = useState<Area>(DEFAULT_AREA)
  const { data: stats } = usePublicStats()
  const { data, isError, isLoading } = usePublicJobs(area)
  const cap = useCardCap()

  const monitored = stats?.monitored_sites ?? 0
  const eyebrow =
    monitored >= 30 ? t('hero.eyebrow', { sites: monitored }) : t('hero.eyebrowFallback')

  const jobs = data?.jobs ?? []
  const showFallback = isError
  const areaLabel = t(AREAS.find((a) => a.value === area)?.labelKey ?? '')

  const onChip = (value: Area) => {
    setArea(value)
    trackLanding('lp_area_chip', { area: value })
  }

  const onCta = () => {
    trackLanding('lp_cta_click', { section: 'hero' })
    scrollToPricing()
  }

  return (
    <section className="bg-white px-6 pt-24 pb-16 sm:px-8 lg:pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
          {eyebrow}
        </span>

        <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
          {t('hero.heading1')} <span className="text-gradient-primary">{t('hero.heading2')}</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-zinc-500">
          {t('hero.subheading')}
        </p>

        {!showFallback && (
          <div className="mt-8 flex flex-wrap justify-center gap-2" role="group">
            {AREAS.map((a) => (
              <button
                key={a.value}
                type="button"
                aria-pressed={a.value === area}
                onClick={() => onChip(a.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  a.value === area
                    ? 'bg-emerald-500 text-white'
                    : 'border border-zinc-300 bg-white text-zinc-600 hover:border-emerald-400'
                }`}
              >
                {t(a.labelKey)}
              </button>
            ))}
          </div>
        )}

        <div className={`mt-6 ${DEMO_MIN_H}`}>
          {showFallback ? (
            // neutraliza as margens de coluna-direita do toast (lg:mr-[200px])
            // pra centralizar no layout demo-first
            <div className="flex justify-center [&>*]:!mx-0">
              <HeroToastNotifications />
            </div>
          ) : isLoading ? (
            <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: cap }).map((_, i) => (
                <div key={i} className="h-[68px] animate-shimmer rounded-lg bg-zinc-100" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="py-12 text-zinc-500">{t('hero.emptyArea', { area: areaLabel })}</p>
          ) : (
            <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {jobs.slice(0, cap).map((job, i) => (
                <JobCard
                  key={`${job.company}-${job.title}-${i}`}
                  job={job}
                  blurred={jobs.length >= 2 && i === Math.min(jobs.length, cap) - 1}
                />
              ))}
            </div>
          )}
        </div>

        {!showFallback && (data?.today_count ?? 0) >= 3 && (
          <p className="mt-4 text-sm font-semibold text-emerald-600">
            {t('hero.todayCount', { count: data?.today_count })}
          </p>
        )}

        <div className="mt-6">
          <Button
            variant="glow"
            size="lg"
            className={`w-full sm:w-auto ${LANDING_CTA_CLASS}`}
            onClick={onCta}
          >
            {t('hero.cta')}
            <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {t('hero.microcopy')}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {t('hero.loginPrompt')}{' '}
            <Link to={PATHS.login} className="font-medium text-primary hover:underline">
              {t('hero.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
