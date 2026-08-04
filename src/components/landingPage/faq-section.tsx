import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { trackLanding } from '@/lib/analytics'
import { SectionWrapper } from './section-wrapper'

const FAQ_KEYS = ['origin', 'initialFree', 'whatsapp', 'curriculum', 'cancel', 'company'] as const

export function FaqSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper id="faq">
      <div className="py-16 lg:py-20 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <span className="text-sm font-medium tracking-[2px] uppercase text-emerald-500">
            {t('faq.overline')}
          </span>
          <h2 className="font-display text-3xl lg:text-5xl font-semibold text-foreground leading-tight tracking-tight text-balance mt-3 mb-2">
            {t('faq.title')}
          </h2>

          <Accordion
            type="single"
            collapsible
            className="grid md:grid-cols-2 gap-x-6 gap-y-0 mt-8 text-left"
            onValueChange={(value) => {
              if (!value) return
              const position = FAQ_KEYS.indexOf(value as (typeof FAQ_KEYS)[number]) + 1
              if (position > 0) trackLanding('lp_faq_open', { item_key: value, position })
            }}
          >
            {FAQ_KEYS.map((key) => (
              <AccordionItem key={key} value={key} className="border-b border-border">
                <AccordionTrigger className="text-base font-medium text-foreground py-4 hover:bg-muted px-2 rounded hover:no-underline">
                  {t(`faq.items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed pb-4 px-2">
                  {t(`faq.items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </SectionWrapper>
  )
}
