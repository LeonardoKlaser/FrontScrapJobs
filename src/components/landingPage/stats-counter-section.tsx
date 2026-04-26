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
    <SectionWrapper variant="dark">
      <div className="py-20 lg:py-28 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-10">
          <div ref={sites.ref} className="flex flex-col items-center gap-3 animate-fade-in-up">
            <Globe className="h-8 w-8 text-emerald-400" />
            <span className="font-display text-5xl font-semibold text-white tabular-nums">
              {formatNumber(sites.count)}
            </span>
            <span className="text-base text-white/60">{t('stats.sitesAnalyzed')}</span>
          </div>

          <div
            ref={jobs.ref}
            className="flex flex-col items-center gap-3 animate-fade-in-up [animation-delay:150ms]"
          >
            <Briefcase className="h-8 w-8 text-emerald-400" />
            <span className="font-display text-5xl font-semibold text-white tabular-nums">
              {formatNumber(jobs.count)}
            </span>
            <span className="text-base text-white/60">{t('stats.jobsCollected')}</span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
