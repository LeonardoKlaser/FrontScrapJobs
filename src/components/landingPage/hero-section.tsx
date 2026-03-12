import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/common/logo'
import dashboardImg from '@/assets/ScrapJobs Dashboard.png'

export function HeroSection() {
  const { t } = useTranslation('landing')
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 sm:px-8 overflow-hidden">
      {/* Radial emerald gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />

      {/* Subtle grid overlay — dark lines on light bg, light lines on dark bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left column — Text */}
          <div className="space-y-8 text-center md:text-left">
            {/* Logo */}
            <div
              className="mb-4 animate-fade-in-up flex justify-center md:justify-start"
              style={{ animationDelay: '0ms' }}
            >
              <Logo size={32} showText textClassName="text-2xl" />
            </div>

            {/* Headline */}
            <h1
              className="text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight animate-fade-in-up text-balance"
              style={{ animationDelay: '100ms' }}
            >
              <span className="text-foreground">{t('hero.heading1')}</span>
              <br />
              <span className="text-gradient-primary">{t('hero.heading2')}</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed animate-fade-in-up text-pretty"
              style={{ animationDelay: '200ms' }}
            >
              {t('hero.subheading')}
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <a href="#pricing">
                <Button
                  variant="glow"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-lg hover:scale-105 transition-transform duration-200 animate-pulse-glow"
                >
                  {t('hero.cta')}
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </a>

              {/* Micro-copy */}
              <p className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mt-4">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t('hero.microcopy')}
              </p>

              <p className="text-sm text-muted-foreground mt-3 text-center md:text-left">
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
            style={{ animationDelay: '400ms' }}
          >
            <img
              src={dashboardImg}
              alt={t('hero.dashboardAlt')}
              loading="eager"
              className="max-w-full rounded-2xl border border-white/10 shadow-2xl shadow-emerald-500/20 overflow-hidden"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
