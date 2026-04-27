import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'
import { LANDING_CTA_CLASS } from './landing-cta'
import { PATHS } from '@/router/paths'

export function CtaFinalSection() {
  const { t } = useTranslation('landing')
  const navigate = useNavigate()

  return (
    <SectionWrapper className="py-16 lg:py-20 px-6 bg-emerald-50/30">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="font-display text-3xl lg:text-5xl font-semibold text-zinc-900">
          {t('ctaFinal.title')}{' '}
          <span className="text-gradient-primary">{t('ctaFinal.titleHighlight')}</span>
        </h2>

        <p className="text-base text-zinc-500">{t('ctaFinal.subtitle')}</p>

        <Button
          variant="glow"
          size="lg"
          className={LANDING_CTA_CLASS}
          onClick={() => navigate(PATHS.signup)}
        >
          {t('ctaFinal.cta')}
          <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </SectionWrapper>
  )
}
