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
import { buildWaLink, isMobileDevice } from './landing-wa'

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

  useEffect(() => {
    if (!open) return
    QRCode.toDataURL(buildWaLink('qr'), { width: 240, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [open])

  const onClick = () => {
    const mobile = isMobileDevice()
    trackLanding('lp_whatsapp_click', {
      section,
      device: mobile ? 'mobile' : 'desktop',
      method: mobile ? 'direct' : 'modal'
    })
    if (mobile) {
      window.location.href = buildWaLink('mobile')
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button {...buttonProps} onClick={onClick}>
        {children}
      </Button>
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
          <a
            href={buildWaLink('web')}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackLanding('lp_whatsapp_click', { section, device: 'desktop', method: 'web' })
            }
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('waModal.webButton')}
          </a>
        </DialogContent>
      </Dialog>
    </>
  )
}
