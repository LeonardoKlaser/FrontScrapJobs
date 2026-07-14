import { useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
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

// Calcula dias entre two timestamps usando o início do dia LOCAL (não UTC).
// Sem isso, "expira em 1 dia" quase passando da meia-noite mostra "0 dias"
// erradamente quando o relógio do usuário cruza a meia-noite local.
function daysBetweenLocal(now: Date, target: Date): number {
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const ms = startOfTarget.getTime() - startOfNow.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function TrialBanner() {
  const { t } = useTranslation('dashboard')
  const { data: user } = useUser()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Trial é estado explícito da assinatura do plano comercial. O relógio local
  // só decide countdown versus expiração; nunca deduz trial pelo método.
  const now = new Date()
  const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null
  const msLeft = trialEndsAt ? trialEndsAt.getTime() - now.getTime() : 0
  const isTrialing = user?.subscription_status === 'trialing'
  const trialStillActive = !!user && isTrialing && msLeft > 0

  const hasFutureExpiry = !!user?.expires_at && new Date(user.expires_at).getTime() > Date.now()

  const isPaywallShowing =
    !!user && isTrialing && !!trialEndsAt && !trialStillActive && !hasFutureExpiry

  // PIX: calcula dias restantes do plano para exibir banner de renovacao.
  // Usuarios PIX nao tem renovacao automatica — banner aparece nos 5 dias finais.
  const isPixUser = user?.payment_method === 'pix'
  const pixExpiresAt = user?.expires_at ? new Date(user.expires_at) : null
  const pixDaysLeft = pixExpiresAt ? daysBetweenLocal(now, pixExpiresAt) : null
  const showPixBanner = isPixUser && pixDaysLeft !== null && pixDaysLeft <= 5 && pixDaysLeft >= 0
  const pixExpiresToday = isPixUser && pixDaysLeft === 0 && hasFutureExpiry

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
  // Esconde na pagina de renew — la o card ja comunica o estado e o botao
  // do banner navega pra ca (vira um clique no-op visualmente confuso).
  if (pathname === PATHS.app.renew) return null

  // Banner PIX: usuario pagante cuja assinatura vence em ate 5 dias.
  // Exibido ANTES do guard de payment_method porque PIX e um metodo de
  // pagamento valido — sem esse bloco, o guard abaixo descartaria o banner.
  if (showPixBanner) {
    // i18next resolves to pixDays_one or pixDays_other based on count.
    const daysLabel = t('banner.pixDays', { count: pixDaysLeft ?? 0 })
    return (
      <div className="flex items-center justify-center gap-3 border-b border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>
          {pixExpiresToday ? t('banner.pixExpiresToday') : t('banner.pixExpiresIn')}
          {!pixExpiresToday && <strong>{daysLabel}</strong>}
          {!pixExpiresToday && '.'}
        </span>
        <Button
          onClick={() => navigate(PATHS.app.renew)}
          size="sm"
          variant="outline"
          className="border-indigo-400 text-indigo-700 hover:bg-indigo-100"
        >
          {t('banner.renewNow')}
        </Button>
      </div>
    )
  }

  if (trialStillActive && trialEndsAt) {
    const daysLeft = daysBetweenLocal(now, trialEndsAt)
    return (
      <div className="flex items-center justify-center gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>
          {t('banner.trialActive')}
          <strong>{t('banner.trialDaysLeft', { count: daysLeft })}</strong>
          {'.'}
        </span>
      </div>
    )
  }

  if (!isTrialing || !trialEndsAt || hasFutureExpiry) return null

  return (
    <div className="flex flex-col items-center justify-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{t('banner.trialExpired')}</span>
      <Button
        onClick={() => navigate(PATHS.app.renew)}
        size="sm"
        className="bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {t('banner.subscribeNow')}
      </Button>
    </div>
  )
}
