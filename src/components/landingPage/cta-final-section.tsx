import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'
import { LANDING_CTA_CLASS } from './landing-cta'
import { WhatsAppCtaButton } from './whatsapp-cta-button'

export function CtaFinalSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper className="py-16 lg:py-20 px-6 bg-primary/5">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="font-display text-3xl lg:text-5xl font-semibold text-foreground">
          {t('ctaFinal.title')}
        </h2>

        <p className="text-base text-muted-foreground">{t('ctaFinal.subtitle')}</p>

        <WhatsAppCtaButton section="final" variant="glow" size="lg" className={LANDING_CTA_CLASS}>
          {t('ctaFinal.cta')}
          <ArrowRight className="w-5 h-5 ml-1" />
        </WhatsAppCtaButton>

        <p className="text-sm text-muted-foreground">{t('ctaFinal.microcopy')}</p>
      </div>
    </SectionWrapper>
  )
}
