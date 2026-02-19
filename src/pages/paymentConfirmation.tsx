import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { useMemo } from 'react'
import { PATHS } from '@/router/paths'

export default function PaymentConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const planName = useMemo(() => searchParams.get('plan') || 'Premium', [searchParams])

  const handleDashboardClick = () => {
    navigate(PATHS.app.home)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-success/20 rounded-full blur-xl opacity-50"></div>
            <CheckCircle2 className="w-24 h-24 text-success relative" strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">Pagamento Confirmado!</h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Obrigado por assinar o plano{' '}
            <span className="font-semibold text-foreground">{planName}</span>! Sua jornada para
            automatizar a busca de empregos começou.
          </p>

          <div className="bg-muted border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Um e-mail de confirmação foi enviado para sua caixa de entrada. Verifique seu e-mail
              para mais detalhes.
            </p>
          </div>

          <Button
            onClick={handleDashboardClick}
            className="w-full bg-success hover:bg-success/90 text-success-foreground font-semibold py-6 text-base rounded-lg transition-colors duration-200"
          >
            Ir para o Dashboard
          </Button>

          <p className="text-sm text-muted-foreground">
            Clique no botão acima para acessar seu painel.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Precisa de ajuda? Entre em contato com nosso suporte em support@scrapjobs.com
          </p>
        </div>
      </div>
    </div>
  )
}
