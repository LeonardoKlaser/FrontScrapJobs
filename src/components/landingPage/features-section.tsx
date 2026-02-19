import { Clock, BarChart3, Mail, Infinity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: 'Scraping de Hora em Hora',
      description: 'Nunca mais perca uma vaga. Nosso sistema verifica seus alvos constantemente.',
      highlight: false
    },
    {
      icon: BarChart3,
      title: 'Análise de Currículo com IA',
      description:
        'Receba um relatório detalhado sobre o match da vaga e dicas para otimizar seu currículo.',
      highlight: true
    },
    {
      icon: Mail,
      title: 'Alertas Diretos na sua Caixa de Entrada',
      description: 'As melhores oportunidades, entregues de forma limpa e organizada para você.',
      highlight: false
    },
    {
      icon: Infinity,
      title: 'Monitoramento Ilimitado',
      description: 'Acompanhe todas as empresas da sua lista de desejos, sem restrições.',
      highlight: false
    }
  ]

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Uma Vantagem Injusta para Sua Carreira
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 ${
                feature.highlight ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
