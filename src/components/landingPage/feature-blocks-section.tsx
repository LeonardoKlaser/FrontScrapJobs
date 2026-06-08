import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AtsAnalysisCard } from './ui-snippets/ats-analysis-card'
import { PdfPreviewCard } from './ui-snippets/pdf-preview-card'
import { scrollToPricing } from './landing-cta'
import { trackLanding } from '@/lib/analytics'

export function FeatureBlocksSection() {
  const { t } = useTranslation('landing')
  const go = (section: 'ats' | 'pdf') => {
    trackLanding('lp_cta_click', { section })
    scrollToPricing()
  }
  return (
    <>
      <section className="bg-white px-6 py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {t('featureBlocks.ats.overline')}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-zinc-900 sm:text-3xl">
              {t('featureBlocks.ats.heading')}
            </h2>
            <p className="mt-3 text-zinc-500">{t('featureBlocks.ats.sub')}</p>
            <Button variant="outline" className="mt-6" onClick={() => go('ats')}>
              {t('featureBlocks.ats.cta')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <AtsAnalysisCard />
        </div>
      </section>

      <section className="bg-zinc-50 px-6 py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <PdfPreviewCard />
          </div>
          <div className="order-1 lg:order-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {t('featureBlocks.pdf.overline')}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-zinc-900 sm:text-3xl">
              {t('featureBlocks.pdf.heading')}
            </h2>
            <p className="mt-3 text-zinc-500">{t('featureBlocks.pdf.sub')}</p>
            <Button variant="outline" className="mt-6" onClick={() => go('pdf')}>
              {t('featureBlocks.pdf.cta')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
