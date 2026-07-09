import { useTranslation } from 'react-i18next'
import { NorteChat, type NorteMessage } from './ui-snippets/norte-chat'

type Capability = {
  title: string
  body: string
  messages: NorteMessage[]
}

export function NorteCapabilitiesSection() {
  const { t } = useTranslation('landing')

  const capabilities: Capability[] = [
    {
      title: t('norteDoes.alertTitle'),
      body: t('norteDoes.alertBody'),
      messages: [
        { from: 'norte', text: '3 vagas novas de Backend hoje 👀' },
        { from: 'norte', text: 'Nubank, iFood e Stone. Quer ver?' }
      ]
    },
    {
      title: t('norteDoes.matchTitle'),
      body: t('norteDoes.matchBody'),
      messages: [
        { from: 'user', text: 'analisa meu cv pra vaga do nubank' },
        { from: 'norte', text: '🎯 92% match\n✅ Go, Postgres, K8s\n⚠️ falta: pagamentos' }
      ]
    },
    {
      title: t('norteDoes.pdfTitle'),
      body: t('norteDoes.pdfBody'),
      messages: [
        { from: 'user', text: 'manda o cv otimizado' },
        { from: 'norte', text: 'Prontinho 👇', pdf: 'CV_Nubank.pdf' }
      ]
    }
  ]

  return (
    <section className="bg-zinc-50 px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-emerald-600">
          {t('norteDoes.overline')}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-zinc-900 sm:text-3xl">
          {t('norteDoes.title')}
        </h2>
      </div>

      <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-12">
        {capabilities.map((cap, i) => (
          <div key={cap.title} className="grid items-center gap-8 md:grid-cols-2">
            <div className={i % 2 === 1 ? 'md:order-2' : ''}>
              <h3 className="text-xl font-semibold text-zinc-900">{cap.title}</h3>
              <p className="mt-3 text-zinc-500">{cap.body}</p>
            </div>
            <div className={`mx-auto w-full max-w-xs ${i % 2 === 1 ? 'md:order-1' : ''}`}>
              <NorteChat messages={cap.messages} showHeader={false} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
