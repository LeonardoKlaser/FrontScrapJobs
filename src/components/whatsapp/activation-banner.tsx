import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { OptInModal } from './optin-modal'

const DISMISS_KEY = 'sj_whatsapp_banner_dismissed_v1'

// ActivationBanner convida o usuário a ativar o WhatsApp. Só aparece quando o
// user NÃO fez opt-in (!whatsapp_opted_in) e não dispensou o banner antes.
// Após opt-in (estado atualiza via invalidação de ['user']) some sozinho.
export function ActivationBanner() {
  const { t } = useTranslation('whatsapp')
  const { data: user } = useUser()
  const [modalOpen, setModalOpen] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  if (!user || user.whatsapp_opted_in || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Storage indisponível — só esconde nesta sessão.
    }
  }

  return (
    <>
      <div className="relative flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 pr-6 sm:pr-0">
            <p className="text-sm font-medium text-foreground">{t('banner.title')}</p>
            <p className="text-xs text-muted-foreground">{t('banner.description')}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="glow" size="sm" onClick={() => setModalOpen(true)}>
            {t('banner.cta')}
          </Button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t('banner.dismiss')}
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground sm:static"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <OptInModal open={modalOpen} onOpenChange={setModalOpen} defaultNumber={user.cellphone} />
    </>
  )
}
