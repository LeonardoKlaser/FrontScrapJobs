import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { trackLanding } from '@/lib/analytics'
import { buildWaLink, hasWaNumber, isMobileDevice } from './landing-wa'

interface WhatsAppCtaButtonProps extends React.ComponentProps<typeof Button> {
  section: 'navbar' | 'hero' | 'final'
  children: React.ReactNode
}

// CTA da landing: mobile abre o WhatsApp direto; desktop abre modal com QR
// próprio (wa.me puro no desktop sem sessão cai no login por QR do próprio
// WhatsApp — parede que mata lead frio).
export function WhatsAppCtaButton({ section, children, ...buttonProps }: WhatsAppCtaButtonProps) {
  const { t } = useTranslation('landing')
  const [open, setOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const available = hasWaNumber()
  const qrLink = buildWaLink('qr')
  const webLink = buildWaLink('web')
  const unavailableId = `wa-unavailable-${section}`

  useEffect(() => {
    if (!open || !qrLink) return
    QRCode.toDataURL(qrLink, { width: 240, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [open, qrLink])

  const onClick = () => {
    if (!available) return
    const mobile = isMobileDevice()
    trackLanding('lp_whatsapp_click', {
      section,
      device: mobile ? 'mobile' : 'desktop',
      method: mobile ? 'direct' : 'modal'
    })
    if (mobile) {
      // Adia a navegação um tick: o dataLayer.push do trackLanding acima é
      // síncrono, mas o GTM dispara beacons assíncronos pras tags — navegar
      // no mesmo tick pode abortar esse envio no caminho principal do funil.
      setTimeout(() => {
        const mobileLink = buildWaLink('mobile')
        if (mobileLink) window.location.href = mobileLink
      }, 0)
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button
        {...buttonProps}
        disabled={buttonProps.disabled || !available}
        aria-describedby={!available ? unavailableId : undefined}
        onClick={onClick}
      >
        {children}
      </Button>
      {!available && (
        <span id={unavailableId} role="status" className="mt-2 block text-xs text-destructive">
          {t('waUnavailable')}
        </span>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle>{t('waModal.title')}</DialogTitle>
            <DialogDescription>{t('waModal.subtitle')}</DialogDescription>
          </DialogHeader>
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt={t('waModal.qrAlt')}
              className="mx-auto h-60 w-60 rounded-lg border"
            />
          )}
          <p className="text-sm text-muted-foreground">{t('waModal.scanHint')}</p>
          {webLink && (
            <a
              href={webLink}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackLanding('lp_whatsapp_web_click', { section })}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('waModal.webButton')}
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
