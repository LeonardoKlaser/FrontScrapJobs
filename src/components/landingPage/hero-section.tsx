import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'

export function HeroSection() {
  const { t } = useTranslation('landing')
  return (
    <SectionWrapper className="pt-20 lg:pt-12 pb-8 lg:pb-12 px-6 sm:px-8 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start">
          {/* Left column — Text */}
          <div className="lg:w-[420px] lg:shrink-0 space-y-8 text-center lg:text-left max-w-xl lg:max-w-none lg:pt-16">
            {/* Headline */}
            <h1 className="text-3xl min-[400px]:text-4xl lg:text-[56px] font-semibold leading-tight tracking-tight animate-fade-in-up text-balance text-zinc-900 [animation-delay:0ms]">
              {t('hero.heading1')}
              <br />
              <span className="text-gradient-primary">{t('hero.heading2')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-zinc-500 leading-relaxed animate-fade-in-up text-pretty max-w-[480px] mx-auto lg:mx-0 [animation-delay:100ms]">
              {t('hero.subheading')}
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up [animation-delay:200ms]">
              <Button
                variant="glow"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-lg animate-pulse-glow"
                onClick={() =>
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>

              {/* Micro-copy */}
              <p className="flex items-center justify-center lg:justify-start gap-2 text-sm text-zinc-500 mt-4">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t('hero.microcopy')}
              </p>

              <p className="text-sm text-zinc-500 mt-3 text-center lg:text-left">
                {t('hero.loginPrompt')}{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t('hero.loginLink')}
                </Link>
              </p>
            </div>
          </div>

          {/* Right column — Mockup Composition */}
          <div className="flex-1 min-w-0 w-full lg:w-auto mt-8 lg:mt-0">
            <div className="relative mx-auto max-w-[560px] lg:max-w-none lg:mr-[-180px] pt-8 lg:pt-16 pb-4 lg:pb-4">
              {/* Glow effect — large blurred emerald orb */}
              <div
                aria-hidden="true"
                className="absolute z-0 w-[700px] h-[700px] bg-emerald-400/10 rounded-full blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow-pulse pointer-events-none"
              />

              {/* Dashboard mockup — flat, clean, large */}
              <div className="relative animate-fade-in-up [animation-delay:300ms] scale-[1.1] origin-top-center lg:scale-[0.85] lg:origin-top-right">
                <img
                  src="/dashboard_mockup.png"
                  alt={t('hero.dashboardAlt')}
                  loading="eager"
                  className="w-full max-w-[1200px] border-0 outline-none"
                />
              </div>

              {/* Phone mockup — anchored bottom-left */}
              <div className="absolute top-[50%] lg:top-[32%] -left-[120px] sm:-left-[160px] lg:-left-[243px] z-20 h-[65%] lg:h-[58%] animate-pop-in [animation-delay:600ms]">
                <div className="animate-float h-full">
                  <img
                    src="/analysis_mockup_cel.png"
                    alt="Mobile analysis view"
                    loading="eager"
                    className="h-full w-auto border-0 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
