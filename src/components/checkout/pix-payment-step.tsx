import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
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
}

export function PixPaymentStep({ pixResult, planId, userEmail, onExpired }: PixPaymentStepProps) {
  const { t } = useTranslation('plans')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [secondsLeft, setSecondsLeft] = useState(1800)
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [expired, setExpired] = useState(false)

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopAll = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    // Countdown timer
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopAll()
          setExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Payment polling every 3 seconds
    let consecutiveErrors = 0
    pollingRef.current = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(userEmail)
        consecutiveErrors = 0
        if (result.status === 'confirmed') {
          stopAll()
          setConfirmed(true)
          trackTrial('payment_complete', { plan_id: planId, method: 'pix' })
          queryClient.invalidateQueries({ queryKey: ['user'] })
          setTimeout(() => {
            navigate(PATHS.app.home)
          }, 2000)
        }
      } catch (err) {
        consecutiveErrors++
        console.error('pix payment status check failed', err)
        if (consecutiveErrors >= 5) {
          // Keep timer running but stop polling; user can still copy QR code
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
        }
      }
    }, 3000)

    return stopAll
  }, [userEmail, planId, stopAll, queryClient, navigate])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixResult.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      console.error('failed to copy pix code')
    }
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
        <h3 className="text-xl font-semibold text-foreground">
          {t('pixQrCode.paymentConfirmed')}
        </h3>
        <Spinner className="h-5 w-5 text-primary" />
      </div>
    )
  }

  // Expired state
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
        <Button variant="outline" onClick={onExpired} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('pixQrCode.generateNewQr')}
        </Button>
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
        <img
          src={pixResult.qr_code_url}
          alt="PIX QR Code"
          className="h-52 w-52 sm:h-64 sm:w-64"
        />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{t('pixQrCode.expiresIn')}</span>
        <span
          className={
            'font-mono font-semibold' +
            (secondsLeft <= 300 ? ' text-warning' : ' text-foreground')
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
          <Button
            variant="outline"
            size="lg"
            onClick={handleCopy}
            className="shrink-0 gap-2"
          >
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

      {/* Waiting indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="h-4 w-4 text-primary" />
        <span>{t('pixQrCode.awaitingPayment')}</span>
      </div>
    </div>
  )
}
