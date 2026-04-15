import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Bell, Shield } from 'lucide-react'

const notifications = [
  {
    title: 'Senior Frontend Developer',
    company: 'Nubank',
    source: 'careers.nubank.com',
    time: 'há 1 min',
    timeEn: '1 min ago',
    badge: 'new' as const,
    highlighted: true,
  },
  {
    title: 'Product Designer Pleno',
    company: 'iFood',
    source: 'carreiras.ifood.com.br',
    time: 'há 12 min',
    timeEn: '12 min ago',
    badge: 'match' as const,
    highlighted: false,
  },
  {
    title: 'Data Engineer Senior',
    company: 'Mercado Livre',
    source: 'carreiras.mercadolivre.com',
    time: 'há 38 min',
    timeEn: '38 min ago',
    badge: null,
    highlighted: false,
  },
]

export function RadarNotifications() {
  const { t, i18n } = useTranslation('landing')
  const isPtBR = i18n.language.startsWith('pt')

  return (
    <div className="flex flex-col gap-3" aria-hidden="true" role="presentation">
      {notifications.map((n, i) => (
        <motion.div
          key={n.company}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className={`rounded-xl p-4 flex items-center gap-3 border ${
            n.highlighted
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.1)]'
              : 'bg-zinc-50 border-zinc-200'
          } ${i === 2 ? 'opacity-50' : ''}`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              n.highlighted ? 'bg-emerald-500' : 'bg-zinc-200'
            }`}
          >
            <Bell className={`w-[18px] h-[18px] ${n.highlighted ? 'text-white' : 'text-zinc-500'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${i === 2 ? 'text-zinc-400' : 'text-zinc-900'}`}>
              {n.title}
            </p>
            <p className={`text-xs ${i === 2 ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {n.company} · <span className={n.highlighted ? 'text-emerald-500 font-semibold' : ''}>{n.source}</span> · {isPtBR ? n.time : n.timeEn}
            </p>
          </div>

          {n.badge === 'new' && (
            <span className="bg-emerald-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full">
              NOVO
            </span>
          )}
          {n.badge === 'match' && (
            <span className="bg-zinc-100 text-zinc-500 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full">
              98% match
            </span>
          )}
        </motion.div>
      ))}

      {/* Source badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex items-center gap-2 mt-2 px-3 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 rounded-lg"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-[0.7rem] text-emerald-800 font-semibold">
          {t('valueFeatures.radar.sourceBadge')}
        </span>
      </motion.div>
    </div>
  )
}
