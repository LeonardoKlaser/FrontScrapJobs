import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react'
import { PATHS } from '@/router/paths'

export default function PaymentConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const planName = searchParams.get('plan') || 'seu plano'

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="animate-fade-in-up mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-14 w-14 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="space-y-6 text-center">
          <h1
            className="animate-fade-in-up text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ animationDelay: '100ms' }}
          >
            Pagamento Confirmado!
          </h1>

          <p
            className="animate-fade-in-up text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: '200ms' }}
          >
            Obrigado por assinar o plano{' '}
            <span className="font-semibold text-foreground">{planName}</span>! Sua jornada para
            automatizar a busca de empregos comecou.
          </p>

          <div
            className="animate-fade-in-up rounded-lg border border-border/50 bg-card p-4"
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>Um e-mail de confirmacao foi enviado para sua caixa de entrada.</span>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Button
              variant="glow"
              onClick={() => navigate(PATHS.app.home)}
              className="h-11 w-full text-base"
            >
              Ir para o Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p
            className="animate-fade-in-up text-xs text-muted-foreground"
            style={{ animationDelay: '500ms' }}
          >
            Precisa de ajuda? Entre em contato com nosso suporte em{' '}
            <a href="mailto:support@scrapjobs.com" className="text-primary hover:underline">
              support@scrapjobs.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
