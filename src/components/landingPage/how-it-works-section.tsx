import { Target, Filter, Brain } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function HowItWorksSection() {
  const steps = [
    {
      icon: Target,
      title: '1. Escolha suas Empresas',
      description: 'Selecione as empresas onde você sonha em trabalhar.'
    },
    {
      icon: Filter,
      title: '2. Defina seus Filtros',
      description: 'Especifique os cargos e palavras-chave que correspondem ao seu perfil.'
    },
    {
      icon: Brain,
      title: '3. Receba Alertas Inteligentes',
      description: 'Receba notificações por e-mail com uma análise completa de compatibilidade.'
    }
  ]

  return (
    <section className="py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Comece em 3 Passos Simples
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
