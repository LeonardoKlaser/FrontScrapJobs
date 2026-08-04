import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { PATHS } from '@/router/paths'
import { NorteChat, type NorteMessage } from './ui-snippets/norte-chat'
import { LANDING_CTA_CLASS } from './landing-cta'
import { WhatsAppCtaButton } from './whatsapp-cta-button'

const AREA_KEYS = [
  'hero.areas.technology',
  'hero.areas.marketing',
  'hero.areas.sales',
  'hero.areas.hr',
  'hero.areas.finance',
  'hero.areas.design',
  'hero.areas.data'
] as const

export function HeroNorteSection() {
  const { t } = useTranslation('landing')

  const messages: NorteMessage[] = [{ from: 'norte', text: t('hero.chatDigest') }]

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
            <p className="text-sm font-medium text-muted-foreground">{t('hero.areasLabel')}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {AREA_KEYS.map((key) => (
                <li
                  key={key}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs
                    font-medium text-muted-foreground"
                >
                  {t(key)}
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

        <div className="mx-auto w-full max-w-sm">
          <NorteChat messages={messages} headerSubtitle={t('hero.chatSubtitle')} />
        </div>
      </div>
    </section>
  )
}
