import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ProductVisualizationSection() {
  return (
    <section className="py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              Veja Exatamente o Que Você Receberá
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              Chega de e-mails de alerta genéricos. Nossas notificações são ricas em dados e
              insights para ajudá-lo a tomar a melhor decisão.
            </p>
          </div>

          {/* Email Mockup */}
          <div className="relative">
            <Card className="bg-card border-border shadow-2xl">
              <CardContent className="p-6 space-y-4">
                {/* Email Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-bold">sJ</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">scrapJobs</p>
                      <p className="text-sm text-muted-foreground">Nova oportunidade encontrada!</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-success/20 text-success border-success/30"
                  >
                    85% Match
                  </Badge>
                </div>

                {/* Job Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground">Senior Frontend Developer</h3>
                  <p className="text-muted-foreground">Google • São Paulo, SP</p>

                  {/* AI Analysis */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-foreground">Análise de IA:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Suas habilidades em React e TypeScript são um match perfeito</li>
                      <li>• Experiência com Next.js é um diferencial para esta vaga</li>
                      <li>• Considere destacar seus projetos de performance</li>
                    </ul>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() =>
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    Candidatar-se Agora
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
