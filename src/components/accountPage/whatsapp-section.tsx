import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Mail, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWhatsApp } from '@/hooks/useWhatsApp'
import { WhatsAppNotOptedInError } from '@/services/whatsappService'
import { OptInModal } from '@/components/whatsapp/optin-modal'
import { toast } from 'sonner'
import type { User } from '@/models/user'

type Channel = 'email' | 'whatsapp'

export function WhatsAppSection({ user }: { user: User | undefined }) {
  const { t } = useTranslation('whatsapp')
  const { setChannel } = useWhatsApp()
  const [modalOpen, setModalOpen] = useState(false)

  const optedIn = !!user?.whatsapp_opted_in
  const current: Channel = user?.preferred_channel === 'whatsapp' ? 'whatsapp' : 'email'

  const handleSelect = (channel: Channel) => {
    if (channel === current) return
    // Guard de UX: bloqueia escolher whatsapp sem opt-in antes mesmo de bater
    // no backend (que retornaria 409). O hint abaixo já explica o motivo.
    if (channel === 'whatsapp' && !optedIn) {
      toast.error(t('section.notOptedInError'))
      return
    }
    setChannel.mutate(channel, {
      onSuccess: () => toast.success(t('section.changeSuccess')),
      onError: (err) => {
        // 409 = backend rejeitou whatsapp por falta de opt-in (corrida com o
        // estado local). Mensagem específica orienta o user a ativar primeiro.
        if (err instanceof WhatsAppNotOptedInError) {
          toast.error(t('section.notOptedInError'))
          return
        }
        toast.error(err instanceof Error ? err.message : t('section.changeError'))
      }
    })
  }

  const options: { value: Channel; label: string; icon: typeof Mail; disabled: boolean }[] = [
    { value: 'email', label: t('section.channelEmail'), icon: Mail, disabled: false },
    {
      value: 'whatsapp',
      label: t('section.channelWhatsApp'),
      icon: MessageCircle,
      disabled: !optedIn
    }
  ]

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-lg">{t('section.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">{t('section.description')}</p>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{t('section.channelLabel')}</p>
          <div
            role="radiogroup"
            aria-label={t('section.channelLabel')}
            className="inline-flex rounded-lg border border-border/60 p-1"
          >
            {options.map((opt) => {
              const Icon = opt.icon
              const active = current === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={opt.disabled || setChannel.isPending}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                    opt.disabled && 'cursor-not-allowed opacity-50 hover:text-muted-foreground'
                  )}
                >
                  {setChannel.isPending && active ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {opt.label}
                </button>
              )
            })}
          </div>
          {!optedIn && (
            <p className="text-xs text-muted-foreground">{t('section.notOptedInHint')}</p>
          )}
        </div>

        {optedIn && user?.whatsapp_number ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{t('section.numberLabel')}</p>
            <p className="font-mono text-sm text-muted-foreground">{user.whatsapp_number}</p>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <MessageCircle className="h-4 w-4" />
            {t('section.optInButton')}
          </Button>
        )}
      </CardContent>

      <OptInModal open={modalOpen} onOpenChange={setModalOpen} defaultNumber={user?.cellphone} />
    </Card>
  )
}
