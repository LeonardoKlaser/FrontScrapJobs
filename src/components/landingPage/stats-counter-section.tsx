import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Briefcase } from 'lucide-react'
import { usePublicStats } from '@/hooks/usePublicStats'
import { SectionWrapper } from './section-wrapper'

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!target || hasAnimated.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    const el = ref.current
    if (el) observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
    }
  }, [target, duration])

  return { count, ref }
}

export function StatsCounterSection() {
  const { t, i18n } = useTranslation('landing')
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'
  const formatNumber = (num: number) => num.toLocaleString(locale)
  const { data: stats, error: statsError } = usePublicStats()
  useEffect(() => {
    if (statsError) {
      console.error(
        '[StatsCounterSection] usePublicStats failed:',
        statsError instanceof Error ? statsError.message : statsError
      )
    }
  }, [statsError])

  const sites = useCountUp(stats?.monitored_sites ?? 0)
  const jobs = useCountUp(stats?.total_jobs ?? 0)

  if (!stats) return null

  return (
    <SectionWrapper className="bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <div className="relative py-16 lg:py-20 px-6 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px]
            -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-[120px]"
        />
        <div
          className="relative max-w-6xl mx-auto flex flex-col sm:flex-row items-center
            justify-around gap-12 sm:gap-10"
        >
          <div ref={sites.ref} className="flex flex-col items-center gap-3 animate-fade-in-up">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10
                ring-1 ring-emerald-500/20"
            >
              <Globe className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="font-display text-5xl font-bold text-zinc-900 tabular-nums">
              {formatNumber(sites.count)}
            </span>
            <span className="text-base font-medium text-zinc-600">{t('stats.sitesAnalyzed')}</span>
          </div>

          <div
            aria-hidden="true"
            className="hidden sm:block h-20 w-px bg-gradient-to-b from-transparent
              via-emerald-500/30 to-transparent"
          />

          <div
            ref={jobs.ref}
            className="flex flex-col items-center gap-3 animate-fade-in-up [animation-delay:150ms]"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10
                ring-1 ring-emerald-500/20"
            >
              <Briefcase className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="font-display text-5xl font-bold text-zinc-900 tabular-nums">
              {formatNumber(jobs.count)}
            </span>
            <span className="text-base font-medium text-zinc-600">{t('stats.jobsCollected')}</span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
