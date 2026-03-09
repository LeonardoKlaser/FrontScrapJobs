import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Briefcase } from 'lucide-react'
import { usePublicStats } from '@/hooks/usePublicStats'

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

function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR')
}

export function StatsCounterSection() {
  const { t } = useTranslation('landing')
  const { data: stats } = usePublicStats()

  const sites = useCountUp(stats?.total_sites ?? 0)
  const jobs = useCountUp(stats?.total_jobs ?? 0)

  if (!stats) return null

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="grid grid-cols-2 gap-6">
          <div
            ref={sites.ref}
            className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-6 animate-fade-in-up"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <span className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
              {formatNumber(sites.count)}
            </span>
            <span className="text-sm text-muted-foreground">{t('stats.sitesAnalyzed')}</span>
          </div>

          <div
            ref={jobs.ref}
            className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-6 animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <span className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
              {formatNumber(jobs.count)}
            </span>
            <span className="text-sm text-muted-foreground">{t('stats.jobsCollected')}</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">{t('stats.trustLine')}</p>
      </div>
    </section>
  )
}
