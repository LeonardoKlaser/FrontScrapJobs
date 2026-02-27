import { useTranslation } from 'react-i18next'
import { Target, Filter, Brain } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function HowItWorksSection() {
  const { t } = useTranslation('landing')

  const steps = [
    {
      icon: Target,
      titleKey: 'howItWorks.step1.title',
      descriptionKey: 'howItWorks.step1.description'
    },
    {
      icon: Filter,
      titleKey: 'howItWorks.step2.title',
      descriptionKey: 'howItWorks.step2.description'
    },
    {
      icon: Brain,
      titleKey: 'howItWorks.step3.title',
      descriptionKey: 'howItWorks.step3.description'
    }
  ]

  return (
    <section className="py-20 sm:py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight text-balance">
            {t('howItWorks.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={step.titleKey}
              className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{t(step.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  {t(step.descriptionKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
