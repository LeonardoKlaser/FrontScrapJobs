import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Check } from 'lucide-react'

export function PdfPreviewCard() {
  const { t } = useTranslation('landing')

  const suggestions = [
    t('valueFeatures.pdf.suggestion1'),
    t('valueFeatures.pdf.suggestion2'),
    t('valueFeatures.pdf.suggestion3'),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 border border-emerald-300 shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
      style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)' }}
      aria-hidden="true"
      role="presentation"
    >
      {/* Document header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-emerald-200">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
        >
          <FileText className="w-[18px] h-[18px] text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{t('valueFeatures.pdf.fileName')}</p>
          <p className="text-[0.65rem] text-emerald-500 font-semibold">{t('valueFeatures.pdf.fileReady')}</p>
        </div>
      </div>

      {/* Suggestions checklist */}
      <div className="mb-4">
        <p className="text-[0.7rem] font-semibold text-zinc-900 mb-2">
          {t('valueFeatures.pdf.suggestionsLabel')}
        </p>
        <div className="flex flex-col gap-1.5">
          {suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2 bg-white border border-emerald-200 rounded-lg px-3 py-2"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[0.7rem] text-zinc-900">{s}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA button */}
      <button
        className="w-full text-white border-0 rounded-xl py-3 text-sm font-bold font-display cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-shadow"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        tabIndex={-1}
      >
        {t('valueFeatures.pdf.downloadButton')}
      </button>
    </motion.div>
  )
}
