import { useTranslation } from 'react-i18next'
import { Clock, BarChart3, Mail, Infinity as InfinityIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function FeaturesSection() {
  const { t } = useTranslation('landing')

  const features = [
    {
      icon: Clock,
      titleKey: 'features.scraping.title',
      descriptionKey: 'features.scraping.description',
      highlight: false
    },
    {
      icon: BarChart3,
      titleKey: 'features.ai.title',
      descriptionKey: 'features.ai.description',
      highlight: true
    },
    {
      icon: Mail,
      titleKey: 'features.alerts.title',
      descriptionKey: 'features.alerts.description',
      highlight: false
    },
    {
      icon: InfinityIcon,
      titleKey: 'features.monitoring.title',
      descriptionKey: 'features.monitoring.description',
      highlight: false
    }
  ]

  return (
    <section className="py-20 sm:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight text-balance">
            {t('features.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={feature.titleKey}
              className={`bg-card border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in-up hover-lift ${
                feature.highlight ? 'border-primary/50 glow-border' : ''
              }`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  {t(feature.descriptionKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
