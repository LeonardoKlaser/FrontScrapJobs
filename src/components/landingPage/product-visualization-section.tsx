import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ProductVisualizationSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="py-20 sm:py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight text-balance">
              {t('productVisualization.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              {t('productVisualization.description')}
            </p>
          </div>

          {/* Email Mockup */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card className="bg-card border-border/50 glow-border">
              <CardContent className="p-6 space-y-4">
                {/* Email Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-bold">sJ</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">scrapJobs</p>
                      <p className="text-sm text-muted-foreground">
                        {t('productVisualization.emailSubtitle')}
                      </p>
                    </div>
                  </div>
                  <Badge>85% Match</Badge>
                </div>

                {/* Job Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground">Senior Frontend Developer</h3>
                  <p className="text-muted-foreground">Google • São Paulo, SP</p>

                  {/* AI Analysis */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-foreground">
                      {t('productVisualization.aiAnalysis')}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {t('productVisualization.bullet1')}</li>
                      <li>• {t('productVisualization.bullet2')}</li>
                      <li>• {t('productVisualization.bullet3')}</li>
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() =>
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    {t('productVisualization.applyNow')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
