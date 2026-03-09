import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight } from 'lucide-react'
import { usePublicStats } from '@/hooks/usePublicStats'

export function HeroSection() {
  const { t } = useTranslation('landing')
  const { data: stats } = usePublicStats()
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Radial emerald gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />

      {/* Subtle grid overlay — dark lines on light bg, light lines on dark bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo */}
          <div
            className="flex items-center justify-center mb-12 animate-fade-in-up"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">{t('hero.brand')}</span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-2xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight animate-fade-in-up text-balance"
            style={{ animationDelay: '100ms' }}
          >
            <span className="text-foreground">{t('hero.heading1')}</span>
            <br />
            <span className="text-gradient-primary">{t('hero.heading2')}</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up text-pretty"
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
            <p className="text-sm text-muted-foreground mt-4">
              {t('hero.loginPrompt')}{' '}
              <a href="/login" className="text-primary hover:underline font-medium">
                {t('hero.loginLink')}
              </a>
            </p>
          </div>

          {/* Public Stats */}
          {stats && (
            <div
              className="flex items-center justify-center gap-6 sm:gap-10 animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
            >
              <div className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  +{stats.monitored_sites.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('hero.statsSites')}</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  +{stats.total_jobs.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('hero.statsJobs')}</p>
              </div>
            </div>
          )}

          {/* Decorative dots */}
          <div className="mt-16 relative animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-center space-x-4 sm:space-x-8 opacity-40">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary/60 rounded-full animate-pulse delay-200" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse delay-300" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-muted-foreground rounded-full animate-pulse delay-400" />
            </div>
            <div className="flex items-center justify-center space-x-6 sm:space-x-12 mt-4 opacity-25">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-500" />
              <div className="w-3 h-3 bg-primary/50 rounded-full animate-pulse delay-600" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
