import { useTranslation } from 'react-i18next'
import { MessageCircle, Mail, Monitor } from 'lucide-react'

export function MulticanalSection() {
  const { t } = useTranslation('landing')

  const channels = [
    {
      icon: MessageCircle,
      title: t('multicanal.whatsappTitle'),
      body: t('multicanal.whatsappBody'),
      highlight: true
    },
    { icon: Mail, title: t('multicanal.emailTitle'), body: t('multicanal.emailBody') },
    { icon: Monitor, title: t('multicanal.webTitle'), body: t('multicanal.webBody') }
  ]

  return (
    <section className="bg-background px-6 py-16 text-center lg:py-20">
      <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {t('multicanal.title')}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t('multicanal.subtitle')}</p>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
        {channels.map(({ icon: Icon, title, body, highlight }) => (
          <div
            key={title}
            className={`rounded-2xl border p-6 text-left ${
              highlight
                ? 'border-emerald-500/40 bg-primary/5 ring-2 ring-emerald-500/20'
                : 'border-border bg-background'
            }`}
          >
            <Icon className="h-6 w-6 text-emerald-500" />
            <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
