import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { SectionWrapper } from './section-wrapper'

export function FaqSection() {
  const { t } = useTranslation('landing')

  const faqKeys = ['security', 'ai', 'cancel', 'limits'] as const

  return (
    <SectionWrapper id="faq">
      <div className="py-16 px-6 text-center">
        <div className="container mx-auto max-w-4xl">
          {/* Section Header */}
          <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
            {t('labels.faq')}
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-zinc-900 leading-tight tracking-tight text-balance mt-3 mb-2">
            {t('faq.title')}
          </h2>

          <Accordion
            type="single"
            collapsible
            className="grid md:grid-cols-2 gap-x-6 gap-y-0 mt-8 text-left"
          >
            {faqKeys.map((key, index) => (
              <AccordionItem key={key} value={`item-${index}`} className="border-b border-zinc-200">
                <AccordionTrigger className="text-base font-medium text-zinc-900 py-4 hover:bg-zinc-50 px-2 rounded hover:no-underline">
                  {t(`faq.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-zinc-500 leading-relaxed pb-4 px-2">
                  {t(`faq.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </SectionWrapper>
  )
}
