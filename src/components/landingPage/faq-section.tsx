import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { ArrowRight } from 'lucide-react'

export function FaqSection() {
  const { t } = useTranslation('landing')

  const faqKeys = ['security', 'ai', 'cancel', 'limits'] as const

  return (
    <section className="py-20 sm:py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight text-balance">
              {t('faq.ctaTitle')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              {t('faq.ctaDescription')}
            </p>
            <a href="#pricing">
              <Button
                variant="glow"
                size="lg"
                className="px-8 py-4 text-lg font-medium animate-pulse-glow"
              >
                {t('faq.ctaButton')}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </a>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqKeys.map((key, index) => (
                <AccordionItem
                  key={key}
                  value={`item-${index}`}
                  className="bg-card border border-border/50 rounded-lg px-6 hover:border-primary/20 transition-colors duration-200"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    {t(`faq.${key}.question`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {t(`faq.${key}.answer`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
