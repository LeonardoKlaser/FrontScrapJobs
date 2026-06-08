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

  const items = t('faq.items', { returnObjects: true }) as { q: string; a: string }[]

  return (
    <SectionWrapper id="faq">
      <div className="py-16 lg:py-20 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
            {t('labels.faq')}
          </span>
          <h2 className="font-display text-3xl lg:text-5xl font-semibold text-zinc-900 leading-tight tracking-tight text-balance mt-3 mb-2">
            {t('faq.title')}
          </h2>

          <Accordion
            type="single"
            collapsible
            className="grid md:grid-cols-2 gap-x-6 gap-y-0 mt-8 text-left"
          >
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-zinc-200">
                <AccordionTrigger className="text-base font-medium text-zinc-900 py-4 hover:bg-zinc-50 px-2 rounded hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-zinc-500 leading-relaxed pb-4 px-2">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </SectionWrapper>
  )
}
