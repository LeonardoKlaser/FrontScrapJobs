import { useNavigate, useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useMemo } from "react"

export default function PaymentConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const planName = useMemo(
    () => searchParams.get("plan") || "Premium",
    [searchParams]
  )

  const handleDashboardClick = () => {
    navigate("/app")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50"></div>
            <CheckCircle2 className="w-24 h-24 text-green-600 relative" strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-slate-900">Pagamento Confirmado!</h1>

          <p className="text-lg text-slate-600 leading-relaxed">
            Obrigado por assinar o plano <span className="font-semibold text-slate-900">{planName}</span>! Sua jornada
            para automatizar a busca de empregos começou.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              Um e-mail de confirmação foi enviado para sua caixa de entrada. Verifique seu e-mail para mais detalhes.
            </p>
          </div>

          <Button
            onClick={handleDashboardClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base rounded-lg transition-colors duration-200"
          >
            Ir para o Dashboard
          </Button>

          <p className="text-sm text-slate-500">
            Você será redirecionado em breve ou clique no botão acima para continuar.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Precisa de ajuda? Entre em contato com nosso suporte em support@scrapjobs.com
          </p>
        </div>
      </div>
    </div>
  )
}
