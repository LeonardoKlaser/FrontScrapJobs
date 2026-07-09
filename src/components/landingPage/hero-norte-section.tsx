import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/router/paths'
import { trackLanding } from '@/lib/analytics'
import { NorteChat, type NorteMessage } from './ui-snippets/norte-chat'
import { LANDING_CTA_CLASS, scrollToPricing } from './landing-cta'

const AREA_KEYS = [
  'hero.areas.dev',
  'hero.areas.produto',
  'hero.areas.design',
  'hero.areas.dados',
  'hero.areas.infra'
] as const

export function HeroNorteSection() {
  const { t } = useTranslation('landing')

  const messages: NorteMessage[] = [
    { from: 'norte', text: 'Oi, Erick! 👋 Achei 3 vagas novas de Backend hoje.' },
    {
      from: 'norte',
      text: (
        <>
          A do <strong>Nubank</strong> deu <strong>🎯 92% match</strong> com seu CV. Quer a análise?
        </>
      )
    },
    { from: 'user', text: 'quero' },
    {
      from: 'norte',
      text: '✅ Já tem: Go, Postgres, K8s\n⚠️ Falta: pagamentos\nTe mando o CV ajustado?'
    },
    { from: 'user', text: 'manda 🙌' },
    { from: 'norte', text: 'Prontinho!', pdf: 'CV_Nubank.pdf' }
  ]

  const onCta = () => {
    trackLanding('lp_cta_click', { section: 'hero' })
    scrollToPricing()
  }

  return (
    <section className="bg-white px-6 pt-24 pb-16 sm:px-8 lg:pb-20">
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
              text-zinc-900 sm:text-5xl"
          >
            {t('hero.heading1')} <span className="text-gradient-primary">{t('hero.heading2')}</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-zinc-500">
            {t('hero.subheading')}
          </p>

          <div className="mt-6 flex flex-wrap gap-2" aria-hidden>
            {AREA_KEYS.map((key) => (
              <span
                key={key}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs
                  font-medium text-zinc-500"
              >
                {t(key)}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <Button
              variant="glow"
              size="lg"
              className={`w-full sm:w-auto ${LANDING_CTA_CLASS}`}
              onClick={onCta}
            >
              {t('hero.cta')}
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
            <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
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

        <div className="mx-auto w-full max-w-sm">
          <NorteChat messages={messages} />
        </div>
      </div>
    </section>
  )
}
