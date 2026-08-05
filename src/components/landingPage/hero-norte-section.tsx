import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { PATHS } from '@/router/paths'
import { trackLanding } from '@/lib/analytics'
import { usePublicRecentJobs } from '@/hooks/usePublicRecentJobs'
import { NorteChat, type NorteMessage } from './ui-snippets/norte-chat'
import { LiveJobsPanel, type PanelState } from './ui-snippets/live-jobs-panel'
import { FALLBACK_JOBS } from './ui-snippets/live-jobs-helpers'
import { HERO_AREAS, type HeroAreaId } from './hero-areas'
import { LANDING_CTA_CLASS } from './landing-cta'
import { WhatsAppCtaButton } from './whatsapp-cta-button'

export function HeroNorteSection() {
  const { t } = useTranslation('landing')
  const [area, setArea] = useState<HeroAreaId>('all')
  const { data, isPending, isError } = usePublicRecentJobs(area)

  const jobs = data?.jobs ?? []
  const areaLabel = t(HERO_AREAS.find((a) => a.id === area)?.labelKey ?? 'hero.areas.all')

  // Lista vazia sem filtro aplicado não é "área sem resultado": é falha de
  // coleta, e não há filtro pra limpar. Cai no exemplo rotulado.
  let panelState: PanelState = 'live'
  if (isPending) panelState = 'loading'
  else if (isError) panelState = 'fallback'
  else if (jobs.length === 0) panelState = area === 'all' ? 'fallback' : 'empty'

  const panelJobs = panelState === 'fallback' ? FALLBACK_JOBS : jobs

  const handleArea = (next: HeroAreaId) => {
    setArea(next)
    trackLanding('lp_hero_area', { area: next })
  }

  const messages: NorteMessage[] = [
    {
      from: 'norte',
      text:
        panelState === 'live'
          ? t('hero.chatDigest', { count: jobs.length })
          : t('hero.chatDigestGeneric')
    }
  ]

  return (
    <section className="bg-background px-6 pt-24 pb-16 sm:px-8 lg:pb-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span
            className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold
              uppercase tracking-[0.15em] text-emerald-600"
          >
            {t('hero.eyebrow')}
          </span>
          <h1
            className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight
              text-foreground sm:text-5xl"
          >
            {t('hero.headingLead')}{' '}
            <span className="text-gradient-primary">{t('hero.headingHighlight')}</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {t('hero.subheading')}
          </p>

          <div className="mt-6">
            <p id="hero-areas-label" className="text-sm font-medium text-muted-foreground">
              {t('hero.areasLabel')}
            </p>
            <ul aria-labelledby="hero-areas-label" className="mt-2 flex flex-wrap gap-2">
              {HERO_AREAS.map(({ id, labelKey }) => (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={area === id}
                    onClick={() => handleArea(id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors
                      ${
                        area === id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-primary'
                      }`}
                  >
                    {t(labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <WhatsAppCtaButton
              section="hero"
              variant="glow"
              size="lg"
              className={`w-full sm:w-auto ${LANDING_CTA_CLASS}`}
            >
              {t('hero.cta')}
              <ArrowRight className="ml-1 h-5 w-5" />
            </WhatsAppCtaButton>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t('hero.microcopy')}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('hero.loginPrompt')}{' '}
              <Link to={PATHS.login} className="font-medium text-primary hover:underline">
                {t('hero.loginLink')}
              </Link>
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md sm:pb-10">
          <LiveJobsPanel
            state={panelState}
            jobs={panelJobs}
            todayCount={data?.today_count ?? 0}
            areaLabel={areaLabel}
            onClearFilter={() => handleArea('all')}
          />
          {/* Em mobile a bolha entra no fluxo: absolute com deslocamento
              negativo estoura a largura da viewport (e2e trava isso em 390px). */}
          <div className="mt-4 w-full sm:absolute sm:-bottom-2 sm:-left-6 sm:mt-0 sm:w-64">
            <NorteChat messages={messages} headerSubtitle={t('hero.chatSubtitle')} />
          </div>
        </div>
      </div>
    </section>
  )
}
