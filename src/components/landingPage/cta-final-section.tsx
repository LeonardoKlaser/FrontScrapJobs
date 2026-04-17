import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'

export function CtaFinalSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper className="py-20 bg-emerald-50/30">
      <div className="max-w-2xl mx-auto text-center px-6 space-y-6">
        <h2 className="font-display text-3xl lg:text-4xl font-semibold text-zinc-900">
          {t('ctaFinal.title')}{' '}
          <span className="text-gradient-primary">{t('ctaFinal.titleHighlight')}</span>
        </h2>

        <p className="text-base text-zinc-500">{t('ctaFinal.subtitle')}</p>

        <Button
          variant="glow"
          size="lg"
          className="px-10 py-4 text-base font-semibold rounded-lg animate-pulse-glow mt-4"
          onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
        >
          {t('ctaFinal.cta')}
          <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </SectionWrapper>
  )
}
