import { useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Clock, AlertCircle } from 'lucide-react'
import { PATHS } from '@/router/paths'
import { trackTrial } from '@/lib/analytics'

const PAYWALL_VIEW_FIRED_KEY = 'paywall_view_fired'

// safeSessionStorage: Safari private mode joga QuotaExceededError no setItem
// (e em alguns casos no getItem). Sem o try/catch, o ErrorBoundary derruba o
// banner inteiro em vez de so pular o disparo do evento.
function readPaywallFlag(): boolean {
  try {
    return window.sessionStorage.getItem(PAYWALL_VIEW_FIRED_KEY) !== null
  } catch {
    return false
  }
}

function writePaywallFlag(): void {
  try {
    window.sessionStorage.setItem(PAYWALL_VIEW_FIRED_KEY, '1')
  } catch {
    // No-op: em modo privado, dispararemos o evento de novo na proxima sessao —
    // melhor que crashar o layout.
  }
}

export function TrialBanner() {
  const { data: user } = useUser()
  const navigate = useNavigate()

  // Calcula msLeft do lado FE pra que clock skew nao deixe banner travado em
  // "0 dias" — se trial_ends_at ja passou, FE renderiza paywall mesmo que
  // is_trial_active ainda esteja true no /api/me cache.
  const msLeft = user?.trial_ends_at ? new Date(user.trial_ends_at).getTime() - Date.now() : 0
  const trialStillActive = !!user && user.is_trial_active && msLeft > 0

  // Paywall = user existe, ainda nao pagou, e trial expirou (BE flag OU msLeft<=0).
  // Confiamos em is_trial_active vindo do backend pra nao duplicar logica BE/FE,
  // mas msLeft<=0 sobrepoe pra cobrir clock skew + race com refetch.
  const isPaywallShowing = !!user && !user.payment_method && !trialStillActive

  // Dispara paywall_view uma unica vez por sessao do navegador.
  // sessionStorage protege contra: StrictMode dev mount duplo, refetch on focus,
  // re-mount do MainLayout em navegacao.
  useEffect(() => {
    if (!isPaywallShowing) return
    if (typeof window === 'undefined') return
    if (readPaywallFlag()) return
    writePaywallFlag()
    trackTrial('paywall_view')
  }, [isPaywallShowing])

  if (!user) return null
  if (user.payment_method) return null

  if (trialStillActive) {
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
    return (
      <div className="flex items-center justify-center gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>
          Você está no trial gratuito.{' '}
          <strong>
            {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
          </strong>
          .
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>Seu trial acabou. Assine pra continuar recebendo vagas.</span>
      <Button
        onClick={() => navigate(PATHS.app.renew)}
        size="sm"
        className="bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Assinar agora
      </Button>
    </div>
  )
}
