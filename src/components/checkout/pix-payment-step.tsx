import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Copy, Clock, AlertTriangle, RefreshCw } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { checkPaymentStatus } from '@/services/paymentService'
import { trackTrial } from '@/lib/analytics'
import { PATHS } from '@/router/paths'
import type { PixPaymentResult } from '@/services/pixService'

interface PixPaymentStepProps {
  pixResult: PixPaymentResult
  planId: number
  userEmail: string
  onExpired: () => void
  // Chamado antes do redirect quando pagamento confirma — parent usa pra limpar
  // o snapshot de PIX persistido em localStorage (recovery pos-tab-close).
  onConfirmed?: () => void
  // Override do destino pos-confirmacao. Default eh PATHS.app.home (renovacao
  // de user autenticado). Checkout anonimo passa PATHS.paymentConfirmation
  // pra evitar redirect-loop no /login (user ainda nao tem JWT — conta foi
  // criada pelo webhook backend mas o frontend nao fez login automatico).
  //
  // CAUTION: callers chamando este componente em fluxo anonimo DEVEM passar
  // este prop apontando pra rota publica — caso contrario o fallback
  // PATHS.app.home dispara o authLoader, retorna 401, e o user e' redirecionado
  // pra /login com perda do feedback de pagamento confirmado.
  redirectAfterConfirm?: string
}

const FALLBACK_EXPIRY_SECONDS = 1800
// Grace window: timer chegou a 0 mas damos 5s extra pra polling/final-check
// pegar confirmacao que cruzou o limite. Sem isso, pagamento que chega 200ms
// depois da expiracao mostra UI "expirou" mesmo que o webhook ja tenha caido.
const POST_EXPIRY_GRACE_MS = 5000
// Tempo em pollingFailed antes de escalar pra estado "stuck": polling persistente
// quebrado sinaliza problema infra/backend, nao soluciona com retries cegos.
// User precisa de copy dedicada com canal de suporte.
const POLLING_STUCK_THRESHOLD_MS = 30000

function computeInitialSeconds(expiresAt: string | undefined): number {
  if (!expiresAt) return FALLBACK_EXPIRY_SECONDS
  // Pagar.me Orders V5 retorna expires_at em ISO 8601 UTC. Se string vier sem
  // sufixo de timezone (drift do gateway), `new Date()` interpreta como local
  // — em BR (UTC-3) um QR de 30min apareceria como 3h30. Normaliza pra UTC.
  const normalized = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(expiresAt) ? expiresAt : expiresAt + 'Z'
  const target = new Date(normalized).getTime()
  if (Number.isNaN(target)) return FALLBACK_EXPIRY_SECONDS
  const diffSec = Math.floor((target - Date.now()) / 1000)
  if (diffSec <= 0) return 0
  return diffSec
}

export function PixPaymentStep({
  pixResult,
  planId,
  userEmail,
  onExpired,
  onConfirmed,
  redirectAfterConfirm
}: PixPaymentStepProps) {
  const { t } = useTranslation('plans')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Diferencia 401/429/network do erro generico — sem isso o user via mesmo
  // toast pra "sessao expirou" e "internet caiu". Espelha mapPixError de
  // RenewSubscription pra consistencia entre checkout e renovacao.
  const mapStatusCheckError = useCallback(
    (err: unknown): string => {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          return t('renew.errors.network')
        }
        if (err.response?.status === 401) {
          return t('renew.errors.sessionExpired')
        }
        if (err.response?.status === 429) {
          return t('pixQrCode.checkRateLimited')
        }
      }
      return t('pixQrCode.checkFailed')
    },
    [t]
  )

  const [secondsLeft, setSecondsLeft] = useState(() => computeInitialSeconds(pixResult.expires_at))
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [expired, setExpired] = useState(false)
  const [verifyingFinal, setVerifyingFinal] = useState(false)
  const [pollingFailed, setPollingFailed] = useState(false)
  const [stuck, setStuck] = useState(false)
  const [manualCheckLoading, setManualCheckLoading] = useState(false)
  // emailMissing: useUser nao resolveu email apos timeout. Polling fica travado
  // em no-op ate user recarregar. Sem esse state, UI mostrava "aguardando
  // pagamento" indefinidamente sem feedback do problema.
  const [emailMissing, setEmailMissing] = useState(false)
  const stuckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // userEmail pode chegar vazio no primeiro render (useUser ainda resolvendo).
  // Captura o primeiro valor não-vazio e usa ele dentro do effect, evitando
  // re-trigger do useEffect que reiniciaria timer + polling.
  const userEmailRef = useRef(userEmail)
  useEffect(() => {
    if (userEmail && !userEmailRef.current) {
      userEmailRef.current = userEmail
    }
  }, [userEmail])

  // Failsafe: se userEmailRef nao resolver em 15s, mostra error state com CTA
  // pra recarregar. Polling tick (ver computeDelay) faz no-op silencioso quando
  // email vazio, entao sem esse timeout o user via "aguardando pagamento"
  // indefinidamente sem saber que esta travado.
  useEffect(() => {
    if (userEmailRef.current) return
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && !userEmailRef.current) {
        setEmailMissing(true)
      }
    }, 15000)
    return () => clearTimeout(timeoutId)
  }, [])

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const graceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Guard pra que startGraceWindow seja chamada exatamente 1x quando o timer
  // chega a 0. Sem isso, re-runs do useEffect (causados por mudanca de
  // identidade de startGraceWindow via handleConfirmed deps) poderiam disparar
  // grace duas vezes se o secondsLeft permanecesse em 0 entre re-runs.
  const graceStartedRef = useRef(false)
  const isMountedRef = useRef(true)
  // useRef pra persistir consecutiveErrors entre invocacoes de startPolling.
  // Antes era `let` dentro do callback — manual retry resetava o breaker, fazendo
  // backend persistentemente quebrado consumir quota indefinidamente.
  const consecutiveErrorsRef = useRef(0)
  // Total de polls bem-sucedidos: usado pra backoff (3s nos primeiros 10 polls,
  // depois cresce ate 10s). Sem isso, 1 user consumia ~1/3 do payment_poll
  // limit (20/min) sozinho durante toda a janela de 30min do QR.
  const pollAttemptRef = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const stopAll = useCallback(() => {
    stopPolling()
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (graceTimeoutRef.current) {
      clearTimeout(graceTimeoutRef.current)
      graceTimeoutRef.current = null
    }
    if (stuckTimeoutRef.current) {
      clearTimeout(stuckTimeoutRef.current)
      stuckTimeoutRef.current = null
    }
  }, [stopPolling])

  const handleConfirmed = useCallback(() => {
    if (!isMountedRef.current) return
    stopAll()
    setConfirmed(true)
    onConfirmed?.()
    trackTrial('pix_paid', { plan_id: planId })
    trackTrial('payment_complete', { plan_id: planId, method: 'pix' })
    toast.success(t('pixQrCode.paymentConfirmed'))
    queryClient.invalidateQueries({ queryKey: ['user'] })
    setTimeout(() => {
      if (!isMountedRef.current) return
      navigate(redirectAfterConfirm ?? PATHS.app.home)
    }, 2000)
  }, [stopAll, onConfirmed, planId, t, queryClient, navigate, redirectAfterConfirm])

  // Fire pix_qr_generated once when this component mounts with a result.
  // Intentional: empty deps — fire-once on mount of this rendered QR step.
  const qrGeneratedFiredRef = useRef(false)
  useEffect(() => {
    if (qrGeneratedFiredRef.current) return
    qrGeneratedFiredRef.current = true
    trackTrial('pix_qr_generated', { plan_id: planId })
  }, [planId])

  // Extraída em useCallback pra poder reiniciar o polling a partir do manual check
  // depois que o circuit breaker (5 erros consecutivos) parou o intervalo.
  // resetAttempts=false preserva o backoff acumulado quando manual check chama —
  // evita que cliques repetidos de "verificar agora" bypassem o backoff exponencial.
  const startPolling = useCallback(
    (resetAttempts: boolean = true) => {
      stopPolling()
      if (resetAttempts) pollAttemptRef.current = 0
      const computeDelay = () => {
        const n = pollAttemptRef.current
        // Backoff suave: 3s nos primeiros 10 polls (~30s), depois cresce
        // exponencialmente ate teto de 10s. Mantem responsividade na janela
        // tipica de pagamento (<60s) e evita gastar quota se levar 30min.
        if (n < 10) return 3000
        const grown = 3000 * Math.pow(1.25, n - 10)
        return Math.min(grown, 10000)
      }
      const tick = async () => {
        pollingRef.current = null
        if (!isMountedRef.current) return
        const email = userEmailRef.current
        if (!email) {
          pollingRef.current = setTimeout(tick, computeDelay())
          return
        }
        try {
          const result = await checkPaymentStatus(email)
          if (!isMountedRef.current) return
          consecutiveErrorsRef.current = 0
          pollAttemptRef.current++
          if (result.status === 'confirmed') {
            handleConfirmed()
            return
          }
        } catch (err) {
          if (!isMountedRef.current) return
          consecutiveErrorsRef.current++
          console.error('pix payment status check failed', err)
          if (consecutiveErrorsRef.current >= 5) {
            setPollingFailed(true)
            if (stuckTimeoutRef.current) clearTimeout(stuckTimeoutRef.current)
            stuckTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) setStuck(true)
            }, POLLING_STUCK_THRESHOLD_MS)
            return
          }
        }
        if (!isMountedRef.current) return
        pollingRef.current = setTimeout(tick, computeDelay())
      }
      pollingRef.current = setTimeout(tick, computeDelay())
    },
    [stopPolling, handleConfirmed]
  )

  // Quando o timer chega a 0, em vez de flipar expired=true imediatamente,
  // entra em "verifying" e da uma janela de 5s pra polling pegar confirmacao
  // que cruzou o limite. Tambem dispara um check sincrono final.
  const startGraceWindow = useCallback(async () => {
    if (!isMountedRef.current) return
    setVerifyingFinal(true)
    const email = userEmailRef.current
    if (email) {
      try {
        const result = await checkPaymentStatus(email)
        if (!isMountedRef.current) return
        if (result.status === 'confirmed') {
          handleConfirmed()
          return
        }
      } catch (err) {
        console.error('pix final status check failed', err)
      }
    }
    // Polling continua durante a janela; se confirmed chegar antes do timeout,
    // handleConfirmed limpa graceTimeoutRef via stopAll.
    graceTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return
      setVerifyingFinal(false)
      setExpired(true)
    }, POST_EXPIRY_GRACE_MS)
  }, [handleConfirmed])

  useEffect(() => {
    isMountedRef.current = true

    timerRef.current = setInterval(() => {
      if (!isMountedRef.current) return
      // Updater PURO: side effects (clearInterval, startGraceWindow) movidos
      // pro useEffect abaixo que observa secondsLeft===0. React chama
      // updaters 2x em StrictMode (e podera em concurrent rendering retries
      // futuros) — fazer side effect aqui causaria 2 chamadas de
      // startGraceWindow, gerando 2 fetches paralelos de checkPaymentStatus
      // e vazando o 1o graceTimeoutRef.
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    startPolling()

    return () => {
      isMountedRef.current = false
      stopAll()
    }
  }, [stopAll, startPolling])

  // Dispara grace window quando o timer chega a 0. graceStartedRef garante
  // chamada unica mesmo se este effect re-rodar (startGraceWindow muda
  // identidade quando handleConfirmed deps mudam).
  useEffect(() => {
    if (secondsLeft !== 0 || graceStartedRef.current) return
    graceStartedRef.current = true
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    startGraceWindow()
  }, [secondsLeft, startGraceWindow])

  const handleManualCheck = async () => {
    if (manualCheckLoading) return
    const email = userEmailRef.current
    if (!email) return
    setManualCheckLoading(true)
    try {
      const result = await checkPaymentStatus(email)
      if (!isMountedRef.current) return
      if (result.status === 'confirmed') {
        handleConfirmed()
      } else {
        // Manual retry recupera de pollingFailed: cancela timeout pra stuck
        // e reinicia polling preservando o backoff (resetAttempts=false).
        // Importante: NAO resetar consecutiveErrorsRef — caso contrario, com
        // backend down + cliques manuais repetidos, o counter fica em 0
        // permanentemente e o circuit breaker (5 erros) nunca trip. Manter
        // os erros prévios; reset so acontece em handleConfirmed (sucesso real)
        // ou em ticks de polling bem-sucedidos.
        if (stuckTimeoutRef.current) {
          clearTimeout(stuckTimeoutRef.current)
          stuckTimeoutRef.current = null
        }
        setPollingFailed(false)
        setStuck(false)
        startPolling(false)
      }
    } catch (err) {
      console.error('manual pix status check failed', err)
      if (isMountedRef.current) toast.error(mapStatusCheckError(err))
    } finally {
      if (isMountedRef.current) setManualCheckLoading(false)
    }
  }

  const fallbackCopyToClipboard = (value: string): boolean => {
    try {
      const ta = document.createElement('textarea')
      ta.value = value
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch (err) {
      console.warn('pix clipboard fallback failed', err)
      return false
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixResult.qr_code)
      if (!isMountedRef.current) return
      setCopied(true)
      setTimeout(() => {
        if (isMountedRef.current) setCopied(false)
      }, 3000)
      return
    } catch (err) {
      console.warn('pix clipboard primary failed, trying fallback', err)
    }
    const ok = fallbackCopyToClipboard(pixResult.qr_code)
    if (ok && isMountedRef.current) {
      setCopied(true)
      setTimeout(() => {
        if (isMountedRef.current) setCopied(false)
      }, 3000)
      return
    }
    toast.error(t('pixQrCode.copyFailed'))
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Confirmed state
  if (confirmed) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-fade-in-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">{t('pixQrCode.paymentConfirmed')}</h3>
        <Spinner className="h-5 w-5 text-primary" />
      </div>
    )
  }

  // Email missing state — useUser nao resolveu email em 15s. Polling fica
  // travado em no-op silencioso. CTA recarregar pra refazer fetch do user.
  if (emailMissing && !confirmed && !expired) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-fade-in-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
          <AlertTriangle className="h-8 w-8 text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {t('pixQrCode.emailMissingTitle')}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {t('pixQrCode.emailMissingDescription')}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('pixQrCode.reloadPage')}
        </Button>
      </div>
    )
  }

  // Expired state — keep "Já paguei? Verificar" affordance for confirmations
  // that may have crossed the timer boundary.
  if (expired) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-fade-in-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
          <AlertTriangle className="h-8 w-8 text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{t('pixQrCode.qrExpired')}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {t('pixQrCode.qrExpiredDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleManualCheck}
            disabled={manualCheckLoading}
            className="gap-2"
          >
            {manualCheckLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {t('pixQrCode.expiredCheckCta')}
          </Button>
          <Button variant="outline" onClick={onExpired} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('pixQrCode.generateNewQr')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 animate-fade-in-up">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{t('pixQrCode.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('pixQrCode.subtitle')}</p>
      </div>

      {/* QR Code image */}
      <div className="rounded-xl border border-border bg-white p-4">
        <img src={pixResult.qr_code_url} alt="PIX QR Code" className="h-52 w-52 sm:h-64 sm:w-64" />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{t('pixQrCode.expiresIn')}</span>
        <span
          className={
            'font-mono font-semibold' + (secondsLeft <= 300 ? ' text-warning' : ' text-foreground')
          }
        >
          {formatTime(secondsLeft)}
        </span>
      </div>

      {/* Copy-paste code */}
      <div className="w-full max-w-md space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{t('pixQrCode.copyCode')}</p>
        <div className="flex gap-2">
          <div
            className={
              'flex-1 truncate rounded-lg border border-border bg-muted/50 px-3 py-2.5' +
              ' font-mono text-xs text-foreground select-all'
            }
          >
            {pixResult.qr_code}
          </div>
          <Button variant="outline" size="lg" onClick={handleCopy} className="shrink-0 gap-2">
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t('pixQrCode.codeCopied')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t('pixQrCode.copyCode')}
              </>
            )}
          </Button>
        </div>
      </div>

      {verifyingFinal ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4 text-primary" />
          <span>{t('pixQrCode.verifyingFinal')}</span>
        </div>
      ) : stuck ? (
        <div className="flex flex-col items-center gap-2 text-sm">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <p className="text-center max-w-sm text-foreground font-medium">
            {t('pixQrCode.stuckTitle')}
          </p>
          <p className="text-center max-w-sm text-muted-foreground">
            {t('pixQrCode.stuckDescription')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={manualCheckLoading}
            className="gap-2"
          >
            {manualCheckLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {t('pixQrCode.checkNow')}
          </Button>
        </div>
      ) : pollingFailed ? (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <p className="text-center max-w-sm">{t('pixQrCode.pollingFailed')}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={manualCheckLoading}
            className="gap-2"
          >
            {manualCheckLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {t('pixQrCode.checkNow')}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4 text-primary" />
          <span>{t('pixQrCode.awaitingPayment')}</span>
        </div>
      )}
    </div>
  )
}
