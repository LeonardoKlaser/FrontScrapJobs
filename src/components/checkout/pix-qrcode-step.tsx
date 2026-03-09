import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Copy, Clock, QrCodeIcon, RefreshCw } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { usePixStatus } from '@/hooks/usePixStatus'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import type { PixQRCodeData } from '@/services/paymentService'

interface PixQRCodeStepProps {
  pixData: PixQRCodeData
  onGenerateNew: () => void
}

export function PixQRCodeStep({ pixData, onGenerateNew }: PixQRCodeStepProps) {
  const { t } = useTranslation('plans')
  const navigate = useNavigate()
  const { data: status } = usePixStatus(pixData.pix_id)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  // Countdown timer
  useEffect(() => {
    const expiresAt = new Date(pixData.expires_at).getTime()

    const tick = () => {
      const now = Date.now()
      const diff = expiresAt - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('00:00')
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [pixData.expires_at])

  // Redirect on PAID
  useEffect(() => {
    if (status === 'PAID') {
      const timer = setTimeout(() => {
        navigate('/payment-confirmation')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pixData.br_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = pixData.br_code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }, [pixData.br_code])

  if (status === 'PAID') {
    return (
      <Card className="w-full border-primary/30">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground">{t('pixQrCode.paymentConfirmed')}</p>
          <Spinner className="h-5 w-5" />
        </CardContent>
      </Card>
    )
  }

  if (isExpired) {
    return (
      <Card className="w-full border-border/50">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Clock className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-lg font-semibold text-foreground">{t('pixQrCode.qrExpired')}</p>
          <p className="text-center text-sm text-muted-foreground">
            {t('pixQrCode.qrExpiredDescription')}
          </p>
          <Button variant="glow" onClick={onGenerateNew} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('pixQrCode.generateNewQr')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-border/50">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <QrCodeIcon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl tracking-tight">{t('pixQrCode.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('pixQrCode.subtitle')}</p>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        {/* QR Code Image */}
        <div className="rounded-xl border border-border/50 bg-white p-4">
          <QRCodeSVG
            value={pixData.br_code}
            size={208}
            level="M"
            marginSize={0}
          />
        </div>

        {/* Copy Button */}
        <Button
          variant={copied ? 'default' : 'outline'}
          onClick={handleCopy}
          className="w-full max-w-xs"
        >
          {copied ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t('pixQrCode.codeCopied')}
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              {t('pixQrCode.copyCode')}
            </>
          )}
        </Button>

        {/* Timer + Status */}
        <div className="flex flex-col items-center gap-3">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
            <Clock className="h-3.5 w-3.5" />
            {t('pixQrCode.expiresIn')} {timeLeft}
          </Badge>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="h-4 w-4" />
            {t('pixQrCode.awaitingPayment')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
