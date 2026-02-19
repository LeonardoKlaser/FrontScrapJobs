import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">scrapJobs</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight animate-fade-in-up text-balance">
            Pare de Procurar. <span className="text-primary">Comece a Ser Entrevistado.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up text-pretty">
            Automatize sua busca de emprego nas melhores empresas e receba insights de IA para seu
            currículo se destacar.
          </p>

          <div className="animate-fade-in-up">
            <a href="#pricing">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 hover:scale-105 animate-pulse-glow"
              >
                Iniciar Meu Teste Gratuito
              </Button>
            </a>
          </div>

          <div className="mt-16 relative">
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
              <div className="w-4 h-4 bg-success rounded-full animate-pulse delay-200" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
              <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse delay-400" />
            </div>
            <div className="flex items-center justify-center space-x-12 mt-4 opacity-40">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-500" />
              <div className="w-3 h-3 bg-success rounded-full animate-pulse delay-600" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
