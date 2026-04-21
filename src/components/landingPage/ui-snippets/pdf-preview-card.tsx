import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Lightbulb, Check, Download, Mail } from 'lucide-react'

function ScoreRing({
  score,
  color,
  inView,
  delay
}: {
  score: number
  color: string
  inView: boolean
  delay: number
}) {
  const circumference = 2 * Math.PI * 17 // r=17
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-11 h-11 mx-auto">
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r="17" fill="none" stroke="#e4e4e7" strokeWidth="3.5" />
        <circle
          cx="22"
          cy="22"
          r="17"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={inView ? dashOffset : circumference}
          style={{ transition: `stroke-dashoffset 1.5s ease ${delay}s` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-[0.75rem] font-extrabold" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  )
}

export function PdfPreviewCard() {
  const { t } = useTranslation('landing')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-emerald-300 shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
      style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)' }}
      aria-hidden="true"
      role="presentation"
    >
      <div className="p-5">
        {/* Step 1: AI Optimization Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-emerald-300 rounded-xl p-4 mb-2"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
            >
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span className="text-[0.65rem] font-bold text-zinc-900">
              {t('valueFeatures.pdf.aiOptimizedTitle')}
            </span>
          </div>

          {/* Score before → after */}
          <div className="flex items-center justify-center gap-4 py-2 mb-3 bg-zinc-50 rounded-lg">
            {/* Before */}
            <div className="text-center">
              <ScoreRing score={65} color="#f59e0b" inView={isInView} delay={0.3} />
              <span className="text-[0.45rem] text-amber-500 font-semibold">
                {t('valueFeatures.pdf.scoreBefore')}
              </span>
            </div>
            {/* Arrow */}
            <div className="flex flex-col items-center gap-0.5">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
              <span className="text-[0.5rem] text-emerald-500 font-extrabold">+27</span>
            </div>
            {/* After */}
            <div className="text-center">
              <ScoreRing score={92} color="#10b981" inView={isInView} delay={0.6} />
              <span className="text-[0.45rem] text-emerald-500 font-semibold">
                {t('valueFeatures.pdf.scoreAfter')}
              </span>
            </div>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-1">
            {['pill1', 'pill2', 'pill3'].map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[0.5rem] px-2 py-0.5 rounded-md font-medium"
              >
                <Check className="w-2 h-2 text-emerald-500" />
                {t(`valueFeatures.pdf.${key}`)}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Connector line */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="flex justify-center"
        >
          <div
            className="w-0.5 h-4"
            style={{ background: 'linear-gradient(180deg, #a7f3d0, #d1fae5)' }}
          />
        </motion.div>

        {/* Step 2: Template Selector */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white border border-zinc-200 rounded-xl p-4 mb-2"
        >
          <span className="text-[0.6rem] font-bold text-zinc-900 block mb-3">
            {t('valueFeatures.pdf.templatePrompt')}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Moderno (selected) */}
            <div className="bg-white border-2 border-emerald-500 rounded-lg p-2 text-center relative cursor-pointer">
              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
              <div className="w-full aspect-[794/1123] bg-white border border-zinc-200 rounded mx-auto mb-1 p-1.5 shadow-sm">
                <div className="h-1 w-2/3 bg-[#0f9d8f] rounded-sm mb-0.5" />
                <div className="h-0.5 w-1/3 bg-[#0f9d8f] opacity-50 rounded-sm mb-1" />
                <div className="h-px bg-zinc-200 mb-1" />
                <div className="h-0.5 w-[90%] bg-zinc-200 rounded-sm mb-0.5" />
                <div className="h-0.5 w-[72%] bg-zinc-200 rounded-sm mb-1" />
                <div className="flex gap-0.5 flex-wrap mb-1">
                  <div className="h-1.5 w-3 bg-emerald-100 border border-emerald-200 rounded-sm" />
                  <div className="h-1.5 w-4 bg-emerald-100 border border-emerald-200 rounded-sm" />
                  <div className="h-1.5 w-2.5 bg-emerald-100 border border-emerald-200 rounded-sm" />
                </div>
                <div className="h-0.5 w-1/2 bg-zinc-800 rounded-sm mb-0.5" />
                <div className="h-0.5 w-[86%] bg-zinc-200 rounded-sm mb-0.5" />
                <div className="h-0.5 w-[68%] bg-zinc-200 rounded-sm" />
              </div>
              <span className="text-[0.5rem] text-emerald-500 font-semibold">
                {t('valueFeatures.pdf.templateModerno')}
              </span>
            </div>

            {/* Clássico */}
            <div className="bg-white border border-zinc-200 rounded-lg p-2 text-center cursor-pointer">
              <div className="w-full aspect-[794/1123] bg-white border border-zinc-200 rounded mx-auto mb-1 p-1.5 shadow-sm overflow-hidden">
                <div className="h-3 bg-[#1b2640] rounded-sm mb-1 flex items-center justify-center">
                  <div className="h-0.5 w-2/3 bg-white rounded-sm" />
                </div>
                <div className="h-px bg-[#c4a35a] mb-1" />
                <div className="h-0.5 w-[90%] bg-zinc-200 rounded-sm mb-0.5" />
                <div className="h-0.5 w-[75%] bg-zinc-200 rounded-sm mb-1" />
                <div className="h-0.5 w-[55%] bg-[#1b2640] opacity-30 rounded-sm mb-0.5" />
                <div className="h-0.5 w-[85%] bg-zinc-200 rounded-sm mb-0.5" />
                <div className="h-0.5 w-[65%] bg-zinc-200 rounded-sm" />
              </div>
              <span className="text-[0.5rem] text-zinc-500 font-medium">
                {t('valueFeatures.pdf.templateClassico')}
              </span>
            </div>

            {/* Criativo */}
            <div className="bg-white border border-zinc-200 rounded-lg p-2 text-center cursor-pointer">
              <div className="w-full aspect-[794/1123] bg-white border border-zinc-200 rounded mx-auto mb-1 overflow-hidden flex shadow-sm">
                <div
                  className="w-[35%] p-1"
                  style={{ background: 'linear-gradient(180deg, #0f9d8f, #0a7b71)' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20 mx-auto mb-1" />
                  <div className="h-0.5 w-[80%] bg-white/30 rounded-sm mb-0.5" />
                  <div className="h-0.5 w-[60%] bg-white/20 rounded-sm mb-1" />
                  <div className="h-0.5 w-[70%] bg-white/20 rounded-sm mb-0.5" />
                  <div className="h-0.5 w-[50%] bg-white/15 rounded-sm" />
                </div>
                <div className="flex-1 p-1.5">
                  <div className="h-0.5 w-[80%] bg-zinc-800 rounded-sm mb-0.5" />
                  <div className="h-0.5 w-[90%] bg-zinc-200 rounded-sm mb-0.5" />
                  <div className="h-0.5 w-[70%] bg-zinc-200 rounded-sm mb-1" />
                  <div className="h-0.5 w-[50%] bg-zinc-800 opacity-30 rounded-sm mb-0.5" />
                  <div className="h-0.5 w-[85%] bg-zinc-200 rounded-sm mb-0.5" />
                  <div className="h-0.5 w-[60%] bg-zinc-200 rounded-sm" />
                </div>
              </div>
              <span className="text-[0.5rem] text-zinc-500 font-medium">
                {t('valueFeatures.pdf.templateCriativo')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Connector line */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.55 }}
          className="flex justify-center"
        >
          <div
            className="w-0.5 h-4"
            style={{ background: 'linear-gradient(180deg, #d1fae5, #a7f3d0)' }}
          />
        </motion.div>

        {/* Step 3: Generate PDF CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.65 }}
        >
          <button
            className="w-full py-3 rounded-xl border-0 text-white text-[0.75rem] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_rgba(16,185,129,0.3)]"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            tabIndex={-1}
          >
            <Download className="w-3.5 h-3.5" />
            {t('valueFeatures.pdf.generateButton')} — {t('valueFeatures.pdf.templateModerno')}
          </button>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Mail className="w-2.5 h-2.5 text-zinc-400" />
            <span className="text-[0.5rem] text-zinc-400">{t('valueFeatures.pdf.emailHint')}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
