import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Lightbulb, Shield, Check, ChevronRight } from 'lucide-react'

interface RadarNotificationsProps {
  compact?: boolean
}

export function RadarNotifications({ compact = false }: RadarNotificationsProps = {}) {
  const { t, i18n } = useTranslation('landing')
  const isPtBR = i18n.language.startsWith('pt')

  return (
    <div className={compact ? 'scale-75 origin-top-left pointer-events-none' : ''}>
    <div className="flex flex-col gap-2.5" aria-hidden="true" role="presentation">
      {/* Card 1 — New job, not yet analyzed */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white border border-emerald-300 rounded-xl p-4 shadow-[0_2px_8px_rgba(16,185,129,0.06)]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.65rem] text-emerald-500 font-semibold">
            {isPtBR ? 'há 1 min' : '1 min ago'} · careers.nubank.com
          </span>
          <span className="bg-emerald-500 text-white text-[0.6rem] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
            {t('valueFeatures.radar.newBadge')}
          </span>
        </div>
        <p className="text-[0.85rem] font-bold text-zinc-900 mb-1">Senior Frontend Developer</p>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[0.7rem] font-semibold text-zinc-900">Nubank</span>
          <span className="text-[0.6rem] text-zinc-400">• São Paulo, SP • {isPtBR ? 'Remoto' : 'Remote'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['React', 'TypeScript', 'Node.js'].map((tag) => (
            <span
              key={tag}
              className="bg-emerald-50 text-emerald-800 text-[0.6rem] px-2 py-0.5 rounded-md border border-emerald-300 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          className="w-full py-2 rounded-lg border border-emerald-300 text-emerald-800 text-[0.75rem] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' }}
          tabIndex={-1}
        >
          <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
          {t('valueFeatures.radar.analyzeButton')}
        </button>
      </motion.div>

      {/* Card 2 — Already analyzed, shows match */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-white border border-zinc-200 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.65rem] text-zinc-500">
            {isPtBR ? 'há 12 min' : '12 min ago'} · carreiras.ifood.com.br
          </span>
          <span className="bg-emerald-50 text-emerald-800 text-[0.6rem] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 inline-flex items-center gap-1">
            <Check className="w-2.5 h-2.5 text-emerald-500" />
            98% {t('valueFeatures.radar.matchBadge')}
          </span>
        </div>
        <p className="text-[0.85rem] font-bold text-zinc-900 mb-1">Product Designer Pleno</p>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[0.7rem] font-semibold text-zinc-900">iFood</span>
          <span className="text-[0.6rem] text-zinc-400">• Campinas, SP • {isPtBR ? 'Híbrido' : 'Hybrid'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-zinc-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full origin-left"
              style={{ width: '98%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
            />
          </div>
          <span className="text-[0.65rem] text-emerald-500 font-semibold whitespace-nowrap inline-flex items-center gap-0.5">
            {t('valueFeatures.radar.viewAnalysis')}
            <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </motion.div>

      {!compact && (
        <>
          {/* Card 3 — Faded / older */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="bg-zinc-50 border border-zinc-100 rounded-xl p-4"
          >
            <div className="opacity-50">
              <span className="text-[0.65rem] text-zinc-400 block mb-2">
                {isPtBR ? 'há 38 min' : '38 min ago'} · carreiras.mercadolivre.com
              </span>
              <p className="text-[0.85rem] font-bold text-zinc-500 mb-1">Data Engineer Senior</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[0.7rem] font-semibold text-zinc-500">Mercado Livre</span>
                <span className="text-[0.6rem] text-zinc-400">• São Paulo, SP</span>
              </div>
            </div>
          </motion.div>

          {/* Source badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="flex items-center gap-2 mt-1 px-3 py-2 bg-white border border-emerald-200 rounded-lg"
          >
            <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="text-[0.65rem] text-emerald-800 font-semibold">
              {t('valueFeatures.radar.sourceBadge')}
            </span>
          </motion.div>
        </>
      )}
    </div>
    </div>
  )
}
