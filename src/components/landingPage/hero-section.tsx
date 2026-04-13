import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'
import dashboardImg from '@/assets/ScrapJobs Dashboard.png'

export function HeroSection() {
  const { t } = useTranslation('landing')
  return (
    <SectionWrapper className="py-16 lg:py-24 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column — Text */}
          <div className="space-y-8 text-center md:text-left">
            {/* Headline */}
            <h1
              className="text-3xl min-[400px]:text-4xl lg:text-[56px] font-semibold leading-tight tracking-tight animate-fade-in-up text-balance text-zinc-900"
              style={{ animationDelay: '0ms' }}
            >
              {t('hero.heading1')}
              <br />
              <span className="text-gradient-primary">{t('hero.heading2')}</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg text-zinc-500 leading-relaxed animate-fade-in-up text-pretty max-w-[480px] mx-auto md:mx-0"
              style={{ animationDelay: '100ms' }}
            >
              {t('hero.subheading')}
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Button
                variant="glow"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-lg hover:scale-105 transition-transform duration-200 animate-pulse-glow"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>

              {/* Micro-copy */}
              <p className="flex items-center justify-center md:justify-start gap-2 text-sm text-zinc-500 mt-4">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t('hero.microcopy')}
              </p>

              <p className="text-sm text-zinc-500 mt-3 text-center md:text-left">
                {t('hero.loginPrompt')}{' '}
                <a href="/login" className="text-primary hover:underline font-medium">
                  {t('hero.loginLink')}
                </a>
              </p>
            </div>
          </div>

          {/* Right column — Dashboard Image */}
          <div
            className="mt-12 md:mt-0 animate-fade-in-up max-w-sm sm:max-w-full mx-auto"
            style={{ animationDelay: '300ms' }}
          >
            <img
              src={dashboardImg}
              alt={t('hero.dashboardAlt')}
              loading="eager"
              className="max-w-full rounded-xl rotate-[-2deg] shadow-lg shadow-emerald-500/10 border border-zinc-200/50"
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
