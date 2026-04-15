import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Check } from 'lucide-react'

function AnimatedScore({ target, inView }: { target: number; inView: boolean }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 1500
    const animate = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setValue(Math.round(target * eased))
      if (elapsed < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, target])

  return <>{value}</>
}

function AnimatedProgressBar({ width, inView }: { width: number; inView: boolean }) {
  return (
    <div className="bg-zinc-200 rounded-full h-1.5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${width}%` } : { width: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
      />
    </div>
  )
}

const keywords = ['React', 'TypeScript', 'CI/CD', 'Agile']
const gaps = ['GraphQL', 'AWS']

export function AtsAnalysisCard() {
  const { t } = useTranslation('landing')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const score = 92
  const degrees = Math.round((score / 100) * 360)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 border border-emerald-300 shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
      style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)' }}
      aria-hidden="true"
      role="presentation"
    >
      {/* Score header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-[0.7rem] text-zinc-500 uppercase tracking-wider">
            {t('valueFeatures.ats.scoreLabel')}
          </p>
          <p className="text-[2rem] font-extrabold font-display text-zinc-900 leading-none mt-1">
            <AnimatedScore target={score} inView={isInView} />
            <span className="text-base text-emerald-500">%</span>
          </p>
        </div>
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
          style={{
            background: isInView
              ? `conic-gradient(#10b981 0deg ${degrees}deg, #e4e4e7 ${degrees}deg 360deg)`
              : '#e4e4e7',
            transition: 'background 1.5s ease-out',
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Check className="w-[18px] h-[18px] text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <AnimatedProgressBar width={score} inView={isInView} />

      {/* Keywords */}
      <div className="mt-5">
        <p className="text-[0.7rem] font-semibold text-zinc-900 mb-2">
          {t('valueFeatures.ats.keywordsLabel')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="bg-emerald-100 text-emerald-800 text-[0.65rem] px-2 py-0.5 rounded-md font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Gaps */}
      <div className="mt-4">
        <p className="text-[0.7rem] font-semibold text-zinc-900 mb-2">
          {t('valueFeatures.ats.gapsLabel')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {gaps.map((g) => (
            <span
              key={g}
              className="bg-amber-50 text-amber-800 text-[0.65rem] px-2 py-0.5 rounded-md font-medium border border-dashed border-amber-400"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
