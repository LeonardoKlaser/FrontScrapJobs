import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { useCountUp } from '@/hooks/useCountUp'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import type { RecentJob } from '@/services/publicJobsService'
import { cleanCompanyName, companyInitial, postedAgoKey } from './live-jobs-helpers'

export type PanelState = 'loading' | 'live' | 'fallback' | 'empty'

interface LiveJobsPanelProps {
  state: PanelState
  jobs: RecentJob[]
  todayCount: number
  areaLabel: string
  onClearFilter: () => void
}

const SKELETON_ROWS = 4

export function LiveJobsPanel({
  state,
  jobs,
  todayCount,
  areaLabel,
  onClearFilter
}: LiveJobsPanelProps) {
  const { t } = useTranslation('landing')
  const [ref, inView] = useInViewOnce<HTMLDivElement>()
  const count = useCountUp({ target: todayCount, inView })

  // O contador só aparece com state === 'live' e todayCount > 0: as duas
  // queries do backend têm janelas diferentes (lista de vagas sem limite de
  // tempo, contador restrito a 24h), então um dia calmo pode ter vagas
  // visíveis com today_count 0 — e um badge "0 vagas · últimas 24h" ao lado
  // de vagas visíveis se contradiz.
  const showCounter = state === 'live' && todayCount > 0

  return (
    <div
      ref={ref}
      aria-label={t('hero.panel.ariaLabel')}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        {state === 'loading' ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {state === 'live' && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
            )}
            {state === 'live' ? t('hero.panel.live') : t('hero.panel.example')}
          </span>
        )}
        {showCounter && (
          <span className="text-xs font-semibold text-emerald-600">
            {t('hero.panel.count', { count })}
          </span>
        )}
      </div>

      <div aria-live="polite">
        {state === 'loading' && (
          <ul className="divide-y divide-border">
            {Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {state === 'empty' && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {t('hero.panel.empty', { area: areaLabel })}
            </p>
            <button
              type="button"
              onClick={onClearFilter}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              {t('hero.panel.clearFilter')}
            </button>
          </div>
        )}

        {(state === 'live' || state === 'fallback') && (
          <ul className="divide-y divide-border">
            {jobs.map((job, index) => {
              const company = cleanCompanyName(job.company)
              const ago = postedAgoKey(job.posted_hours_ago)

              return (
                <li key={`${company}-${index}`} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md
                      bg-white text-xs font-bold text-zinc-500 ring-1 ring-border"
                  >
                    {job.logo_url ? (
                      <img
                        src={job.logo_url}
                        alt=""
                        aria-hidden
                        className="h-7 w-7 object-contain"
                      />
                    ) : (
                      companyInitial(job.company)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">{job.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {/* company e o tempo relativo em <span> próprios: se ficarem como
                          texto solto no mesmo <p>, viram um único nó de texto concatenado
                          e o RTL não consegue encontrar "QuintoAndar" ou "há 5h" sozinhos */}
                      <span>{company}</span>
                      {state === 'live' && (
                        <>
                          {' · '}
                          <span>{t(ago.key, { count: ago.count })}</span>
                        </>
                      )}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
