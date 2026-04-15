import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Search,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Plus,
  Mail,
  RefreshCw,
} from 'lucide-react'

const matchedKeywords = ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'CI/CD', 'Agile']
const missingKeywords = ['Payments', 'FinTech', 'Technical leadership', 'Observability', 'Security']

export function AtsAnalysisCard() {
  const { t } = useTranslation('landing')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const score = 65
  const circumference = 2 * Math.PI * 27 // r=27
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-emerald-300 shadow-[0_8px_32px_rgba(16,185,129,0.08)] overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)' }}
      aria-hidden="true"
      role="presentation"
    >
      <div className="p-5 space-y-4">
        {/* Score Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-xl"
        >
          <div className="relative w-16 h-16 shrink-0">
            <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
              <circle cx="32" cy="32" r="27" fill="none" stroke="#e4e4e7" strokeWidth="4.5" />
              <circle
                cx="32"
                cy="32"
                r="27"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={isInView ? dashOffset : circumference}
                className="transition-[stroke-dashoffset] duration-[1.5s] ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xl font-extrabold text-amber-500">{score}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span className="bg-amber-100 text-amber-800 text-[0.6rem] font-semibold px-2 py-0.5 rounded-md border border-amber-200">
                {t('valueFeatures.ats.scoreBadge')}
              </span>
            </div>
            <p className="text-[0.6rem] text-zinc-500 leading-relaxed line-clamp-3">
              {t('valueFeatures.ats.scoreSummary')}
            </p>
          </div>
        </motion.div>

        {/* ATS Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center">
              <Search className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-[0.65rem] font-bold text-zinc-900">{t('valueFeatures.ats.keywordsTitle')}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[0.55rem] px-2 py-1 rounded-md border border-emerald-300 font-medium"
              >
                <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                {kw}
              </span>
            ))}
            {missingKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[0.55rem] px-2 py-1 rounded-md border border-red-200 font-medium"
              >
                <Plus className="w-2.5 h-2.5 text-red-500" />
                {kw}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Pontos Fortes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-[0.65rem] font-bold text-zinc-900">{t('valueFeatures.ats.strengthsTitle')}</span>
          </div>
          <div className="space-y-1.5">
            {[
              { title: t('valueFeatures.ats.strength1Title'), desc: t('valueFeatures.ats.strength1Desc') },
              { title: t('valueFeatures.ats.strength2Title'), desc: t('valueFeatures.ats.strength2Desc') },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="text-[0.55rem] text-zinc-900 leading-relaxed">
                  <strong>{item.title}</strong>
                  <span className="text-zinc-500"> — {item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lacunas e Melhorias */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
            </div>
            <span className="text-[0.65rem] font-bold text-zinc-900">{t('valueFeatures.ats.gapsTitle')}</span>
          </div>
          <div className="space-y-1.5">
            {[
              { title: t('valueFeatures.ats.gap1Title'), desc: t('valueFeatures.ats.gap1Desc') },
              { title: t('valueFeatures.ats.gap2Title'), desc: t('valueFeatures.ats.gap2Desc') },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="text-[0.55rem] text-zinc-900 leading-relaxed">
                  <strong>{item.title}</strong>
                  <span className="text-zinc-500"> — {item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sugestões para o Currículo */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.65 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center">
                <Lightbulb className="w-3 h-3 text-blue-500" />
              </div>
              <span className="text-[0.65rem] font-bold text-zinc-900">{t('valueFeatures.ats.suggestionsTitle')}</span>
            </div>
            <span className="text-[0.5rem] text-zinc-500">{t('valueFeatures.ats.suggestionsCount')}</span>
          </div>
          <div className="space-y-1.5">
            {/* Suggestion 1 — selected */}
            <div className="px-3 py-2.5 bg-blue-50 border border-blue-200 border-l-[3px] border-l-blue-500 rounded-lg">
              <div className="flex items-start gap-2">
                <input type="checkbox" checked readOnly className="w-3 h-3 accent-emerald-500 mt-0.5" tabIndex={-1} />
                <div>
                  <p className="text-[0.55rem] text-zinc-900 font-semibold mb-1">{t('valueFeatures.ats.suggestion1Text')}</p>
                  <span className="inline-block bg-zinc-100 text-zinc-600 text-[0.5rem] px-1.5 py-0.5 rounded font-medium mb-1">
                    {t('valueFeatures.ats.suggestion1Section')}
                  </span>
                  <p className="text-[0.5rem] text-zinc-500 italic pl-2 border-l border-zinc-200">
                    "{t('valueFeatures.ats.suggestion1Example')}"
                  </p>
                </div>
              </div>
            </div>
            {/* Suggestion 2 — not selected */}
            <div className="px-3 py-2.5 bg-white border border-zinc-200 border-l-[3px] border-l-zinc-300 rounded-lg">
              <div className="flex items-start gap-2">
                <input type="checkbox" readOnly className="w-3 h-3 mt-0.5" tabIndex={-1} />
                <div>
                  <p className="text-[0.55rem] text-zinc-900 font-semibold mb-1">{t('valueFeatures.ats.suggestion2Text')}</p>
                  <span className="inline-block bg-zinc-100 text-zinc-600 text-[0.5rem] px-1.5 py-0.5 rounded font-medium">
                    {t('valueFeatures.ats.suggestion2Section')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Considerações Finais */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center">
              <Search className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-[0.65rem] font-bold text-zinc-900">{t('valueFeatures.ats.finalTitle')}</span>
          </div>
          <p className="text-[0.55rem] text-zinc-500 leading-relaxed">{t('valueFeatures.ats.finalText')}</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="pt-3 border-t border-zinc-200 space-y-2"
        >
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 px-3 rounded-lg border-0 text-white text-[0.6rem] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              tabIndex={-1}
            >
              <Mail className="w-3 h-3" />
              {t('valueFeatures.ats.sendEmailButton')}
            </button>
            <button
              className="py-2 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-500 text-[0.6rem] font-semibold flex items-center gap-1.5 cursor-pointer"
              tabIndex={-1}
            >
              <RefreshCw className="w-3 h-3" />
              {t('valueFeatures.ats.redoButton')}
            </button>
          </div>
          <button
            className="w-full py-2.5 rounded-lg border-0 text-white text-[0.65rem] font-bold cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            tabIndex={-1}
          >
            {t('valueFeatures.ats.applyButton')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
